const ApiError = require('../error/ApiError');

module.exports = (req, res, next) =>
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));