const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    address: {
      street: { type: String },
      city:   { type: String },
      state:  { type: String },
      zip:    { type: String },
      country:{ type: String, default: 'US' }
    },
    phone:   { type: String },
    email:   { type: String },
    admin:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive:{ type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
