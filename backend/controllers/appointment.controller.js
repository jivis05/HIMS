const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for the current user (role-aware)
 * @access  Protected
 */
const getAppointments = async (req, res) => {
  try {
    let query = {};
    const { role, _id } = req.user;
    if (role === 'Patient') query.patient = _id;
    else if (role === 'Doctor') query.doctor = _id;
    // Admin, Receptionist see all

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialty')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query)
    ]);

    res.status(200).json({ success: true, count: appointments.length, total, page, pages: Math.ceil(total / limit), appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Protected (Patient, Receptionist, Admin)
 */
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, startTime, type, chiefComplaint } = req.body;

    // Patient can only book for themselves
    const patientId = req.user.role === 'Patient' ? req.user._id : patient;

    const appointment = await Appointment.create({
      patient: patientId, doctor, date, startTime, type, chiefComplaint
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status (confirm, complete, cancel)
 * @access  Protected
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const { status, cancelReason } = req.body;
    appointment.status = status;
    if (status === 'Canceled') {
      appointment.cancelledBy = req.user._id;
      appointment.cancelReason = cancelReason;
    }
    if (status === 'Completed') appointment.completedAt = new Date();

    await appointment.save();
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointmentStatus };
