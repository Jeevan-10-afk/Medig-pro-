import express from 'express';
import { getNotifications, createNotification, updateNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/', updateNotification);

export default router;
