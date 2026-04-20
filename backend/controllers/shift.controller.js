const Shift = require('../models/Shift');

const getShifts = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Doctor' || req.user.role === 'Pharmacist') {
      query.staff = req.user._id;
    }
    
    const shifts = await Shift.find(query)
      .populate('staff', 'firstName lastName role specialty')
      .sort({ startTime: 1 });
      
    res.status(200).json({ success: true, count: shifts.length, shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createShift = async (req, res) => {
  try {
    const { staff, department, startTime, endTime, type, notes } = req.body;
    const shift = await Shift.create({
      staff, department, startTime, endTime, type, notes
    });
    res.status(201).json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });
    res.status(200).json({ success: true, message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getShifts, createShift, deleteShift };
