const Consent = require('../models/Consent.model');
const { logAction } = require('../utils/auditLog');

/**
 * @route   POST /api/consent
 * @desc    Grant new consent to a doctor or hospital
 * @access  Private (Patient)
 */
const grantConsent = async (req, res) => {
  try {
    const { doctor, hospital, expiresAt } = req.body;

    if (req.user.role !== 'Patient') {
      return res.status(403).json({ success: false, message: 'Only patients can grant clinical consent.' });
    }

    const consent = await Consent.create({
      patient: req.user._id,
      doctor,
      hospital,
      expiresAt: new Date(expiresAt)
    });

    await logAction(
      req.user._id, 'GRANT_CONSENT', 'Consent',
      `Patient granted consent to ${doctor ? 'Doctor '+doctor : 'Hospital '+hospital}`,
      'Info', req.ip
    );

    res.status(201).json({ success: true, consent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/consent/my-consents
 * @desc    Get all consents granted by the current patient
 * @access  Private (Patient)
 */
const getMyConsents = async (req, res) => {
  try {
    const consents = await Consent.find({ patient: req.user._id })
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, consents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/consent/:id/revoke
 * @desc    Revoke a consent
 * @access  Private (Patient)
 */
const revokeConsent = async (req, res) => {
  try {
    const consent = await Consent.findOne({ _id: req.params.id, patient: req.user._id });
    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent record not found.' });
    }

    consent.status = 'Revoked';
    await consent.save();

    await logAction(
      req.user._id, 'REVOKE_CONSENT', 'Consent',
      `Patient revoked consent ID ${req.params.id}`,
      'Warning', req.ip
    );

    res.status(200).json({ success: true, message: 'Consent revoked successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { grantConsent, getMyConsents, revokeConsent };
