const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription, dispensePrescription } = require('../controllers/prescription.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireOrgScope);

router.get('/', getPrescriptions);
router.post('/', requireRole(['DOCTOR', 'ORG_ADMIN', 'SUPER_ADMIN']), createPrescription);
router.patch('/:id/dispense', requireRole(['RECEPTIONIST', 'ORG_ADMIN', 'SUPER_ADMIN']), dispensePrescription);

module.exports = router;
