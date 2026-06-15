import express from 'express';
import { getPatients, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { patientSchema } from '../middleware/schemas.js';

const router = express.Router();

router.get('/', getPatients);
router.post('/', requireAuth, validate(patientSchema), createPatient);
router.put('/', requireAuth, validate(patientSchema), updatePatient);
router.delete('/', requireAuth, deletePatient);

export default router;
