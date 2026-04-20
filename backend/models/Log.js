const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  action: { type: String, required: true },
  resource: { type: String },
  details: { type: String },
  ip: { type: String },
  severity: { 
    type: String, 
    enum: ['Info', 'Warning', 'Error', 'Critical'],
    default: 'Info'
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
