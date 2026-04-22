const mongoose = require('mongoose');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { logAction } = require('../utils/auditLog');

/**
 * @route   POST /api/org/register
 * @desc    Register a new organization and its admin (Transaction Safe)
 */
const registerOrganization = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orgName, orgType, orgEmail, orgPhone, orgAddress, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

    const orgExists = await Organization.findOne({ email: orgEmail }).session(session);
    if (orgExists) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Organization with this email already exists.', 400);
    }

    const adminExists = await User.findOne({ email: adminEmail }).session(session);
    if (adminExists) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Admin user with this email already exists.', 400);
    }

    const organization = new Organization({
      name: orgName,
      type: orgType,
      email: orgEmail,
      phone: orgPhone,
      address: orgAddress
    });
    await organization.save({ session });

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

    organization.admin = admin._id;
    await organization.save({ session });

    await session.commitTransaction();
    session.endSession();

    await logAction(admin._id, 'ORG_REGISTER', 'Org', `Organization registered: ${orgName}`, 'Info', req.ip);

    return sendSuccess(res, {
      id: organization._id,
      name: organization.name,
      type: organization.type,
      email: organization.email,
      isVerified: organization.isVerified,
      verificationStatus: organization.verificationStatus
    }, 'Organization registered successfully. Awaiting verification.', 201);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, error.message);
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

    if (req.user.role !== 'ORG_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Forbidden: Only organization admins can create staff.', 403);
    }

    const organization = await Organization.findById(req.user.organizationId || req.body.organizationId);
    if (!organization || (!organization.isVerified && req.user.role !== 'SUPER_ADMIN')) {
      return sendError(res, 'Forbidden: Organization must be verified to create staff.', 403);
    }

    const allowedRoles = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECH'];
    if (!allowedRoles.includes(role)) {
      return sendError(res, 'Invalid role for staff creation. Must be one of: ' + allowedRoles.join(', '), 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'A user with this email already exists.', 400);
    }

    const staff = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      specialty,
      organizationId: req.user.organizationId || req.body.organizationId,
      createdBy: req.user._id,
      isApproved: true
    });

    await logAction(req.user._id, 'CREATE_STAFF', 'Org', `Staff created: ${email} (${role})`, 'Info', req.ip);

    return sendSuccess(res, staff, `${role} account created successfully.`, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/org/profile
 */
const getOrgProfile = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId).populate('admin', 'firstName lastName email');
    if (!org) return sendError(res, 'Organization not found.', 404);
    return sendSuccess(res, org);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PUT /api/org/profile
 */
const updateOrgProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.user.organizationId,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, org, 'Organization profile updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/org/staff
 */
const getOrgStaff = async (req, res) => {
  try {
    const query = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.orgScope };
    const staff = await User.find(query).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, staff, `Found ${staff.length} staff members`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  registerOrganization,
  createStaff,
  getOrgProfile,
  updateOrgProfile,
  getOrgStaff
};
