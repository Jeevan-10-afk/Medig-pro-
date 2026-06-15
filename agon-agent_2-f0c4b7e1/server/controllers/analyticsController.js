import supabase from '../config/supabase.js';

export async function getAnalytics(req, res, next) {
  try {
    // Get total patients count
    const { count: totalPatients, error: countErr } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (countErr) throw countErr;

    // Get today's registrations count
    const today = new Date().toISOString().split('T')[0];
    const { count: todayRegistrations, error: todayErr } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayErr) throw todayErr;

    // Get monthly registrations data (past 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: monthlyData, error: monthlyErr } = await supabase
      .from('patients')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo);

    if (monthlyErr) throw monthlyErr;

    // Get gender distribution data
    const { data: genderData, error: genderErr } = await supabase
      .from('patients')
      .select('gender');

    if (genderErr) throw genderErr;

    // Get date of birth data for age distribution
    const { data: dobData, error: dobErr } = await supabase
      .from('patients')
      .select('date_of_birth');

    if (dobErr) throw dobErr;

    // Get appointment stats
    const { count: totalAppointments, error: aptTotalErr } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (aptTotalErr) throw aptTotalErr;

    const { count: pendingAppointments, error: aptPendingErr } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (aptPendingErr) throw aptPendingErr;

    // Process age distribution
    const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    dobData?.forEach((p) => {
      if (p.date_of_birth) {
        const age = Math.floor(
          (Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      }
    });

    // Process gender distribution
    const genderGroups = {};
    genderData?.forEach((p) => {
      if (p.gender) {
        const gender = p.gender.toLowerCase();
        genderGroups[gender] = (genderGroups[gender] || 0) + 1;
      }
    });

    // Process monthly registrations by day
    const registrationsByDay = {};
    monthlyData?.forEach((p) => {
      const day = new Date(p.created_at).toISOString().split('T')[0];
      registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
    });

    res.status(200).json({
      totalPatients: totalPatients || 0,
      todayRegistrations: todayRegistrations || 0,
      totalAppointments: totalAppointments || 0,
      pendingAppointments: pendingAppointments || 0,
      ageGroups,
      genderGroups,
      registrationsByDay,
      monthlyTotal: monthlyData?.length || 0,
    });
  } catch (err) {
    next(err);
  }
}
