import supabase from '../config/supabase.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function getAppointments(req, res, next) {
  const { patient_id, doctor_id, date, status } = req.query;

  try {
    let query = supabase.from('appointments').select('*, patients(full_name, patient_id, phone)');

    if (patient_id) query = query.eq('patient_id', patient_id);
    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    if (date) query = query.eq('appointment_date', date);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req, res, next) {
  const payload = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  try {
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
      patient_id: payload.patient_id,
    }).catch(err => logger.error(`Failed to create notification: ${err.message}`));

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'appointment_created',
      actor_id: actorId,
      entity_type: 'appointment',
      entity_id: data.id,
      details: `Appointment scheduled by ${actorId}`,
    }).catch(err => logger.error(`Failed to log audit: ${err.message}`));

    logger.info(`appointment_created - actor: ${actorId}, appointment: ${data.id}`);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointment(req, res, next) {
  const { id, ...updates } = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  if (!id) {
    return next(new BadRequestError('Appointment ID is required for update'));
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new NotFoundError('Appointment not found'));
      }
      throw error;
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'appointment_updated',
      actor_id: actorId,
      entity_type: 'appointment',
      entity_id: data.id,
      details: `Appointment updated by ${actorId}`,
    }).catch(err => logger.error(`Failed to log audit: ${err.message}`));

    logger.info(`appointment_updated - actor: ${actorId}, appointment: ${data.id}`);

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteAppointment(req, res, next) {
  const { id } = req.body;
  const actorId = req.user?.id || 'unauthenticated';

  if (!id) {
    return next(new BadRequestError('Appointment ID is required for deletion'));
  }

  try {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'appointment_deleted',
      actor_id: actorId,
      entity_type: 'appointment',
      entity_id: id,
      details: `Appointment deleted by ${actorId}`,
    }).catch(err => logger.error(`Failed to log audit: ${err.message}`));

    logger.info(`appointment_deleted - actor: ${actorId}, appointment: ${id}`);

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
