const express = require('express');
const {
  getPrescriptions,
  createPrescription,
  dispensePrescription
} = require('../controllers/prescription.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getPrescriptions)
  .post(protect, authorize('Doctor'), createPrescription);

router.patch('/:id/dispense', protect, authorize('Pharmacist'), dispensePrescription);

module.exports = router;
