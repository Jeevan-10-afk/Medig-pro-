import supabase from './db-client.js';
import requireAuth from './utils/requireAuth.js';
import { medicalRecordSchema, validate } from './utils/validation.js';
import { info, error as logError } from './utils/logger.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { patient_id } = req.query;
      let query = supabase.from('medical_records').select('*, patients(full_name, patient_id)');
      
      if (patient_id) {
        query = query.eq('patient_id', patient_id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      // require auth
      const user = await requireAuth(req, res);
      if (!user) return; // requireAuth already sent response

      // validate body
      const payload = validate(medicalRecordSchema, req.body);

      const { data, error: insertErr } = await supabase
        .from('medical_records')
        .insert(payload)
        .select()
        .single();
      if (insertErr) throw insertErr;

      await supabase.from('audit_logs').insert({
        action: 'medical_record_created',
        actor_id: user.id,
        entity_type: 'medical_record',
        entity_id: data.id,
        details: `Medical record created for patient ${payload.patient_id}`
      });

      info('medical_record_created', { actor: user.id, record: data.id });

      return res.status(201).json(data);
    }
    
    if (req.method === 'PUT') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { id, ...updates } = req.body;
      const payload = validate(medicalRecordSchema, updates);

      const { data, error: updateErr } = await supabase
        .from('medical_records')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (updateErr) throw updateErr;

      await supabase.from('audit_logs').insert({
        action: 'medical_record_updated',
        actor_id: user.id,
        entity_type: 'medical_record',
        entity_id: data.id,
        details: `Medical record updated for id ${data.id}`
      });

      info('medical_record_updated', { actor: user.id, record: data.id });

      return res.status(200).json(data);
    }
    
    if (req.method === 'DELETE') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { id } = req.body;
      const { error: delErr } = await supabase.from('medical_records').delete().eq('id', id);
      if (delErr) throw delErr;

      await supabase.from('audit_logs').insert({
        action: 'medical_record_deleted',
        actor_id: user.id,
        entity_type: 'medical_record',
        entity_id: id,
        details: `Medical record deleted for id ${id}`
      });

      info('medical_record_deleted', { actor: user.id, record: id });

      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    logError('API error', { error: err && err.message });
    res.status(err.status || 500).json({ error: err.message || 'Internal error' });
  }
}