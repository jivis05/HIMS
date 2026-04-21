const express = require('express');
const router = express.Router();
const {
  bookLabTest,
  getMyLabAppointments,
  getOrgLabAppointments,
  updateLabStatus,
  cancelLabAppointment
} = require('../controllers/lab.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);

// Shared booking route (both PATIENT and STAFF can book)
router.post('/book', requireOrgScope, bookLabTest);

// Patient routes
router.get('/my-appointments', requireRole(['PATIENT']), getMyLabAppointments);

// Org Staff routes
router.get('/org-appointments', requireOrgScope, getOrgLabAppointments);
router.patch('/:id/status', requireOrgScope, updateLabStatus);

// Cancel route (Logic internally handles PATIENT vs ORG STAFF vs SUPER_ADMIN)
router.patch('/:id/cancel', requireOrgScope, cancelLabAppointment);

module.exports = router;
