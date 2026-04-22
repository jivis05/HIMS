const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: { type: Number, default: 0 },
  threshold: { type: Number, default: 10 }
}, { timestamps: true });

// Composite unique index
bloodStockSchema.index({ organizationId: 1, bloodGroup: 1 }, { unique: true });

module.exports = mongoose.model('BloodStock', bloodStockSchema);
