import supabase from '../db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { email, password, ...userData } = req.body;
    
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
    if (data.user) {
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
    }
    
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: userData.role || 'patient'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
}