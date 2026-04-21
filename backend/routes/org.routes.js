const express = require('express');
const router = express.Router();
const { 
  registerOrganization, 
  createStaff, 
  getOrgProfile, 
  updateOrgProfile, 
  getOrgStaff 
} = require('../controllers/org.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route for organization registration
router.post('/register', registerOrganization);

// Protected routes for ORG_ADMIN
router.use(protect);
router.use(authorize('ORG_ADMIN'));

router.post('/users', createStaff);
router.get('/profile', getOrgProfile);
router.put('/profile', updateOrgProfile);
router.get('/staff', getOrgStaff);

module.exports = router;
