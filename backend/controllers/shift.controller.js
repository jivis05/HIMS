const Shift = require('../models/Shift');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/shifts
 * @desc    Get shifts (scoped)
 */
const getShifts = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    if (['DOCTOR', 'NURSE', 'LAB_TECH', 'RECEPTIONIST'].includes(req.user.role)) {
      query.staff = req.user._id;
    }
    
    const shifts = await Shift.find(query)
      .populate('staff', 'firstName lastName role specialty')
      .sort({ startTime: 1 });
      
    return sendSuccess(res, shifts, `Found ${shifts.length} shifts`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/shifts
 * @desc    Create a new shift
 */
const createShift = async (req, res) => {
  try {
    const shift = await Shift.create({
      ...req.body,
      organizationId: req.user.organizationId
    });
    return sendSuccess(res, shift, 'Shift created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete a shift
 */
const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return sendError(res, 'Shift not found', 404);

    // Security check
    if (req.user.role !== 'SUPER_ADMIN' && shift.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    await Shift.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Shift deleted successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getShifts, createShift, deleteShift };
