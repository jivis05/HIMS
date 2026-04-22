const Log = require('../models/Log');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');
const Appointment = require('../models/Appointment.model');
const LabAppointment = require('../models/LabAppointment.model');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/superadmin/stats
 * @desc    Global system statistics and summary
 */
const getSystemStats = async (req, res) => {
  try {
    const [users, orgs, docAppts, labAppts, logs] = await Promise.all([
      User.find().select('-password').populate('organizationId', 'name').limit(10),
      Organization.find().limit(10),
      Appointment.find().limit(10),
      LabAppointment.find().limit(10),
      Log.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const stats = {
      totalUsers: await User.countDocuments(),
      totalOrgs: await Organization.countDocuments(),
      totalAppointments: (await Appointment.countDocuments()) + (await LabAppointment.countDocuments())
    };

    return sendSuccess(res, {
      users,
      orgs,
      appointments: [...docAppts, ...labAppts],
      logs,
      stats
    }, 'Global system statistics retrieved');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/superadmin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('organizationId', 'name');
    return sendSuccess(res, users);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/superadmin/orgs
 */
const getAllOrgs = async (req, res) => {
  try {
    const orgs = await Organization.find().populate('admin', 'firstName lastName email');
    return sendSuccess(res, orgs);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/superadmin/appointments
 */
const getAllAppointments = async (req, res) => {
  try {
    const [docAppts, labAppts] = await Promise.all([
      Appointment.find().populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName').populate('organizationId', 'name'),
      LabAppointment.find().populate('patientId', 'firstName lastName').populate('organizationId', 'name')
    ]);
    return sendSuccess(res, { doctorAppointments: docAppts, labAppointments: labAppts });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/superadmin/logs
 */
const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find().populate('user', 'firstName lastName role').sort({ createdAt: -1 });
    return sendSuccess(res, logs);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @desc Verify/Approve organization
 */
const verifyOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verificationStatus: 'APPROVED' },
      { new: true }
    );
    if (!org) return sendError(res, 'Organization not found.', 404);
    return sendSuccess(res, org, 'Organization approved successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @desc Reject organization
 */
const rejectOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, verificationStatus: 'REJECTED' },
      { new: true }
    );
    if (!org) return sendError(res, 'Organization not found.', 404);
    return sendSuccess(res, org, 'Organization rejected successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  getAllOrgs,
  getAllAppointments,
  getAllLogs,
  verifyOrganization,
  rejectOrganization
};
