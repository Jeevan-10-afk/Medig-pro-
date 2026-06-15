import express from 'express';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.post('/', createDoctor);
router.put('/', updateDoctor);
router.delete('/', deleteDoctor);

export default router;
