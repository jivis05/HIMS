const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('Hospital_Admin', 'Super_Admin'));

router.get('/stats', getDashboardStats);

module.exports = router;
