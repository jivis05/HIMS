const express = require('express');
const router = express.Router();
const { getShifts, createShift, deleteShift } = require('../controllers/shift.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getShifts); // All roles can see their own
router.post('/', authorize('Admin', 'Hospital_Admin'), createShift);
router.delete('/:id', authorize('Admin', 'Hospital_Admin'), deleteShift);

module.exports = router;
