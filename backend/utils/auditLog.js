const Log = require('../models/Log');
const logger = require('./logger');

/**
 * Write an audit log entry to the database.
 * Failures are silently swallowed so that a logging error never breaks a
 * business-critical request.
 *
 * @param {string|null} userId   - ObjectId of the acting user (null for anonymous)
 * @param {string}      action   - Short verb, e.g. 'LOGIN', 'REGISTER', 'DISPENSE'
 * @param {string}      resource - Entity affected, e.g. 'Auth', 'Prescription'
 * @param {string}      details  - Human-readable description
 * @param {string}      severity - 'Info' | 'Warning' | 'Error' | 'Critical'
 * @param {string}      ip       - Client IP address (optional)
 */
const logAction = async (userId, action, resource, details, severity = 'Info', ip = '') => {
  try {
    await Log.create({ user: userId || undefined, action, resource, details, severity, ip });
  } catch (err) {
    // Never crash the app because of a failed audit write
    logger.error('Audit log write failed', { action, resource, error: err.message });
  }
};

module.exports = { logAction };
