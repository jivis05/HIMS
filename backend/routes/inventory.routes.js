const express = require('express');
const router = express.Router();
const { getInventory, addInventoryItem, updateStock, getLowStock } = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorize('Admin', 'Receptionist', 'Doctor'), getInventory);
router.get('/low-stock', authorize('Admin', 'Receptionist'), getLowStock);
router.post('/', authorize('Admin', 'Receptionist'), addInventoryItem);
router.patch('/:id/stock', authorize('Admin', 'Receptionist'), updateStock);

module.exports = router;
