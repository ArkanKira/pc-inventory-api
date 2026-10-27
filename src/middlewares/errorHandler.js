const { nodeEnv } = require('../config/env');

module.exports = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? 'INTERNAL' : 'ERROR');
  const message = err.isOperational ? err.message : 'Something went wrong';

  if (!err.isOperational) console.error('UNEXPECTED:', err);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(nodeEnv === 'development' && !err.isOperational && { stack: err.stack }),
    },
  });
};