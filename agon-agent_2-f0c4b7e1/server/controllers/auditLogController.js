import supabase from '../config/supabase.js';

export async function getAuditLogs(req, res, next) {
  const { entity_type, entity_id, action } = req.query;

  try {
    let query = supabase.from('audit_logs').select('*');

    if (entity_type) query = query.eq('entity_type', entity_type);
    if (entity_id) query = query.eq('entity_id', entity_id);
    if (action) query = query.eq('action', action);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
