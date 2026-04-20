const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Doctor or Admin
  assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Admitted', 'Discharged', 'Transfer'], default: 'Admitted' },
  initialObservations: { type: String },
  dischargeSummary: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
