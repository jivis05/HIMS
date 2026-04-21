const Log = require('../models/Log');
const User = require('../models/User.model');
const Invoice = require('../models/Invoice');
const Organization = require('../models/Organization.model');
const { logAction } = require('../utils/auditLog');

/**
 * @desc Get all audit logs
 */
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('user', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get system-wide statistics
 */
const getSystemStats = async (req, res) => {
  try {
    const [userCount, doctorCount, totalRevenue, orgCount] = await Promise.all([
      User.countDocuments({ role: 'PATIENT' }),
      User.countDocuments({ role: 'DOCTOR' }),
      Invoice.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Organization.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activePatients: userCount,
        doctorsOnStaff: doctorCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrganizations: orgCount,
        systemHealth: 'Optimal'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc List all organizations
 */
const getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find()
      .populate('admin', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orgs.length, organizations: orgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Verify/Approve organization
 */
const verifyOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verificationStatus: 'APPROVED' },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    await logAction(req.user._id, 'ORG_VERIFY', 'SuperAdmin', `Organization approved: ${org.name}`, 'Info', req.ip);

    res.status(200).json({ success: true, message: 'Organization approved successfully.', organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Reject organization
 */
const rejectOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, verificationStatus: 'REJECTED' },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    await logAction(req.user._id, 'ORG_REJECT', 'SuperAdmin', `Organization rejected: ${org.name}`, 'Warning', req.ip);

    res.status(200).json({ success: true, message: 'Organization rejected.', organization: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getLogs, 
  getSystemStats, 
  getAllOrganizations, 
  verifyOrganization, 
  rejectOrganization 
};
