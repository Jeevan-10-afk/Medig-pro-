import express from 'express';
import { getReports, uploadReport, deleteReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/', getReports);
router.post('/', uploadReport);
router.delete('/', deleteReport);

export default router;
