const express = require('express');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const LabReport = require('../models/LabReport.model');
const Admission = require('../models/Admission');
const { protect, authorize } = require('../middleware/auth.middleware');
const { checkEMRAccess } = require('../middleware/access.middleware');
const { logAction } = require('../utils/auditLog');

const Organization = require('../models/Organization.model');
const router = express.Router();

// GET /api/users - Admin only: list all users
router.get('/', protect, authorize('HOSPITAL_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/doctors - Get all doctors from verified organizations
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

    res.json({
      success: true,
      count: verifiedDoctors.length,
      doctors: verifiedDoctors
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id/emr - Detailed Patient EMR View
router.get('/:id/emr', protect, authorize('Hospital_Admin', 'Super_Admin', 'Doctor', 'Receptionist'), checkEMRAccess, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user, appointments, prescriptions, labReports, admissions] = await Promise.all([
      User.findById(userId).select('-password'),
      Appointment.find({ patient: userId })
        .populate('doctor', 'firstName lastName specialty')
        .populate('hospital', 'name')
        .sort({ date: -1 }),
      Prescription.find({ patient: userId })
        .populate('doctor', 'firstName lastName specialty')
        .populate('hospital', 'name')
        .sort({ date: -1 }),
      LabReport.find({ patient: userId })
        .populate('doctor', 'firstName lastName specialty')
        .populate('hospital', 'name')
        .sort({ createdAt: -1 }),
      Admission.find({ patient: userId })
        .populate('bed')
        .populate('hospital', 'name')
        .sort({ admissionDate: -1 })
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'Patient not found.' });

    // AUDIT LOG: Record Access
    await logAction(
      req.user._id, 'VIEW_EMR', 'User',
      `Full clinical record of patient ${userId} accessed by ${req.user.role} ${req.user._id}`,
      'Info', req.ip
    );

    res.json({
      success: true,
      emr: {
        profile: user,
        appointments,
        prescriptions,
        labReports,
        admissions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id - Get single user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id - Update own profile
router.put('/:id', protect, async (req, res) => {
  try {
    // Authorization: only the account owner or an admin may update the profile
    if (req.user.id !== req.params.id && !['Hospital_Admin', 'Super_Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this account.' });
    }
    const { password, role, ...updateData } = req.body; // Prevent sensitive field updates
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id - Delete user account
router.delete('/:id', protect, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found.' });

    // Authorization: Only self or Admin can delete
    if (req.user.id !== req.params.id && !['Hospital_Admin', 'Super_Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
