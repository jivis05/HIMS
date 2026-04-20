const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
    unique: true
  },
  units: { type: Number, default: 0 },
  threshold: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model('BloodStock', bloodStockSchema);
