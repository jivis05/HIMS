const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorize('Receptionist', 'Hospital_Admin'), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices); 
router.post('/:id/payment', authorize('Receptionist', 'Hospital_Admin'), invoiceController.recordPayment);

module.exports = router;
