const LabAppointment = require('../models/LabAppointment.model');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   POST /api/lab/book
 * @desc    Book a new lab appointment
 * @access  Protected (Patient, Receptionist)
 */
const bookAppointment = async (req, res) => {
  try {
    const { patientId, organizationId, testType, date, timeSlot } = req.body;

    // Security: Patients can only book for themselves
    if (req.user.role === 'PATIENT' && patientId !== req.user._id.toString()) {
      return sendError(res, 'You can only book appointments for yourself.', 403);
    }

    // Security: Org staff can only book for their organization
    if (req.user.role !== 'SUPER_ADMIN' && organizationId !== req.user.organizationId?.toString()) {
      // Patients might not have organizationId on their user object, but they book at an org
      // So we allow patients to book anywhere, but staff only in their org
      if (req.user.role !== 'PATIENT') {
        return sendError(res, 'You can only book appointments for your organization.', 403);
      }
    }

    const appointment = await LabAppointment.create({
      patientId,
      organizationId,
      testType,
      date,
      timeSlot,
      createdBy: req.user._id
    });

    return sendSuccess(res, appointment, 'Lab appointment booked successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/lab/my-appointments
 * @desc    Get current user's lab appointments
 * @access  Protected (Patient)
 */
const getMyAppointments = async (req, res) => {
  try {
    const query = { patientId: req.user._id };
    
    // Allow filtering by status if needed
    if (req.query.status) query.status = req.query.status;

    const appointments = await LabAppointment.find(query)
      .populate('organizationId', 'name address')
      .sort({ date: -1, timeSlot: -1 });

    return sendSuccess(res, appointments);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/lab/org-appointments
 * @desc    Get appointments for the organization
 * @access  Protected (Org Staff, Super Admin)
 */
const getOrgAppointments = async (req, res) => {
  try {
    const query = {};

    // Multi-tenant enforcement
    if (req.user.role !== 'SUPER_ADMIN') {
      query.organizationId = req.orgScope;
    } else if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    if (req.query.status) query.status = req.query.status;

    const appointments = await LabAppointment.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('labTechnicianId', 'firstName lastName')
      .sort({ date: -1, timeSlot: -1 });

    return sendSuccess(res, appointments);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/lab/:id/status
 * @desc    Update lab appointment status
 * @access  Protected (Lab Tech, Org Admin)
 */
const updateStatus = async (req, res) => {
  try {
    const { status, labTechnicianId } = req.body;
    const query = { _id: req.params.id };

    if (req.user.role !== 'SUPER_ADMIN') {
      query.organizationId = req.orgScope;
    }

    const appointment = await LabAppointment.findOne(query);

    if (!appointment) {
      return sendError(res, 'Appointment not found or access denied', 404);
    }

    appointment.status = status;
    if (labTechnicianId) appointment.labTechnicianId = labTechnicianId;
    
    await appointment.save();

    return sendSuccess(res, appointment, `Appointment marked as ${status}`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/lab/:id/cancel
 * @desc    Cancel lab appointment
 * @access  Protected (Patient, Org Admin, Super Admin)
 */
const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const query = { _id: req.params.id };

    const appointment = await LabAppointment.findById(req.params.id);
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    // Security Logic
    let isAuthorized = false;

    if (req.user.role === 'SUPER_ADMIN') {
      isAuthorized = true;
    } else if (req.user.role === 'PATIENT') {
      // Patient can only cancel their own
      if (appointment.patientId.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
    } else {
      // Org staff can cancel within their org
      if (appointment.organizationId.toString() === req.orgScope?.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to cancel this appointment', 403);
    }

    appointment.status = 'Cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    appointment.cancelReason = reason || 'Cancelled by user';

    await appointment.save();

    return sendSuccess(res, appointment, 'Appointment cancelled successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getOrgAppointments,
  updateStatus,
  cancelAppointment
};
