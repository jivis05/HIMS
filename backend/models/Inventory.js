const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['Pharmacy', 'Lab', 'Clinical Supplies', 'General'], 
    required: true 
  },
  stockQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., 'Tabs', 'Vials', 'Boxes'
  threshold: { type: Number, required: true, default: 10 }, // Low stock alert level
  supplier: { type: String },
  lastRestocked: { type: Date, default: Date.now },
  pricePerUnit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
