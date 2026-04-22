const Appointment = require('../models/Appointment.model');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for the current user (strict role-aware)
 * @access  Protected
 */
const getAppointments = async (req, res) => {
  try {
    const query = {};
    const { role, _id } = req.user;

    if (role === 'SUPER_ADMIN') {
      // No filter for global scope
    } else if (role === 'PATIENT') {
      query.patient = _id;
    } else {
      // ORG_ADMIN, DOCTOR, NURSE, RECEPTIONIST, LAB_TECH
      query.organizationId = req.orgScope;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ date: -1 });

    return sendSuccess(res, appointments, `Found ${appointments.length} appointments`);
  } catch (error) {
    return sendError(res, error.message);
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
      if (!targetOrgId) {
        return sendError(res, 'organizationId is required.', 400);
      }
    } else if (role !== 'SUPER_ADMIN') {
      targetOrgId = req.orgScope;
    }

    const appointment = await Appointment.create({
      patient: targetPatientId, 
      doctor, 
      organizationId: targetOrgId,
      date, 
      startTime, 
      type, 
      chiefComplaint,
      createdBy: req.user._id
    });

    return sendSuccess(res, appointment, 'Appointment created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Strict cancellation workflow
 * @access  Protected
 */
const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return sendError(res, 'Appointment not found.', 404);
    }

    const role = req.user.role;

    // Strict Enforcement
    let isAuthorized = false;
    if (role === 'SUPER_ADMIN') {
      isAuthorized = true;
    } else if (role === 'PATIENT') {
      if (appointment.patient.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
    } else {
      if (appointment.organizationId && appointment.organizationId.toString() === req.orgScope?.toString()) {
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

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Protected
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return sendError(res, 'Appointment not found.', 404);
    }

    // Role Enforcement
    if (req.user.role === 'PATIENT') {
       return sendError(res, 'Patients cannot update status directly.', 403);
    } else if (req.user.role !== 'SUPER_ADMIN') {
       if (appointment.organizationId.toString() !== req.orgScope.toString()) {
         return sendError(res, 'Access denied: Outside your organization scope.', 403);
       }
    }

    appointment.status = status;
    if (status === 'Completed') appointment.completedAt = new Date();

    await appointment.save();
    
    return sendSuccess(res, appointment, `Appointment status updated to ${status}`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getAppointments, createAppointment, cancelAppointment, updateAppointmentStatus };
