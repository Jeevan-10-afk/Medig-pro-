import supabase from '../config/supabase.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function getMedicalRecords(req, res, next) {
  const { patient_id } = req.query;

  try {
    let query = supabase.from('medical_records').select('*, patients(full_name, patient_id)');

    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function createMedicalRecord(req, res, next) {
  const payload = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  try {
    const { data, error } = await supabase
      .from('medical_records')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'medical_record_created',
      actor_id: actorId,
      entity_type: 'medical_record',
      entity_id: data.id,
      details: `Medical record created for patient ${payload.patient_id}`,
    }).catch(err => logger.error(`Failed to log audit: ${err.message}`));

    logger.info(`medical_record_created - actor: ${actorId}, record: ${data.id}`);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateMedicalRecord(req, res, next) {
  const { id, ...updates } = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  if (!id) {
    return next(new BadRequestError('Medical Record ID is required for update'));
  }

  try {
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new NotFoundError('Medical Record not found'));
      }
      throw error;
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'medical_record_updated',
      actor_id: actorId,
      entity_type: 'medical_record',
      entity_id: data.id,
      details: `Medical record updated for id ${data.id}`,
    }).catch(err => logger.error(`Failed to log audit: ${err.message}`));

    logger.info(`medical_record_updated - actor: ${actorId}, record: ${data.id}`);

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteMedicalRecord(req, res, next) {
  const { id } = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  if (!id) {
    return next(new BadRequestError('Medical Record ID is required for deletion'));
  }

  try {
    const { error } = await supabase.from('medical_records').delete().eq('id', id);
    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'medical_record_deleted',
      actor_id: actorId,
      entity_type: 'medical_record',
      entity_id: id,
      details: `Medical record deleted for id ${id}`,
    }).catch(err => logger.error(`Failed to log audit: ${err.message}`));

    logger.info(`medical_record_deleted - actor: ${actorId}, record: ${id}`);

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
