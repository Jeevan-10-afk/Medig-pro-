import fetch from 'node-fetch';
import supabase from '../config/supabase.js';
import { UnauthorizedError, ForbiddenError, InternalServerError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Authorization token missing'));
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceKey || '',
      },
    });

    if (!response.ok) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    const authUser = await response.json();

    // Fetch the user's profile to get their role and other information
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      logger.warn(`Could not fetch user profile for ID ${authUser.id}: ${error.message}`);
    }

    req.user = {
      id: authUser.id,
      email: authUser.email,
      role: profile?.role || 'patient',
      ...profile,
    };

    next();
  } catch (err) {
    logger.error(`Authentication middleware error: ${err.message}`);
    return next(new InternalServerError('Authentication verification failed'));
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    // requireAuth must be run first to populate req.user
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied: insufficient permissions'));
    }

    next();
  };
}
