const Prescription = require('../models/Prescription.model');
const Inventory = require('../models/Inventory');

/**
 * @route   GET /api/prescriptions
 * @desc    Get prescriptions (role-aware)
 */
const getPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Patient') query.patient = req.user._id;
    else if (req.user.role === 'Doctor') query.doctor = req.user._id;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      patient, doctor: req.user._id, appointment,
      medications, diagnosis, notes, expiresAt
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/prescriptions/:id/dispense
 * @desc    Mark a prescription as dispensed (Pharmacist only)
 */
const dispensePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    // NEW: Subtract stock from Inventory
    if (prescription.status !== 'Dispensed') {
      for (const med of prescription.medications) {
        // Find item in inventory by name (case-insensitive)
        const inventoryItem = await Inventory.findOne({ 
          itemName: { $regex: new RegExp(`^${med.name}$`, 'i') } 
        });

        if (inventoryItem && inventoryItem.stockQuantity > 0) {
          inventoryItem.stockQuantity -= 1; // Basic assumption: 1 unit per prescription
          await inventoryItem.save();
        }
      }
    }

    prescription.status = 'Dispensed';
    prescription.dispensedBy = req.user._id;
    prescription.dispensedAt = new Date();
    await prescription.save();

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPrescriptions, createPrescription, dispensePrescription };
