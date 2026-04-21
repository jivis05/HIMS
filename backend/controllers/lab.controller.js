const LabAppointment = require('../models/LabAppointment.model');

/**
 * @route   POST /api/lab/book
 * @desc    Book a new lab test
 * @access  Protected (PATIENT or ORG STAFF)
 */
const bookLabTest = async (req, res) => {
  try {
    const { testType, date, timeSlot, organizationId, patientId } = req.body;
    const role = req.user.role;
    
    let targetPatientId = patientId;
    let targetOrgId = organizationId;

    if (role === 'PATIENT') {
      targetPatientId = req.user._id;
      if (!targetOrgId) {
        return res.status(400).json({ success: false, message: 'organizationId is required.' });
      }
    } else if (role !== 'SUPER_ADMIN') {
      // Staff booking
      targetOrgId = req.orgScope;
      if (!targetPatientId) {
         return res.status(400).json({ success: false, message: 'patientId is required for staff booking.' });
      }
    }

    const labAppt = await LabAppointment.create({
      patientId: targetPatientId,
      organizationId: targetOrgId,
      testType,
      date,
      timeSlot,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, labAppointment: labAppt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/lab/my-appointments
 * @desc    Get lab appointments for a patient
 * @access  Protected (PATIENT)
 */
const getMyLabAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({ success: false, message: 'Only patients can access this route.' });
    }

    const labAppts = await LabAppointment.find({ patientId: req.user._id })
      .populate('organizationId', 'name')
      .populate('labTechnicianId', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({ success: true, labAppointments: labAppts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/lab/org-appointments
 * @desc    Get lab appointments for an organization
 * @access  Protected (ORG STAFF)
 */
const getOrgLabAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.orgScope };
    
    const labAppts = await LabAppointment.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('labTechnicianId', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({ success: true, labAppointments: labAppts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/lab/:id/status
 * @desc    Update lab appointment status
 * @access  Protected (ORG STAFF)
 */
const updateLabStatus = async (req, res) => {
  try {
    const labAppt = await LabAppointment.findById(req.params.id);
    if (!labAppt) {
      return res.status(404).json({ success: false, message: 'Lab appointment not found.' });
    }

    if (req.user.role === 'PATIENT') {
      return res.status(403).json({ success: false, message: 'Patients cannot update lab status directly.' });
    } else if (req.user.role !== 'SUPER_ADMIN') {
      if (labAppt.organizationId.toString() !== req.orgScope.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot update lab appointments outside your organization.' });
      }
    }

    const { status, labTechnicianId } = req.body;
    labAppt.status = status;
    if (labTechnicianId) labAppt.labTechnicianId = labTechnicianId;

    await labAppt.save();
    res.status(200).json({ success: true, labAppointment: labAppt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/lab/:id/cancel
 * @desc    Cancel a lab appointment
 * @access  Protected
 */
const cancelLabAppointment = async (req, res) => {
  try {
    const labAppt = await LabAppointment.findById(req.params.id);
    if (!labAppt) {
      return res.status(404).json({ success: false, message: 'Lab appointment not found.' });
    }

    const role = req.user.role;

    if (role === 'PATIENT') {
      if (labAppt.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only cancel your own lab appointments.' });
      }
    } else if (role !== 'SUPER_ADMIN') {
      if (labAppt.organizationId.toString() !== req.orgScope.toString()) {
         return res.status(403).json({ success: false, message: 'Forbidden: Cannot cancel lab appointments outside your organization.' });
      }
    }

    labAppt.status = 'Cancelled';
    labAppt.cancelledAt = new Date();
    labAppt.cancelledBy = req.user._id;
    labAppt.cancelReason = req.body.reason || 'No reason provided';

    await labAppt.save();

    res.status(200).json({ success: true, message: 'Lab appointment cancelled successfully.', labAppointment: labAppt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookLabTest,
  getMyLabAppointments,
  getOrgLabAppointments,
  updateLabStatus,
  cancelLabAppointment
};
