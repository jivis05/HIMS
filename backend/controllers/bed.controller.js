const Bed = require('../models/Bed');
const Admission = require('../models/Admission');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/inpatient/beds
 * @desc    Get all beds (scoped by organization)
 */
const getBeds = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    const beds = await Bed.find(query).populate('currentPatient', 'firstName lastName');
    return sendSuccess(res, beds, `Found ${beds.length} beds`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/inpatient/beds
 * @desc    Create a new bed
 */
const createBed = async (req, res) => {
  try {
    const bed = new Bed({
      ...req.body,
      organizationId: req.user.organizationId
    });
    await bed.save();
    return sendSuccess(res, bed, 'Bed created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/inpatient/admissions
 * @desc    Admit a patient
 */
const admitPatient = async (req, res) => {
  try {
    const { patient, bedId, reason, initialObservations } = req.body;
    
    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== 'Available') {
      return sendError(res, 'Bed is not available', 400);
    }

    // Security: Scope check
    if (req.user.role !== 'SUPER_ADMIN' && bed.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const admission = new Admission({
      patient,
      bed: bedId,
      organizationId: req.user.organizationId,
      admittedBy: req.user._id,
      reason,
      initialObservations
    });

    await admission.save();

    // Update bed status
    bed.status = 'Occupied';
    bed.currentPatient = patient;
    await bed.save();

    return sendSuccess(res, admission, 'Patient admitted successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/inpatient/admissions/:id/discharge
 * @desc    Discharge a patient
 */
const dischargePatient = async (req, res) => {
  try {
    const { dischargeSummary } = req.body;
    const admission = await Admission.findById(req.params.id);
    
    if (!admission || admission.status !== 'Admitted') {
      return sendError(res, 'Active admission not found', 404);
    }

    // Security: Scope check
    if (req.user.role !== 'SUPER_ADMIN' && admission.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    admission.status = 'Discharged';
    admission.dischargeDate = Date.now();
    admission.dischargeSummary = dischargeSummary;
    await admission.save();

    // Free the bed
    const bed = await Bed.findById(admission.bed);
    if (bed) {
      bed.status = 'Available';
      bed.currentPatient = null;
      await bed.save();
    }

    return sendSuccess(res, admission, 'Patient discharged successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/inpatient/admissions
 * @desc    Get current admissions (scoped)
 */
const getAdmissions = async (req, res) => {
  try {
    const query = { status: 'Admitted' };
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    const admissions = await Admission.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('bed', 'bedNumber ward')
      .populate('admittedBy', 'firstName lastName');
      
    return sendSuccess(res, admissions, `Found ${admissions.length} active admissions`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getBeds, createBed, admitPatient, dischargePatient, getAdmissions };
