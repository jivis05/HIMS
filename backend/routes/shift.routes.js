const express = require('express');
const router = express.Router();
const { getShifts, createShift, deleteShift } = require('../controllers/shift.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireOrgScope);

router.get('/', getShifts);
router.post('/', requireRole(['ORG_ADMIN', 'SUPER_ADMIN']), createShift);
router.delete('/:id', requireRole(['ORG_ADMIN', 'SUPER_ADMIN']), deleteShift);

module.exports = router;
