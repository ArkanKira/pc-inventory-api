const { body, param, query } = require('express-validator');

exports.createRules = [
  body('product').isMongoId().withMessage('Valid product id is required'),
  body('type').isIn(['IN', 'OUT']).withMessage("Type must be 'IN' or 'OUT'"),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),
];

exports.idRule = [
  param('id').isMongoId().withMessage('Invalid movement id'),
];

exports.listRules = [
  query('type').optional().isIn(['IN', 'OUT']).withMessage("Type must be 'IN' or 'OUT'"),
  query('product').optional().isMongoId(),
  query('performedBy').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];