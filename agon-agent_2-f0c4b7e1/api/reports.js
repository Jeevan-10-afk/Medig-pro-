import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { patient_id, category } = req.query;
      let query = supabase.from('reports').select('*, patients(full_name, patient_id)');
      
      if (patient_id) query = query.eq('patient_id', patient_id);
      if (category) query = query.eq('category', category);
      
      const { data, error } = await query.order('uploaded_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      const { fileName, fileBase64, contentType, patient_id, category, title } = req.body;
      
      // Upload to storage
      const buffer = Buffer.from(fileBase64, 'base64');
      const filePath = `reports/${patient_id}/${Date.now()}-${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(filePath, buffer, { contentType, upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(filePath);
      
      const { data, error } = await supabase
        .from('reports')
        .insert({
          patient_id,
          title: title || fileName,
          category: category || 'general',
          file_url: urlData.publicUrl,
          file_type: contentType
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.from('notifications').insert({
        type: 'report_uploaded',
        title: 'New Report Uploaded',
        message: `A new ${category} report has been uploaded`,
        patient_id
      });
      
      return res.status(201).json(data);
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}