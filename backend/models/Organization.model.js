const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Organization name is required'], 
      trim: true 
    },
    type: { 
      type: String, 
      required: [true, 'Organization type is required'],
      enum: ['HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY'] 
    },
    email: { 
      type: String, 
      required: [true, 'Contact email is required'], 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    phone: { 
      type: String, 
      required: [true, 'Contact phone is required'] 
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: 'US' }
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    verificationStatus: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED'], 
      default: 'PENDING' 
    },
    admin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
