const { body, param } = require('express-validator');

exports.idRule = [
  param('id').isMongoId().withMessage('Invalid category id'),
];

exports.createRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
];

exports.updateRules = [
  param('id').isMongoId().withMessage('Invalid category id'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
];