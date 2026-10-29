const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../error/ApiError');
const User = require('../models/User');

/**
 * Verify JWT from Authorization header and attach req.user.
 */
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Not authenticated'));
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret); // throws if invalid/expired

    const user = await User.findById(payload.id);
    if (!user) return next(ApiError.unauthorized('User no longer exists'));
    if (!user.isActive) return next(ApiError.unauthorized('Account is inactive'));

    req.user = user;
    next();
  } catch (err) {
    // JWT verify throws JsonWebTokenError/TokenExpiredError — errorHandler converts them
    next(err);
  }
};

/**
 * Restrict access to specific roles.
 * Usage: router.get('/', protect, restrictTo('admin'), controller)
 */
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};