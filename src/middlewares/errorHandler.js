const { nodeEnv } = require('../config/env');

module.exports = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || (statusCode === 500 ? 'INTERNAL' : 'ERROR');
  let message = err.isOperational ? err.message : 'Something went wrong';
  let details = err.details || null;

  // Mongoose: duplicate key (unique index) — email, sku, category name
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    statusCode = 409;
    code = 'DUPLICATE_' + field.toUpperCase();
    message = `${field} already exists`;
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path} format`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired, please login again';
  }

  if (!err.isOperational && statusCode === 500) {
    console.error('UNEXPECTED:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(nodeEnv === 'development' && !err.isOperational && { stack: err.stack }),
    },
  });
};