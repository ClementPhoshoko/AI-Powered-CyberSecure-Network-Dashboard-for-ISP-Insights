const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

// Create clients (disable realtime to avoid WebSocket dependency)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    enabled: false
  }
});
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    enabled: false
  }
});

module.exports = { supabase, supabaseAdmin };
