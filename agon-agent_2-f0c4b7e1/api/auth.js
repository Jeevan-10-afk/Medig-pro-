import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { action, email, password, ...userData } = req.body;
      
      // Login
      if (action === 'login' || req.url.includes('login')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        return res.status(200).json({
          token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'doctor',
            ...profile
          }
        });
      }
      
      // Register
      if (action === 'register' || req.url.includes('register')) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: userData.full_name,
              role: userData.role || 'patient'
            }
          }
        });
        
        if (error) throw error;
        
        // Create user profile
        await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name,
            role: userData.role || 'patient',
            phone: userData.phone,
            date_of_birth: userData.date_of_birth,
            gender: userData.gender,
            address: userData.address
          });
        
        return res.status(201).json({
          message: 'Registration successful',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: userData.role || 'patient'
          }
        });
      }
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: err.message });
  }
}