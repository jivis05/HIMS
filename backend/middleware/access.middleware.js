const Appointment = require('../models/Appointment.model');
const Consent = require('../models/Consent.model');
const { logAction } = require('../utils/auditLog');

/**
 * Advanced Access Control Middleware for EMR
 * Enforces ABAC (Attribute-Based Access Control) and Break-Glass policies.
 */
const checkEMRAccess = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const actingUser = req.user;
    const { isEmergency, reason } = req.query; // For Break-Glass (GET Request)

    // 1. Super Admins have full access
    if (actingUser.role === 'Super_Admin') {
      return next();
    }

    // 2. Hospital Admins can access if the patient is registered or has records at their facility
    // (Simplification: for now, we'll allow broad access to Hospital Admins, but we should scope it later)
    if (actingUser.role === 'Hospital_Admin') {
      return next();
    }

    // 3. Break-Glass Mechanism (Emergency Access)
    if (isEmergency === true) {
      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'A valid emergency reason (min 10 chars) is required for Break-Glass access.' 
        });
      }

      // Log CRITICAL audit event
      await logAction(
        actingUser._id, 'BREAK_GLASS', 'User',
        `EMERGENCY ACCESS to patient ${patientId} by ${actingUser.role} ${actingUser._id}. Reason: ${reason}`,
        'Critical', req.ip
      );

      return next();
    }

    // 4. Doctor/Clinical Access Logic (Contextual)
    if (['Doctor', 'Nurse', 'Receptionist'].includes(actingUser.role)) {
      
      // A. Check if Doctor is the Primary Physician
      const isPrimary = actingUser._id.toString() === actingUser.primaryPhysician?.toString();
      // wait, actingUser is the doctor. We need to check the PATIENT's primary physician.
      // We'll fetch the patient below to check this.
    }

    // Fetch patient to check relations
    const User = require('../models/User.model');
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // A. Primary Physician Check
    if (patient.primaryPhysician && patient.primaryPhysician.toString() === actingUser._id.toString()) {
      return next();
    }

    // B. Check for Active Appointment
    // Consider an appointment "active context" if it's Scheduled/In-Progress and for Today or Tomorrow
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    
    const activeAppointment = await Appointment.findOne({
      patient: patientId,
      doctor: actingUser._id,
      status: { $in: ['Scheduled', 'Checked In', 'In Progress'] },
      date: { $gte: startOfToday }
    });

    if (activeAppointment) {
      return next();
    }

    // C. Check for Explicit Patient Consent
    const validConsent = await Consent.findOne({
      patient: patientId,
      $or: [
        { doctor: actingUser._id },
        { hospital: actingUser.hospital } // Hospital-wide consent
      ],
      status: 'Active',
      expiresAt: { $gt: new Date() }
    });

    if (validConsent) {
      return next();
    }

    // D. Inpatient Context (If doctor is managing the patient's admission)
    const Admission = require('../models/Admission');
    const activeAdmission = await Admission.findOne({
      patient: patientId,
      status: 'Admitted',
      $or: [
        { admittedBy: actingUser._id },
        { assignedNurse: actingUser._id }
      ]
    });

    if (activeAdmission) {
      return next();
    }

    // 5. Access Denied
    await logAction(
      actingUser._id, 'ACCESS_DENIED', 'User',
      `Unauthorized EMR access attempt to patient ${patientId} by ${actingUser.role} ${actingUser._id}`,
      'Warning', req.ip
    );

    return res.status(403).json({
      success: false,
      message: 'Access Denied. You do not have an active clinical relationship or consent to view this patient\'s records.',
      needsConsent: true
    });

  } catch (error) {
    console.error('Access Context Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during access verification.' });
  }
};

module.exports = { checkEMRAccess };
