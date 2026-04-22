const express = require('express');
const router = express.Router();
const { getInventory, addInventoryItem, updateStock, getLowStock } = require('../controllers/inventory.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireOrgScope);

router.get('/', getInventory);
router.get('/low-stock', getLowStock);
router.post('/', requireRole(['ORG_ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'LAB_TECH']), addInventoryItem);
router.patch('/:id/stock', requireRole(['ORG_ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'LAB_TECH']), updateStock);

module.exports = router;
