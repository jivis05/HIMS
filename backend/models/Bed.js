const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  type: { type: String, enum: ['General', 'Semi-Private', 'Private', 'ICU'], default: 'General' },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'], default: 'Available' },
  pricePerDay: { type: Number, required: true },
  currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastCleaned: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bed', bedSchema);
