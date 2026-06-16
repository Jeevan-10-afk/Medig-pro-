import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = process.env.FULLSTACK_PROJECT_REF || '';
const restoreUrl = process.env.FULLSTACK_RESTORE_API_URL || '';

const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseServiceKey || supabaseServiceKey.includes('placeholder');

let supabase;

if (!isPlaceholder) {
  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('Database configuration missing. Please ensure VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }

  let _restoreTriggered = false;

  const triggerRestore = () => {
    if (_restoreTriggered || !projectRef || !restoreUrl) return;
    _restoreTriggered = true;
    logger.warn('Triggering database restore hook due to database connection issue...');
    fetch(restoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_ref: projectRef }),
    })
      .then((res) => {
        logger.info(`Database restore trigger response status: ${res.status}`);
      })
      .catch((err) => {
        logger.error('Failed to trigger database restore:', err);
      });
    setTimeout(() => {
      _restoreTriggered = false;
    }, 60000);
  }

  const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
  const safeSupabaseKey = supabaseServiceKey || 'placeholder-key';

  supabase = createClient(safeSupabaseUrl, safeSupabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (url, options) => {
        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error('Supabase credentials are not configured in backend .env');
        }
        try {
          const res = await fetch(url, options);
          if (!res.ok && res.status >= 500) {
            triggerRestore();
          }
          return res;
        } catch (err) {
          logger.error(`Fetch to Supabase failed: ${err.message}`);
          triggerRestore();
          throw err;
        }
      },
    },
  });
} else {
  logger.warn('⚠️ USING MOCK LOCAL DATABASE FOR MEDIG PRO+');
  
  const getFilePath = (table) => path.join(process.cwd(), 'server/data', `${table}.json`);

  const readTable = (table) => {
    try {
      const filepath = getFilePath(table);
      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, JSON.stringify([], null, 2));
        return [];
      }
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (err) {
      logger.error(`Error reading mock table ${table}: ${err.message}`);
      return [];
    }
  };

  const writeTable = (table, data) => {
    try {
      const filepath = getFilePath(table);
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (err) {
      logger.error(`Error writing mock table ${table}: ${err.message}`);
    }
  };

  class MockQueryBuilder {
    constructor(table) {
      this.table = table;
      this.filters = [];
      this.selectStr = '*';
      this.selectOptions = {};
      this.isSingle = false;
      this.orderCol = null;
      this.orderAsc = true;
      this.action = 'select'; // select, insert, update, delete
      this.payload = null;
      this.orFilter = null;
      this.limitCount = null;
    }

    select(str = '*', options = {}) {
      this.selectStr = str;
      this.selectOptions = options;
      // Only set to select if we are not doing a write operation
      if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'delete') {
        this.action = 'select';
      }
      return this;
    }

    insert(data) {
      this.payload = data;
      this.action = 'insert';
      return this;
    }

    update(data) {
      this.payload = data;
      this.action = 'update';
      return this;
    }

    delete() {
      this.action = 'delete';
      return this;
    }

    eq(field, value) {
      this.filters.push({ field, value, op: 'eq' });
      return this;
    }

    gte(field, value) {
      this.filters.push({ field, value, op: 'gte' });
      return this;
    }

    lte(field, value) {
      this.filters.push({ field, value, op: 'lte' });
      return this;
    }

    limit(count) {
      this.limitCount = count;
      return this;
    }

    or(filterStr) {
      this.orFilter = filterStr;
      return this;
    }

    order(column, { ascending = true } = {}) {
      this.orderCol = column;
      this.orderAsc = ascending;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    async execute() {
      let data = readTable(this.table);

      // Perform filters
      if (this.filters.length > 0) {
        data = data.filter(row => {
          return this.filters.every(f => {
            const val = row[f.field];
            if (f.op === 'eq') return val === f.value;
            if (f.op === 'gte') return val >= f.value;
            if (f.op === 'lte') return val <= f.value;
            return true;
          });
        });
      }

      // Perform OR filters (e.g. full_name.ilike.%search%,phone.ilike.%search%)
      if (this.orFilter) {
        // e.g. "full_name.ilike.%bob%,phone.ilike.%bob%"
        const parts = this.orFilter.split(',');
        data = data.filter(row => {
          return parts.some(part => {
            const match = part.match(/^([^.]+)\.ilike\.%?([^%]+)%?$/);
            if (!match) return false;
            const field = match[1];
            const searchVal = match[2].toLowerCase();
            if (!row[field]) return false;
            return String(row[field]).toLowerCase().includes(searchVal);
          });
        });
      }

      // Perform Order
      if (this.orderCol) {
        data.sort((a, b) => {
          const valA = a[this.orderCol];
          const valB = b[this.orderCol];
          if (valA < valB) return this.orderAsc ? -1 : 1;
          if (valA > valB) return this.orderAsc ? 1 : -1;
          return 0;
        });
      }

      // Action Handlers
      if (this.action === 'insert') {
        const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted = toInsert.map(item => {
          const record = {
            id: item.id || `${this.table.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            created_at: new Date().toISOString(),
            ...item
          };
          data.push(record);
          return record;
        });
        writeTable(this.table, data);
        
        const resData = Array.isArray(this.payload) ? inserted : inserted[0];
        return { data: resData, error: null };
      }

      if (this.action === 'update') {
        let updatedCount = 0;
        let lastUpdated = null;
        data = data.map(row => {
          // Check if filters match
          const matches = this.filters.every(f => {
            const val = row[f.field];
            if (f.op === 'eq') return val === f.value;
            if (f.op === 'gte') return val >= f.value;
            if (f.op === 'lte') return val <= f.value;
            return true;
          });
          if (matches) {
            updatedCount++;
            const updatedRow = { ...row, ...this.payload };
            lastUpdated = updatedRow;
            return updatedRow;
          }
          return row;
        });
        if (updatedCount > 0) {
          writeTable(this.table, data);
        }
        return { data: lastUpdated, error: null };
      }

      if (this.action === 'delete') {
        const initialLen = data.length;
        data = data.filter(row => {
          return !this.filters.every(f => {
            const val = row[f.field];
            if (f.op === 'eq') return val === f.value;
            if (f.op === 'gte') return val >= f.value;
            if (f.op === 'lte') return val <= f.value;
            return true;
          });
        });
        if (data.length < initialLen) {
          writeTable(this.table, data);
        }
        return { data: null, error: null };
      }

      // Select Action - resolve joins/subqueries
      // e.g. select('*, patients(full_name, patient_id, phone)')
      if (this.selectStr.includes('patients(')) {
        const patients = readTable('patients');
        data = data.map(item => {
          // Find matching patient by patient_id or id
          const patient = patients.find(p => p.id === item.patient_id || p.patient_id === item.patient_id);
          return {
            ...item,
            patients: patient || null
          };
        });
      }

      // Limit results if limit is set
      if (this.limitCount !== null) {
        data = data.slice(0, this.limitCount);
      }

      // Handle count options
      const totalCount = data.length;
      let resData = data;
      
      if (this.isSingle) {
        if (data.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
        }
        resData = data[0];
      }

      if (this.selectOptions.count === 'exact') {
        return {
          data: this.selectOptions.head ? null : resData,
          count: totalCount,
          error: null
        };
      }

      return { data: resData, error: null };
    }

    then(onFulfilled, onRejected) {
      return this.execute().then(onFulfilled, onRejected);
    }

    catch(onRejected) {
      return this.execute().catch(onRejected);
    }

    finally(onFinally) {
      return this.execute().finally(onFinally);
    }
  }

  supabase = {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        const users = readTable('user_profiles');
        const user = users.find(u => u.email === email);
        if (!user) {
          return { data: {}, error: { message: 'Invalid login credentials' } };
        }
        if (password !== 'password123') {
          return { data: {}, error: { message: 'Invalid password' } };
        }
        return {
          data: {
            session: { access_token: `mock-token-${user.id}-${Date.now()}` },
            user: { id: user.id, email: user.email }
          },
          error: null
        };
      },
      signUp: async ({ email, password, options }) => {
        const users = readTable('user_profiles');
        if (users.find(u => u.email === email)) {
          return { data: {}, error: { message: 'User already exists' } };
        }
        const newUserId = `usr-${Date.now()}`;
        return {
          data: {
            user: { id: newUserId, email }
          },
          error: null
        };
      },
      signOut: async () => {
        return { error: null };
      }
    },
    from: (table) => {
      return new MockQueryBuilder(table);
    },
    storage: {
      from: (bucket) => ({
        upload: async (filePath, fileBuffer, options) => {
          try {
            const dir = path.join(process.cwd(), 'public/uploads');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const dest = path.join(dir, path.basename(filePath));
            fs.writeFileSync(dest, fileBuffer);
            return { data: { path: filePath }, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        getPublicUrl: (filePath) => {
          return { data: { publicUrl: `/uploads/${path.basename(filePath)}` } };
        }
      })
    }
  };
}

export default supabase;
