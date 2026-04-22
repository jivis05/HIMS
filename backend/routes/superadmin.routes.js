const express = require('express');
const router = express.Router();
const { 
  getAllLogs, 
  getSystemStats, 
  getAllOrgs, 
  getAllUsers,
  getAllAppointments,
  verifyOrganization,
  rejectOrganization
} = require('../controllers/superadmin.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireRole(['SUPER_ADMIN']));

router.get('/logs', getAllLogs);
router.get('/stats', getSystemStats);

// Organization Management
router.get('/orgs', getAllOrgs);
router.patch('/orgs/:id/verify', verifyOrganization);
router.patch('/orgs/:id/reject', rejectOrganization);

// Global Access
router.get('/users', getAllUsers);
router.get('/appointments', getAllAppointments);

module.exports = router;
