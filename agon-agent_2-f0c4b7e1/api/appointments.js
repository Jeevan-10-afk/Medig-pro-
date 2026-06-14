import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { patient_id, doctor_id, date, status } = req.query;
      let query = supabase.from('appointments').select('*, patients(full_name, patient_id, phone)');
      
      if (patient_id) query = query.eq('patient_id', patient_id);
      if (doctor_id) query = query.eq('doctor_id', doctor_id);
      if (date) query = query.eq('appointment_date', date);
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.order('appointment_date', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('appointments')
        .insert(req.body)
        .select()
        .single();
      if (error) throw error;
      
      // Create notification
      await supabase.from('notifications').insert({
        type: 'appointment_scheduled',
        title: 'New Appointment',
        message: `Appointment scheduled for ${req.body.appointment_date}`,
        patient_id: req.body.patient_id
      });
      
      return res.status(201).json(data);
    }
    
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}