import supabase from '../db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { email, password } = req.body;
    
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
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
}