const express = require('express');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const LabReport = require('../models/LabReport.model');
const Admission = require('../models/Admission');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');
const { checkEMRAccess } = require('../middleware/access.middleware');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { logAction } = require('../utils/auditLog');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get users (scoped by organization)
 */
router.get('/', protect, requireOrgScope, requireRole(['ORG_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      query.organizationId = req.orgScope;
    } else if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    // Role filter
    if (req.query.role) {
      query.role = req.query.role.toUpperCase();
    }

    const users = await User.find(query).select('-password').populate('organizationId', 'name');
    return sendSuccess(res, users, `Found ${users.length} users`);
  } catch (err) {
    return sendError(res, err.message);
  }
});

/**
 * @route   GET /api/users/doctors
 * @desc    Get all doctors from verified organizations
 */
router.get('/doctors', protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'DOCTOR' })
      .populate({
        path: 'organizationId',
        match: { isVerified: true },
        select: 'name isVerified'
      })
      .select('firstName lastName email specialty organizationId');

    const verifiedDoctors = doctors.filter(doc => doc.organizationId !== null);
    return sendSuccess(res, verifiedDoctors);
  } catch (err) {
    return sendError(res, err.message);
  }
});

/**
 * @route   GET /api/users/:id/emr
 * @desc    Detailed Patient EMR View
 */
router.get('/:id/emr', protect, requireOrgScope, requireRole(['ORG_ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST']), checkEMRAccess, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user, appointments, prescriptions, labReports, admissions] = await Promise.all([
      User.findById(userId).select('-password'),
      Appointment.find({ patient: userId }).populate('doctor', 'firstName lastName specialty').sort({ date: -1 }),
      Prescription.find({ patient: userId }).populate('doctor', 'firstName lastName specialty').sort({ date: -1 }),
      LabReport.find({ patient: userId }).populate('doctor', 'firstName lastName specialty').sort({ createdAt: -1 }),
      Admission.find({ patient: userId }).populate('bed').sort({ admissionDate: -1 })
    ]);

    if (!user) return sendError(res, 'Patient not found.', 404);

    await logAction(req.user._id, 'VIEW_EMR', 'User', `Patient ${userId} EMR accessed`, 'Info', req.ip);

    return sendSuccess(res, {
      profile: user,
      appointments,
      prescriptions,
      labReports,
      admissions
    });
  } catch (err) {
    return sendError(res, err.message);
  }
});

/**
 * @route   GET /api/users/:id
 */
router.get('/:id', protect, requireOrgScope, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return sendError(res, 'User not found.', 404);

    // Security: Check if user is in same org if not superadmin
    if (req.user.role !== 'SUPER_ADMIN' && user.role !== 'PATIENT') {
      if (user.organizationId?.toString() !== req.orgScope?.toString()) {
        return sendError(res, 'Access denied: User outside your organization.', 403);
      }
    }

    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, err.message);
  }
});

/**
 * @route   PUT /api/users/:id
 */
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !['ORG_ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return sendError(res, 'Not authorized to update this account.', 403);
    }
    const { password, role, organizationId, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    }).select('-password');
    
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
});

/**
 * @route   DELETE /api/users/:id
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return sendError(res, 'User not found.', 404);

    if (req.user.id !== req.params.id && req.user.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Not authorized to delete this account.', 403);
    }

    await User.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'User account deleted successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = router;
