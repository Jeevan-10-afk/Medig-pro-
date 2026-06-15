import supabase from '../config/supabase.js';
import { BadRequestError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function getReports(req, res, next) {
  const { patient_id, category } = req.query;

  try {
    let query = supabase.from('reports').select('*, patients(full_name, patient_id)');

    if (patient_id) query = query.eq('patient_id', patient_id);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('uploaded_at', { ascending: false });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function uploadReport(req, res, next) {
  const { fileName, fileBase64, contentType, patient_id, category, title } = req.body;

  if (!fileBase64 || !fileName || !patient_id) {
    return next(new BadRequestError('fileName, fileBase64, and patient_id are required'));
  }

  try {
    // Upload to Supabase Storage
    const buffer = Buffer.from(fileBase64, 'base64');
    const filePath = `reports/${patient_id}/${Date.now()}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-reports')
      .upload(filePath, buffer, { contentType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('medical-reports')
      .getPublicUrl(filePath);

    // Insert meta into database
    const { data, error } = await supabase
      .from('reports')
      .insert({
        patient_id,
        title: title || fileName,
        category: category || 'general',
        file_url: urlData.publicUrl,
        file_type: contentType,
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification
    await supabase.from('notifications').insert({
      type: 'report_uploaded',
      title: 'New Report Uploaded',
      message: `A new ${category || 'general'} report has been uploaded`,
      patient_id,
    }).catch(err => logger.error(`Failed to create report notification: ${err.message}`));

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteReport(req, res, next) {
  const { id } = req.body;

  if (!id) {
    return next(new BadRequestError('Report ID is required'));
  }

  try {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
