const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { logAction } = require('../utils/auditLog');

/**
 * Generate a signed JWT token for the authenticated user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (public endpoint — role is always forced to 'Patient')
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Always assign the Patient role on public self-registration to prevent
    // privilege escalation. Staff accounts must be created by an admin.
    const user = await User.create({ firstName, lastName, email, password, role: 'Patient' });
    const token = generateToken(user._id);

    await logAction(user._id, 'REGISTER', 'Auth', `New patient account registered: ${email}`, 'Info', req.ip);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/auth/register-staff
 * @desc    Register a staff account (admin-only, allows specifying role)
 * @access  Protected (Hospital_Admin, Super_Admin)
 */
const registerStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ firstName, lastName, email, password, role });
    const token = generateToken(user._id);

    await logAction(req.user._id, 'REGISTER_STAFF', 'Auth', `Admin created ${role} account: ${email}`, 'Info', req.ip);

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });
    }

    const token = generateToken(user._id);

    await logAction(user._id, 'LOGIN', 'Auth', `User logged in: ${email}`, 'Info', req.ip);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Protected
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, registerStaff, login, getMe };
