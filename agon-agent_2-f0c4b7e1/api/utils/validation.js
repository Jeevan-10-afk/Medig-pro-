import Joi from 'joi';

export const medicalRecordSchema = Joi.object({
  patient_id: Joi.string().required(),
  doctor_id: Joi.string().optional(),
  diagnosis: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  created_at: Joi.date().optional(),
});

export const patientSchema = Joi.object({
  full_name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.string().allow('', null),
  date_of_birth: Joi.date().optional(),
});

export const appointmentSchema = Joi.object({
  patient_id: Joi.string().required(),
  doctor_id: Joi.string().required(),
  appointment_date: Joi.date().required(),
  status: Joi.string().valid('scheduled','cancelled','completed').optional(),
  notes: Joi.string().allow('', null),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().required(),
  role: Joi.string().valid('patient','doctor','admin').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export function validate(schema, payload) {
  const { error, value } = schema.validate(payload, { stripUnknown: true });
  if (error) {
    const message = error.details.map(d => d.message).join(', ');
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return value;
}
