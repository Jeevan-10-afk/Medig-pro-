import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().required(),
  role: Joi.string().valid('patient', 'doctor', 'admin').optional(),
  phone: Joi.string().allow('', null).optional(),
  date_of_birth: Joi.date().allow('', null).optional(),
  gender: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
});

export const patientSchema = Joi.object({
  full_name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.string().allow('', null),
  date_of_birth: Joi.date().optional(),
  gender: Joi.string().allow('', null).optional(),
  emergency_contact: Joi.string().allow('', null).optional(),
  height: Joi.number().allow('', null).optional(),
  weight: Joi.number().allow('', null).optional(),
  bmi: Joi.number().allow('', null).optional(),
  temperature: Joi.number().allow('', null).optional(),
  blood_pressure_systolic: Joi.number().allow('', null).optional(),
  blood_pressure_diastolic: Joi.number().allow('', null).optional(),
  pulse_rate: Joi.number().allow('', null).optional(),
  reason_for_visit: Joi.string().allow('', null).optional(),
  current_medications: Joi.string().allow('', null).optional(),
  allergies: Joi.string().allow('', null).optional(),
  pain_scale: Joi.number().min(1).max(10).optional(),
  smoking_status: Joi.string().allow('', null).optional(),
  alcohol_consumption: Joi.string().allow('', null).optional(),
  mood_swings: Joi.boolean().optional(),
  assessment_date: Joi.date().optional(),
});

export const appointmentSchema = Joi.object({
  patient_id: Joi.string().required(),
  doctor_id: Joi.string().required(),
  appointment_date: Joi.date().required(),
  status: Joi.string().valid('scheduled', 'cancelled', 'completed', 'pending', 'confirmed').optional(),
  notes: Joi.string().allow('', null).optional(),
});

export const medicalRecordSchema = Joi.object({
  patient_id: Joi.string().required(),
  doctor_id: Joi.string().optional(),
  diagnosis: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  created_at: Joi.date().optional(),
});
