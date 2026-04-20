const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  staff: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  department: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['Morning', 'Evening', 'Night', 'On-Call'],
    default: 'Morning'
  },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
