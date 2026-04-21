const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for the current user (strict role-aware)
 * @access  Protected
 */
const getAppointments = async (req, res) => {
  try {
    let query = {};
    const { role, _id } = req.user;

    if (role === 'SUPER_ADMIN') {
      // no filter
    } else if (role === 'PATIENT') {
      query.patient = _id;
    } else {
      // ORG_ADMIN, DOCTOR, NURSE, RECEPTIONIST, LAB_TECH
      query.organizationId = req.orgScope;
      
      // If doctor, only see their own appointments (optional depending on rules, but prompt says "their appointments", let's be broad to org unless specified, wait, doctors usually see org's or just theirs? "Organization Users: Must ONLY access: Appointments linked to their organization" - so broad org access is fine for now)
    }

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
 * @access  Protected
 */
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, startTime, type, chiefComplaint, organizationId } = req.body;

    const role = req.user.role;
    let targetPatientId = patient;
    let targetOrgId = organizationId;

    if (role === 'PATIENT') {
      targetPatientId = req.user._id;
      // Patient must provide an org they are booking for.
      if (!targetOrgId) {
        return res.status(400).json({ success: false, message: 'organizationId is required.' });
      }
    } else if (role !== 'SUPER_ADMIN') {
      // Staff must book within their org
      targetOrgId = req.orgScope;
    }

    const appointment = await Appointment.create({
      patient: targetPatientId, 
      doctor, 
      organizationId: targetOrgId,
      date, 
      startTime, 
      type, 
      chiefComplaint
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Strict cancellation workflow
 * @access  Protected
 */
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const role = req.user.role;

    // Strict Enforcement
    if (role === 'PATIENT') {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only cancel your own appointments.' });
      }
    } else if (role !== 'SUPER_ADMIN') {
      if (appointment.organizationId.toString() !== req.orgScope.toString()) {
         return res.status(403).json({ success: false, message: 'Forbidden: Cannot cancel appointments outside your organization.' });
      }
    }

    appointment.status = 'Cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    appointment.cancelReason = req.body.reason || 'No reason provided';

    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled successfully.', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Protected
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Role Enforcement
    const role = req.user.role;
    if (role === 'PATIENT') {
       return res.status(403).json({ success: false, message: 'Patients cannot update status directly.' });
    } else if (role !== 'SUPER_ADMIN') {
       if (appointment.organizationId.toString() !== req.orgScope.toString()) {
         return res.status(403).json({ success: false, message: 'Forbidden: Cannot update appointments outside your organization.' });
       }
    }

    const { status } = req.body;
    appointment.status = status;
    if (status === 'Completed') appointment.completedAt = new Date();

    await appointment.save();
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAppointments, createAppointment, cancelAppointment, updateAppointmentStatus };
