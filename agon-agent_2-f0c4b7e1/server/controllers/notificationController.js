import supabase from '../config/supabase.js';
import { BadRequestError } from '../utils/errors.js';

export async function getNotifications(req, res, next) {
  const { patient_id, unread_only } = req.query;

  try {
    let query = supabase.from('notifications').select('*');

    if (patient_id) query = query.eq('patient_id', patient_id);
    if (unread_only === 'true') query = query.eq('read', false);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function createNotification(req, res, next) {
  const body = req.body;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateNotification(req, res, next) {
  const { id, read } = req.body;

  if (!id) {
    return next(new BadRequestError('Notification ID is required'));
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
