const Prescription = require('../models/Prescription.model');
const Inventory = require('../models/Inventory');
const { logAction } = require('../utils/auditLog');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/prescriptions
 * @desc    Get prescriptions (scoped by organization)
 */
const getPrescriptions = async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    if (req.user.role === 'PATIENT') query.patient = req.user._id;
    else if (req.user.role === 'DOCTOR') {
      query.doctor = req.user._id;
      if (req.query.patient) query.patient = req.query.patient;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ createdAt: -1 });

    return sendSuccess(res, prescriptions, `Found ${prescriptions.length} prescriptions`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/prescriptions
 * @desc    Write a new prescription (Doctor only)
 */
const createPrescription = async (req, res) => {
  try {
    const { patient, appointment, medications, diagnosis, notes, expiresAt } = req.body;

    const prescription = await Prescription.create({
      patient, 
      doctor: req.user._id, 
      organizationId: req.user.organizationId,
      appointment,
      medications, 
      diagnosis, 
      notes, 
      expiresAt
    });

    return sendSuccess(res, prescription, 'Prescription created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/prescriptions/:id/dispense
 * @desc    Mark a prescription as dispensed (Pharmacist only)
 */
const dispensePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return sendError(res, 'Prescription not found', 404);

    // Security: Scope check
    if (req.user.role !== 'SUPER_ADMIN' && prescription.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (prescription.status !== 'Dispensed') {
      for (const med of prescription.medications) {
        // Scoped inventory lookup
        const inventoryItem = await Inventory.findOne({ 
          organizationId: prescription.organizationId,
          itemName: { $regex: new RegExp(`^${med.name}$`, 'i') } 
        });

        if (inventoryItem && inventoryItem.stockQuantity > 0) {
          inventoryItem.stockQuantity -= 1;
          await inventoryItem.save();
        }
      }
    }

    prescription.status = 'Dispensed';
    prescription.dispensedBy = req.user._id;
    prescription.dispensedAt = new Date();
    await prescription.save();

    await logAction(
      req.user._id, 'DISPENSE', 'Prescription',
      `Prescription ${req.params.id} dispensed`,
      'Info', req.ip
    );

    return sendSuccess(res, prescription, 'Prescription dispensed successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getPrescriptions, createPrescription, dispensePrescription };
