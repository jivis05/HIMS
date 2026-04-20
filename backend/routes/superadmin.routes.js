const express = require('express');
const router = express.Router();
const { getLogs, getSystemStats } = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('Super_Admin'));

router.get('/logs', getLogs);
router.get('/stats', getSystemStats);

module.exports = router;
