const express = require('express');
const {
  getAppointments,
  createAppointment,
  cancelAppointment,
  updateAppointmentStatus
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getAppointments)
  .post(protect, authorize('PATIENT', 'RECEPTIONIST', 'ORG_ADMIN'), createAppointment);

router.patch(
  '/:id/cancel',
  protect,
  cancelAppointment
);

router.patch(
  '/:id/status',
  protect,
  authorize('DOCTOR', 'RECEPTIONIST', 'ORG_ADMIN', 'PATIENT'),
  updateAppointmentStatus
);

module.exports = router;
