import supabase from './db-client.js';
import requireAuth from './utils/requireAuth.js';
import { patientSchema, validate } from './utils/validation.js';
import { info } from './utils/logger.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { search, id, qr_code } = req.query;
      let query = supabase.from('patients').select('*');
      
      if (id) {
        const { data, error } = await query.eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      
      if (qr_code) {
        const { data, error } = await query.eq('qr_code', qr_code).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,patient_id.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      // require auth (staff/doctor/admin)
      const user = await requireAuth(req, res);
      if (!user) return;

      const body = validate(patientSchema, req.body);
      const patientId = 'P' + Date.now().toString(36).toUpperCase();
      const qrCode = `MRN-${patientId}-${Date.now()}`;

      const { data, error } = await supabase
        .from('patients')
        .insert({ ...body, patient_id: patientId, qr_code: qrCode })
        .select()
        .single();
      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'patient_registered',
        actor_id: user.id,
        entity_type: 'patient',
        entity_id: data.id,
        details: `Patient ${data.full_name} registered by ${user.id}`
      });

      info('patient_registered', { actor: user.id, patient: data.id });

      return res.status(201).json(data);
    }
    
    if (req.method === 'PUT') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { id, ...updates } = req.body;
      const payload = validate(patientSchema, updates);
      const { data, error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'patient_updated',
        actor_id: user.id,
        entity_type: 'patient',
        entity_id: id,
        details: `Patient record updated by ${user.id}`
      });

      info('patient_updated', { actor: user.id, patient: id });

      return res.status(200).json(data);
    }
    
    if (req.method === 'DELETE') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { id } = req.body;
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'patient_deleted',
        actor_id: user.id,
        entity_type: 'patient',
        entity_id: id,
        details: `Patient deleted by ${user.id}`
      });

      info('patient_deleted', { actor: user.id, patient: id });

      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}