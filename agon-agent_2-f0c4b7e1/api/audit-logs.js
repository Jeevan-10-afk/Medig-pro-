import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { entity_type, entity_id, action } = req.query;
      let query = supabase.from('audit_logs').select('*');
      
      if (entity_type) query = query.eq('entity_type', entity_type);
      if (entity_id) query = query.eq('entity_id', entity_id);
      if (action) query = query.eq('action', action);
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}