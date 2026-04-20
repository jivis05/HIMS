const express = require('express');
const router = express.Router();
const { getBloodStock, updateBloodStock, getDonors, addDonor } = require('../controllers/bloodbank.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/stock', getBloodStock);
router.post('/stock', authorize('Admin', 'Hospital_Admin', 'Lab_Technician'), updateBloodStock);
router.get('/donors', getDonors);
router.post('/donors', authorize('Admin', 'Hospital_Admin', 'Lab_Technician'), addDonor);

module.exports = router;
