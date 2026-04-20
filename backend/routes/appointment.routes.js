const express = require('express');
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getAppointments)
  .post(protect, authorize('Patient', 'Receptionist', 'Hospital_Admin'), createAppointment);

router.patch(
  '/:id/status',
  protect,
  authorize('Doctor', 'Receptionist', 'Hospital_Admin', 'Patient'),
  updateAppointmentStatus
);

module.exports = router;
