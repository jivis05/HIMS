const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema(
  {
    patient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    doctor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    hospital: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hospital' 
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked', 'Expired'],
      default: 'Active'
    },
    expiresAt: { 
      type: Date, 
      required: true 
    }
  },
  { timestamps: true }
);

// Index for quick lookup
consentSchema.index({ patient: 1, doctor: 1, status: 1 });
consentSchema.index({ patient: 1, hospital: 1, status: 1 });

module.exports = mongoose.model('Consent', consentSchema);
