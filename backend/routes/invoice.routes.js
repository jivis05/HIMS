const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, recordPayment } = require('../controllers/invoice.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireOrgScope);

router.post('/', requireRole(['RECEPTIONIST', 'ORG_ADMIN', 'SUPER_ADMIN']), createInvoice);
router.get('/', getInvoices);
router.post('/:id/payment', requireRole(['RECEPTIONIST', 'ORG_ADMIN', 'SUPER_ADMIN']), recordPayment);

module.exports = router;
