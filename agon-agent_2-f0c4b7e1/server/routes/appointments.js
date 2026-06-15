import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { appointmentSchema } from '../middleware/schemas.js';

const router = express.Router();

router.get('/', getAppointments);
router.post('/', requireAuth, validate(appointmentSchema), createAppointment);
router.put('/', requireAuth, validate(appointmentSchema), updateAppointment);
router.delete('/', requireAuth, deleteAppointment);

export default router;
