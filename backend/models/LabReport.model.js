const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Doctor
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Lab tech

    testType:   { type: String, required: true },  // e.g. "Lipid Panel", "CBC"
    testCode:   { type: String },
    sampleType: { type: String },  // e.g. "Blood", "Urine"

    priority: {
      type: String,
      enum: ['Normal', 'Routine', 'Urgent', 'STAT'],
      default: 'Normal'
    },
    status: {
      type: String,
      enum: ['Awaiting_Sample', 'In_Progress', 'Completed', 'Canceled'],
      default: 'Awaiting_Sample'
    },

    results: { type: String },
    remarks: { type: String },
    isCritical: { type: Boolean, default: false },

    reportFileUrl: { type: String },
    completedAt:   { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabReport', labReportSchema);
