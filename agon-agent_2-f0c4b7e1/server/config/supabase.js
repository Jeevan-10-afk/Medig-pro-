import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = process.env.FULLSTACK_PROJECT_REF || '';
const restoreUrl = process.env.FULLSTACK_RESTORE_API_URL || '';

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Database configuration missing. Please ensure VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
}

let _restoreTriggered = false;

export function triggerRestore() {
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

const supabase = createClient(safeSupabaseUrl, safeSupabaseKey, {
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

export default supabase;
