import { ApiError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export default function errorHandler(err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log the error
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.url} - ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.url} - ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
}
