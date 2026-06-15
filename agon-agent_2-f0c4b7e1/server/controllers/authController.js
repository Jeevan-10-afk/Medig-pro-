import supabase from '../config/supabase.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return next(new UnauthorizedError(error.message));
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      logger.warn(`Failed to fetch user profile on login: ${profileError.message}`);
    }

    res.status(200).json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'doctor',
        ...profile,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  const { email, password, full_name, role = 'patient', ...otherData } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
      },
    });

    if (error) {
      return next(new BadRequestError(error.message));
    }

    if (!data.user) {
      return next(new BadRequestError('Registration failed. Check user credentials.'));
    }

    // Create user profile
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name,
        role,
        phone: otherData.phone,
        date_of_birth: otherData.date_of_birth,
        gender: otherData.gender,
        address: otherData.address,
      });

    if (insertError) {
      logger.error(`Failed to insert user profile: ${insertError.message}`);
      return next(new BadRequestError(`Profile creation failed: ${insertError.message}`));
    }

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
      },
    });
  } catch (err) {
    next(err);
  }
}
