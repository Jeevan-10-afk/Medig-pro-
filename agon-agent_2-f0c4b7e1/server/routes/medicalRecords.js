import express from 'express';
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../controllers/medicalRecordController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { medicalRecordSchema } from '../middleware/schemas.js';

const router = express.Router();

router.get('/', getMedicalRecords);
router.post('/', requireAuth, validate(medicalRecordSchema), createMedicalRecord);
router.put('/', requireAuth, validate(medicalRecordSchema), updateMedicalRecord);
router.delete('/', requireAuth, deleteMedicalRecord);

export default router;
