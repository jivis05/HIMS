const mongoose = require('mongoose');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { logAction } = require('../utils/auditLog');


/**
 * @route   POST /api/org/register
 * @desc    Register a new organization and its admin (Transaction Safe)
 * @access  Public
 */
const registerOrganization = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orgName, orgType, orgEmail, orgPhone, orgAddress, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

    // 1. Check if org or admin already exists
    const orgExists = await Organization.findOne({ email: orgEmail }).session(session);
    if (orgExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Organization with this email already exists.' });
    }

    const adminExists = await User.findOne({ email: adminEmail }).session(session);
    if (adminExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Admin user with this email already exists.' });
    }

    // 2. Create Organization (isVerified = false by default)
    const organization = new Organization({
      name: orgName,
      type: orgType,
      email: orgEmail,
      phone: orgPhone,
      address: orgAddress
    });
    await organization.save({ session });

    // 3. Create ORG_ADMIN
    const admin = new User({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword,
      role: 'ORG_ADMIN',
      organizationId: organization._id,
      isApproved: true
    });
    await admin.save({ session });

    // 4. Link admin back to organization
    organization.admin = admin._id;
    await organization.save({ session });

    await session.commitTransaction();
    session.endSession();

    await logAction(admin._id, 'ORG_REGISTER', 'Org', `Organization registered: ${orgName}`, 'Info', req.ip);

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully. Awaiting verification.',
      organization: {
        id: organization._id,
        name: organization.name,
        type: organization.type,
        email: organization.email,
        isVerified: organization.isVerified,
        verificationStatus: organization.verificationStatus
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/org/users
 * @desc    Create a staff account for an organization
 * @access  Protected (ORG_ADMIN only)
 */
const createStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, specialty } = req.body;

    // 1. Enforce ORG_ADMIN role
    if (req.user.role !== 'ORG_ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only organization admins can create staff.' });
    }

    // 2. Check if organization is verified
    const organization = await Organization.findById(req.user.organizationId);
    if (!organization || !organization.isVerified) {
      return res.status(403).json({ success: false, message: 'Forbidden: Organization must be verified to create staff.' });
    }

    // 3. Prevent creating Patients or other high-level roles
    const allowedRoles = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role for staff creation.' });
    }

    // 4. Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // 5. Create Staff User
    const staff = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      specialty,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
      isApproved: true
    });

    await logAction(req.user._id, 'CREATE_STAFF', 'Org', `Staff created: ${email} (${role})`, 'Info', req.ip);

    res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      user: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/org/profile
 * @desc    Get organization profile
 * @access  Protected (ORG_ADMIN)
 */
const getOrgProfile = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId).populate('admin', 'firstName lastName email');
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }
    res.status(200).json({ success: true, organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/org/profile
 * @desc    Update organization profile
 * @access  Protected (ORG_ADMIN)
 */
const updateOrgProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.user.organizationId,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/org/staff
 * @desc    Get all staff for the organization
 * @access  Protected (ORG_ADMIN)
 */
const getOrgStaff = async (req, res) => {
  try {
    const staff = await User.find({ organizationId: req.user.organizationId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerOrganization,
  createStaff,
  getOrgProfile,
  updateOrgProfile,
  getOrgStaff
};
