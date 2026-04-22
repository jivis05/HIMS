const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getMyAppointments, 
  getOrgAppointments, 
  updateStatus, 
  cancelAppointment 
} = require('../controllers/lab.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

// Apply protection and org scope to all routes
router.use(protect);
router.use(requireOrgScope);

// Patient routes
router.post('/book', requireRole(['PATIENT', 'RECEPTIONIST', 'ORG_ADMIN', 'SUPER_ADMIN']), bookAppointment);
router.get('/my-appointments', requireRole(['PATIENT']), getMyAppointments);

// Staff/Admin routes
router.get('/org-appointments', requireRole(['LAB_TECH', 'ORG_ADMIN', 'SUPER_ADMIN']), getOrgAppointments);
router.patch('/:id/status', requireRole(['LAB_TECH', 'ORG_ADMIN', 'SUPER_ADMIN']), updateStatus);

// Cancellation (Shared)
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
