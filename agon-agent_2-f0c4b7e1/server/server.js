import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';

// Routers
import authRouter from './routes/auth.js';
import patientsRouter from './routes/patients.js';
import appointmentsRouter from './routes/appointments.js';
import medicalRecordsRouter from './routes/medicalRecords.js';
import notificationsRouter from './routes/notifications.js';
import reportsRouter from './routes/reports.js';
import doctorsRouter from './routes/doctors.js';
import analyticsRouter from './routes/analytics.js';
import auditLogsRouter from './routes/auditLogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    statusCode: 429,
    error: 'Too many requests from this IP, please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// JSON / Urlencoded parsing
app.use(express.json({ limit: '10mb' })); // support base64 file uploads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MediG Pro+ Backend is running healthy.',
    timestamp: new Date().toISOString(),
  });
});

// Routes registration
app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit-logs', auditLogsRouter);

// Global Error Handler (must be registered after all routes)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`Server started in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
