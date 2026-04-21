const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Middleware to protect routes by verifying JWT token.
 */
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!req.user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your account is pending approval.' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token is invalid.' });
  }
};

/**
 * Middleware to restrict access to specific roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not permitted for this resource.`
      });
    }
    next();
  };
};

/**
 * Middleware to ensure user belongs to the requested organization.
 */
const checkOrgAccess = (req, res, next) => {
  const resourceOrgId = req.params.orgId || req.body.organizationId || req.query.organizationId;
  
  if (req.user.role === 'Super_Admin') return next();

  if (!req.user.organizationId || req.user.organizationId.toString() !== resourceOrgId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: You do not belong to this organization.' 
    });
  }
  next();
};

module.exports = { protect, authorize, checkOrgAccess };
