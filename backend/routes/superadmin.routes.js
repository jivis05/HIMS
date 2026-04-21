const express = require('express');
const router = express.Router();
const { 
  getLogs, 
  getSystemStats, 
  getAllOrganizations, 
  verifyOrganization, 
  rejectOrganization 
} = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/logs', getLogs);
router.get('/stats', getSystemStats);

// Organization Management
router.get('/orgs', getAllOrganizations);
router.patch('/orgs/:id/verify', verifyOrganization);
router.patch('/orgs/:id/reject', rejectOrganization);

module.exports = router;
