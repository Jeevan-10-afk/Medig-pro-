import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Get total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      // Get today's registrations
      const today = new Date().toISOString().split('T')[0];
      const { count: todayRegistrations } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);
      
      // Get monthly registrations
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: monthlyData } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo);
      
      // Get gender distribution
      const { data: genderData } = await supabase
        .from('patients')
        .select('gender');
      
      // Get age distribution
      const { data: dobData } = await supabase
        .from('patients')
        .select('date_of_birth');
      
      // Get appointments stats
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });
      
      const { count: pendingAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // Process age distribution
      const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
      dobData?.forEach(p => {
        if (p.date_of_birth) {
          const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (age <= 18) ageGroups['0-18']++;
          else if (age <= 35) ageGroups['19-35']++;
          else if (age <= 50) ageGroups['36-50']++;
          else if (age <= 65) ageGroups['51-65']++;
          else ageGroups['65+']++;
        }
      });
      
      // Process gender distribution
      const genderGroups = {};
      genderData?.forEach(p => {
        if (p.gender) {
          genderGroups[p.gender] = (genderGroups[p.gender] || 0) + 1;
        }
      });
      
      // Process monthly registrations by day
      const registrationsByDay = {};
      monthlyData?.forEach(p => {
        const day = new Date(p.created_at).toISOString().split('T')[0];
        registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
      });
      
      return res.status(200).json({
        totalPatients,
        todayRegistrations,
        totalAppointments,
        pendingAppointments,
        ageGroups,
        genderGroups,
        registrationsByDay,
        monthlyTotal: monthlyData?.length || 0
      });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}