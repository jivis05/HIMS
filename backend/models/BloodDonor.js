const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  phone: { type: String, required: true },
  email: { type: String },
  lastDonationDate: { type: Date },
  medicalHistory: { type: String },
  donations: [{
     date: { type: Date, default: Date.now },
     units: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
