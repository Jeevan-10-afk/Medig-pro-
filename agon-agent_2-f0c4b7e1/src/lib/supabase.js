import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseAnonKey || supabaseAnonKey.includes('placeholder');

let supabase;

if (!isPlaceholder) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Client-side Supabase Mock
  console.warn('⚠️ USING MOCK CLIENT-SIDE SUPABASE');
  
  class MockBuilder {
    constructor(table) {
      this.table = table;
    }
    
    select(str) {
      return this;
    }
    
    eq(field, val) {
      return this;
    }
    
    single() {
      const getSingle = async () => {
        if (this.table === 'user_profiles') {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              return { data: user, error: null };
            } catch (e) {}
          }
        }
        return { data: null, error: { message: 'Not found' } };
      };
      
      return {
        then: (onFulfilled) => getSingle().then(onFulfilled)
      };
    }
  }

  supabase = {
    auth: {
      getSession: async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return { data: { session: { access_token: token, user } } };
          } catch (e) {}
        }
        return { data: { session: null } };
      },
      onAuthStateChange: (callback) => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        let session = null;
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            session = { access_token: token, user };
          } catch (e) {}
        }
        
        // Trigger initial callback
        setTimeout(() => {
          callback('SIGNED_IN', session);
        }, 0);
        
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      },
      signOut: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { error: null };
      }
    },
    from: (table) => {
      return new MockBuilder(table);
    }
  };
}

export default supabase;