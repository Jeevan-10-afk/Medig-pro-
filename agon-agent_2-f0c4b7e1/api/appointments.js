import supabase from './db-client.js';
import requireAuth from './utils/requireAuth.js';
import { appointmentSchema, validate } from './utils/validation.js';
import { info } from './utils/logger.js';

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
      const user = await requireAuth(req, res);
      if (!user) return;

      const payload = validate(appointmentSchema, req.body);

      const { data, error } = await supabase
        .from('appointments')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        type: 'appointment_scheduled',
        title: 'New Appointment',
        message: `Appointment scheduled for ${payload.appointment_date}`,
        patient_id: payload.patient_id
      });

      await supabase.from('audit_logs').insert({
        action: 'appointment_created',
        actor_id: user.id,
        entity_type: 'appointment',
        entity_id: data.id,
        details: `Appointment scheduled by ${user.id}`
      });

      info('appointment_created', { actor: user.id, appointment: data.id });

      return res.status(201).json(data);
    }
    
    if (req.method === 'PUT') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { id, ...updates } = req.body;
      const payload = validate(appointmentSchema, updates);

      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'appointment_updated',
        actor_id: user.id,
        entity_type: 'appointment',
        entity_id: data.id,
        details: `Appointment updated by ${user.id}`
      });

      info('appointment_updated', { actor: user.id, appointment: data.id });

      return res.status(200).json(data);
    }
    
    if (req.method === 'DELETE') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { id } = req.body;
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'appointment_deleted',
        actor_id: user.id,
        entity_type: 'appointment',
        entity_id: id,
        details: `Appointment deleted by ${user.id}`
      });

      info('appointment_deleted', { actor: user.id, appointment: id });

      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}