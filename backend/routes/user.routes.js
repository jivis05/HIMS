const express = require('express');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const LabReport = require('../models/LabReport.model');
const Admission = require('../models/Admission');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/users - Admin only: list all users
router.get('/', protect, authorize('Hospital_Admin', 'Super_Admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/doctors - Get all doctors (accessible to anyone authenticated)
router.get('/doctors', protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isActive: true })
      .select('firstName lastName specialty phone');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id/emr - Detailed Patient EMR View
router.get('/:id/emr', protect, authorize('Hospital_Admin', 'Super_Admin', 'Doctor', 'Receptionist'), async (req, res) => {
  try {
    const userId = req.params.id;
    const [user, appointments, prescriptions, labReports, admissions] = await Promise.all([
      User.findById(userId).select('-password'),
      Appointment.find({ patient: userId }).populate('doctor', 'firstName lastName specialty').sort({ date: -1 }),
      Prescription.find({ patient: userId }).populate('doctor', 'firstName lastName specialty').sort({ date: -1 }),
      LabReport.find({ patient: userId }).populate('doctor', 'firstName lastName specialty').sort({ createdAt: -1 }),
      Admission.find({ patient: userId }).populate('bed').sort({ admissionDate: -1 })
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'Patient not found.' });

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
