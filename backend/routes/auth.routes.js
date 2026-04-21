const express = require('express');
const { register, registerStaff, login, getMe } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/register-staff', protect, authorize('HOSPITAL_ADMIN', 'SUPER_ADMIN'), registerStaff);
router.post('/login',    login);
router.get('/me',        protect, getMe);

module.exports = router;
