const mongoose = require('mongoose');

const labAppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    labTechnicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    testType: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: {
      type: Date
    },
    cancelReason: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Indexes for faster lookups
labAppointmentSchema.index({ organizationId: 1, status: 1 });
labAppointmentSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('LabAppointment', labAppointmentSchema);
