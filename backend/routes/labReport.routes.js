const express = require('express');
const {
  getLabReports,
  orderLabReport,
  uploadLabResult
} = require('../controllers/labReport.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getLabReports)
  .post(protect, authorize('Doctor'), orderLabReport);

router.patch('/:id/result', protect, authorize('Lab_Technician'), uploadLabResult);

module.exports = router;
