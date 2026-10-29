const { validationResult } = require('express-validator');
const ApiError = require('../error/ApiError');

/**
 * Wrap express-validator chains into a single middleware.
 * Usage: router.post('/', validate([body('email').isEmail()]), controller)
 */
module.exports = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', details));
  },
];