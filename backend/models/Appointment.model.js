const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

    date:      { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g. "10:00 AM"
    endTime:   { type: String },

    type: {
      type: String,
      enum: ['In-Person', 'Telemedicine', 'General Checkup', 'Emergency', 'Follow-up'],
      default: 'In-Person'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },

    chiefComplaint: { type: String },
    notes: { type: String },
    
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    cancelReason:{ type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
