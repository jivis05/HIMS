const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bed.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/beds', bedController.getBeds);
router.post('/beds', authorize('Hospital_Admin'), bedController.createBed);

router.get('/admissions', bedController.getAdmissions);
router.post('/admissions', authorize('Doctor', 'Hospital_Admin'), bedController.admitPatient);
router.patch('/admissions/:id/discharge', authorize('Doctor', 'Hospital_Admin'), bedController.dischargePatient);

module.exports = router;
