const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String, required: true },  // e.g. "10mg"
  frequency: { type: String, required: true },  // e.g. "Twice daily"
  duration:  { type: String },                  // e.g. "7 days"
  notes:     { type: String },
});

const prescriptionSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },

    medications: [medicationSchema],
    diagnosis:   { type: String },
    notes:       { type: String },

    status: {
      type: String,
      enum: ['Active', 'Dispensed', 'Expired', 'Cancelled'],
      default: 'Active'
    },
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dispensedAt: { type: Date },
    expiresAt:   { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
