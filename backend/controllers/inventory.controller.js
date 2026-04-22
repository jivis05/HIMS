const Inventory = require('../models/Inventory.js');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   GET /api/inventory
 * @desc    Get inventory items (scoped)
 */
const getInventory = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    const items = await Inventory.find(query).sort({ itemName: 1 });
    return sendSuccess(res, items, `Found ${items.length} items`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   POST /api/inventory
 * @desc    Add new inventory item
 */
const addInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create({
      ...req.body,
      organizationId: req.user.organizationId
    });
    return sendSuccess(res, item, 'Inventory item added successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/inventory/:id/stock
 * @desc    Update stock quantity
 */
const updateStock = async (req, res) => {
  try {
    const { quantity, action } = req.body;
    const item = await Inventory.findById(req.params.id);
    
    if (!item) return sendError(res, 'Item not found', 404);

    // Security: Scope check
    if (req.user.role !== 'SUPER_ADMIN' && item.organizationId?.toString() !== req.user.organizationId?.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (action === 'add') {
      item.stockQuantity += Number(quantity);
      item.lastRestocked = new Date();
    } else {
      item.stockQuantity -= Number(quantity);
    }

    await item.save();
    return sendSuccess(res, item, 'Stock updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/inventory/low-stock
 * @desc    Get low stock items
 */
const getLowStock = async (req, res) => {
  try {
    const query = {
      $expr: { $lte: ["$stockQuantity", "$threshold"] }
    };
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else {
      query.organizationId = req.user.organizationId;
    }

    const items = await Inventory.find(query);
    return sendSuccess(res, items, `Found ${items.length} low stock items`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getInventory, addInventoryItem, updateStock, getLowStock };
