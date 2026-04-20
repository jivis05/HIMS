const Bed = require('../models/Bed');
const Admission = require('../models/Admission');

// Get all beds
exports.getBeds = async (req, res) => {
  try {
    const beds = await Bed.find().populate('currentPatient', 'firstName lastName');
    res.json({ beds });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching beds', error: error.message });
  }
};

// Create a new bed
exports.createBed = async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json({ bed });
  } catch (error) {
    res.status(500).json({ message: 'Error creating bed', error: error.message });
  }
};

// Admit a patient
exports.admitPatient = async (req, res) => {
  try {
    const { patient, bedId, reason, initialObservations } = req.body;
    
    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== 'Available') {
      return res.status(400).json({ message: 'Bed is not available' });
    }

    const admission = new Admission({
      patient,
      bed: bedId,
      admittedBy: req.user.id,
      reason,
      initialObservations
    });

    await admission.save();

    // Update bed status
    bed.status = 'Occupied';
    bed.currentPatient = patient;
    await bed.save();

    res.status(201).json({ message: 'Patient admitted successfully', admission });
  } catch (error) {
    res.status(500).json({ message: 'Error admitting patient', error: error.message });
  }
};

// Discharge a patient
exports.dischargePatient = async (req, res) => {
  try {
    const { dischargeSummary } = req.body;
    const admission = await Admission.findById(req.params.id);
    
    if (!admission || admission.status !== 'Admitted') {
      return res.status(404).json({ message: 'Active admission not found' });
    }

    admission.status = 'Discharged';
    admission.dischargeDate = Date.now();
    admission.dischargeSummary = dischargeSummary;
    await admission.save();

    // Free the bed
    const bed = await Bed.findById(admission.bed);
    if (bed) {
      bed.status = 'Available'; // Or 'Maintenance' if we want reality
      bed.currentPatient = null;
      await bed.save();
    }

    res.json({ message: 'Patient discharged successfully', admission });
  } catch (error) {
    res.status(500).json({ message: 'Error discharging patient', error: error.message });
  }
};

// Get current admissions
exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ status: 'Admitted' })
      .populate('patient', 'firstName lastName email')
      .populate('bed', 'bedNumber ward')
      .populate('admittedBy', 'firstName lastName');
    res.json({ admissions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admissions', error: error.message });
  }
};
