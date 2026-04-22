const Consent = require('../models/Consent.model');
const { logAction } = require('../utils/auditLog');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @route   POST /api/consent
 * @desc    Grant new consent to a doctor or organization
 */
const grantConsent = async (req, res) => {
  try {
    const { doctor, organizationId, expiresAt } = req.body;

    if (req.user.role !== 'PATIENT') {
      return sendError(res, 'Only patients can grant clinical consent.', 403);
    }

    const consent = await Consent.create({
      patient: req.user._id,
      doctor,
      organizationId,
      expiresAt: new Date(expiresAt)
    });

    await logAction(
      req.user._id, 'GRANT_CONSENT', 'Consent',
      `Patient granted consent to ${doctor ? 'Doctor '+doctor : 'Organization '+organizationId}`,
      'Info', req.ip
    );

    return sendSuccess(res, consent, 'Consent granted successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   GET /api/consent/my-consents
 * @desc    Get all consents granted by the current patient
 */
const getMyConsents = async (req, res) => {
  try {
    if (req.user.role !== 'PATIENT') {
      return sendError(res, 'Only patients can view their granted consents.', 403);
    }

    const consents = await Consent.find({ patient: req.user._id })
      .populate('doctor', 'firstName lastName specialty')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, consents, `Found ${consents.length} consents`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * @route   PATCH /api/consent/:id/revoke
 * @desc    Revoke a consent
 */
const revokeConsent = async (req, res) => {
  try {
    const consent = await Consent.findOne({ _id: req.params.id, patient: req.user._id });
    if (!consent) return sendError(res, 'Consent record not found.', 404);

    consent.status = 'Revoked';
    await consent.save();

    await logAction(
      req.user._id, 'REVOKE_CONSENT', 'Consent',
      `Patient revoked consent ID ${req.params.id}`,
      'Warning', req.ip
    );

    return sendSuccess(res, null, 'Consent revoked successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { grantConsent, getMyConsents, revokeConsent };
