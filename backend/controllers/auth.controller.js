const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { logAction } = require('../utils/auditLog');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Generate a signed JWT token for the authenticated user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      organizationId: user.organizationId 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (forced to 'PATIENT')
 */
const register = async (req, res) => {
  try {
    let { firstName, lastName, email, password, role } = req.body;

    // Only allow PATIENT for self-registration
    if (role && role.toUpperCase() !== 'PATIENT') {
      return sendError(res, 'Forbidden: Only patients can self-register.', 403);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'An account with this email already exists.', 400);
    }

    const user = await User.create({ 
      firstName: firstName?.trim(), 
      lastName: lastName?.trim(), 
      email: email?.toLowerCase().trim(), 
      password, 
      role: 'PATIENT' 
    });
    
    const token = generateToken(user);
    await logAction(user._id, 'REGISTER', 'Auth', `New patient account: ${email}`, 'Info', req.ip);

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        organizationId: user.organizationId
      }
    }, 'Registration successful.', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 */
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password.', 400);
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select('+password');
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);
    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${email}`);
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.matchPassword(password);
    console.log(`[LOGIN DEBUG] Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log(`[LOGIN FAILED] Password mismatch for email: ${email}`);
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    const token = generateToken(user);
    await logAction(user._id, 'LOGIN', 'Auth', `User logged in: ${email}`, 'Info', req.ip);

    return sendSuccess(res, {
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        organizationId: user.organizationId
      }
    }, 'Login successful.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { register, login, getMe };
