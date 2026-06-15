import supabase from '../config/supabase.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function getPatients(req, res, next) {
  const { search, id, qr_code } = req.query;

  try {
    let query = supabase.from('patients').select('*');

    if (id) {
      const { data, error } = await query.eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') {
          return next(new NotFoundError('Patient not found'));
        }
        throw error;
      }
      return res.status(200).json(data);
    }

    if (qr_code) {
      const { data, error } = await query.eq('qr_code', qr_code).single();
      if (error) {
        if (error.code === 'PGRST116') {
          return next(new NotFoundError('Patient with this QR Code not found'));
        }
        throw error;
      }
      return res.status(200).json(data);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,patient_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function createPatient(req, res, next) {
  const body = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  try {
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
      actor_id: actorId,
      entity_type: 'patient',
      entity_id: data.id,
      details: `Patient ${data.full_name} registered by ${actorId}`,
    }).catch(err => logger.error(`Audit logging failed: ${err.message}`));

    logger.info(`patient_registered - actor: ${actorId}, patient: ${data.id}`);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updatePatient(req, res, next) {
  const { id, ...updates } = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  if (!id) {
    return next(new BadRequestError('Patient ID is required for update'));
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new NotFoundError('Patient not found to update'));
      }
      throw error;
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'patient_updated',
      actor_id: actorId,
      entity_type: 'patient',
      entity_id: id,
      details: `Patient record updated by ${actorId}`,
    }).catch(err => logger.error(`Audit logging failed: ${err.message}`));

    logger.info(`patient_updated - actor: ${actorId}, patient: ${id}`);

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePatient(req, res, next) {
  const { id } = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  if (!id) {
    return next(new BadRequestError('Patient ID is required for deletion'));
  }

  try {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'patient_deleted',
      actor_id: actorId,
      entity_type: 'patient',
      entity_id: id,
      details: `Patient deleted by ${actorId}`,
    }).catch(err => logger.error(`Audit logging failed: ${err.message}`));

    logger.info(`patient_deleted - actor: ${actorId}, patient: ${id}`);

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
