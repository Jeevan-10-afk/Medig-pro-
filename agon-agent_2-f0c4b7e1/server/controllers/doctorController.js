import supabase from '../config/supabase.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export async function getDoctors(req, res, next) {
  const { id, department } = req.query;

  try {
    let query = supabase.from('doctors').select('*');

    if (id) {
      const { data, error } = await query.eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') {
          return next(new NotFoundError('Doctor not found'));
        }
        throw error;
      }
      return res.status(200).json(data);
    }

    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function createDoctor(req, res, next) {
  const body = req.body;

  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateDoctor(req, res, next) {
  const { id, ...updates } = req.body;

  if (!id) {
    return next(new BadRequestError('Doctor ID is required for update'));
  }

  try {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new NotFoundError('Doctor not found'));
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteDoctor(req, res, next) {
  const { id } = req.body;

  if (!id) {
    return next(new BadRequestError('Doctor ID is required for deletion'));
  }

  try {
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
