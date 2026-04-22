const mongoose = require('mongoose');

/**
 * Sanitize an object or array to ensure it doesn't contain undefined or NaN.
 * - numbers → default 0
 * - arrays → []
 * - strings → ""
 * @param {any} data 
 * @returns {any}
 */
const sanitize = (data) => {
  if (data === null || data === undefined) return null;

  // Handle Mongoose documents
  if (data && typeof data.toObject === 'function') {
    data = data.toObject();
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }

  if (data instanceof Date) return data;
  if (data instanceof mongoose.Types.ObjectId) return data.toString();

  if (typeof data === 'object') {
    // Prevent recursion on non-plain objects if any left
    if (data.constructor && data.constructor.name !== 'Object') {
       return String(data);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        sanitized[key] = isNaN(value) ? 0 : value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => sanitize(item));
      } else if (typeof value === 'string') {
        sanitized[key] = value || "";
      } else if (value && typeof value === 'object') {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value ?? "";
      }
    }
    return sanitized;
  }

  if (typeof data === 'number') {
    return isNaN(data) ? 0 : data;
  }

  if (typeof data === 'string') {
    return data || "";
  }

  return data;
};

/**
 * Standardized success response structure.
 * res.data.data on frontend
 */
const sendSuccess = (res, data, message = 'Success', status = 200) => {
  try {
    const sanitizedData = sanitize(data);
    
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      const count = Array.isArray(sanitizedData) ? sanitizedData.length : (sanitizedData ? 1 : 0);
      console.log(`[RESPONSE DEBUG] Status: ${status} | Count: ${count}`);
    }

    return res.status(status).json({
      success: true,
      message,
      data: sanitizedData
    });
  } catch (err) {
    console.error('[SANITY CHECK ERROR]', err);
    // If sanitization fails, send raw data as fallback or error
    return res.status(status).json({
      success: true,
      message,
      data: data 
    });
  }
};

/**
 * Standardized error response structure.
 */
const sendError = (res, message = 'Internal Server Error', status = 500) => {
  return res.status(status).json({
    success: false,
    message,
    data: null
  });
};

module.exports = { sanitize, sendSuccess, sendError };
