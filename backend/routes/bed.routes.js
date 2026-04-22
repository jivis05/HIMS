const express = require('express');
const router = express.Router();
const { getBeds, createBed, admitPatient, dischargePatient, getAdmissions } = require('../controllers/bed.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireOrgScope);

router.get('/beds', getBeds);
router.post('/beds', requireRole(['ORG_ADMIN', 'SUPER_ADMIN', 'NURSE']), createBed);
router.get('/admissions', getAdmissions);
router.post('/admissions', requireRole(['NURSE', 'DOCTOR', 'ORG_ADMIN', 'SUPER_ADMIN']), admitPatient);
router.patch('/admissions/:id/discharge', requireRole(['NURSE', 'DOCTOR', 'ORG_ADMIN', 'SUPER_ADMIN']), dischargePatient);

module.exports = router;
