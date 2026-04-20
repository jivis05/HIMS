const Inventory = require('../models/Inventory.js');

const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ itemName: 1 });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addInventoryItem = async (req, res) => {
  try {
    const { itemName, category, stockQuantity, unit, threshold, supplier, pricePerUnit } = req.body;
    const item = await Inventory.create({
      itemName, category, stockQuantity, unit, threshold, supplier, pricePerUnit
    });
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { quantity, action } = req.body; // action: 'add' or 'subtract'
    const item = await Inventory.findById(req.params.id);
    
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (action === 'add') {
      item.stockQuantity += Number(quantity);
      item.lastRestocked = new Date();
    } else {
      item.stockQuantity -= Number(quantity);
    }

    await item.save();
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lte: ["$stockQuantity", "$threshold"] }
    });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInventory, addInventoryItem, updateStock, getLowStock };
