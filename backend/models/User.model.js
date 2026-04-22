const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'PATIENT'],
      default: 'PATIENT',
      uppercase: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: function() {
        return this.role !== 'PATIENT' && this.role !== 'SUPER_ADMIN';
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isApproved: {
      type: Boolean,
      default: function() {
        return this.role === 'PATIENT';
      }
    },
    phone:       { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender:      { type: String, enum: ['Male', 'Female', 'Other'] },
    address: {
      street: String,
      city:   String,
      state:  String,
      zip:    String,
    },
    // Nurse-specific
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Doctor-specific
    specialty:    { type: String },
    degree:       { type: String },
    experience:   { type: Number }, // Years
    licenseNumber:{ type: String },
    hospital:     { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Updated ref
    hospitalName: { type: String }, // For Admin/Doctor reference

    // Patient-specific
    bloodGroup:   { type: String },
    emergencyContact: {
      name:  String,
      phone: String,
    },
    primaryPhysician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    bio: { type: String, maxlength: 500 },

    isActive:      { type: Boolean, default: true },
    profileImage:  { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
