import express from 'express';
import { login, register } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { loginSchema, registerSchema } from '../middleware/schemas.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;
