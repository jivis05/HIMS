const express = require('express');
const router = express.Router();
const { getBloodStock, updateBloodStock, getDonors, addDonor } = require('../controllers/bloodbank.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireOrgScope);

router.get('/stock', getBloodStock);
router.post('/stock', requireRole(['LAB_TECH', 'ORG_ADMIN', 'SUPER_ADMIN']), updateBloodStock);
router.get('/donors', getDonors);
router.post('/donors', requireRole(['LAB_TECH', 'ORG_ADMIN', 'SUPER_ADMIN']), addDonor);

module.exports = router;
