const { body, param, query } = require('express-validator');

exports.idRule = [
  param('id').isMongoId().withMessage('Invalid product id'),
];

exports.createRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('sku').trim().notEmpty().withMessage('SKU is required').isLength({ max: 64 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0').toFloat(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer').toInt(),
  body('category').isMongoId().withMessage('Valid category id is required'),
];

exports.updateRules = [
  param('id').isMongoId().withMessage('Invalid product id'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 200 }),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty').isLength({ max: 64 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be >= 0').toFloat(),
  body('category').optional().isMongoId().withMessage('Valid category id is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

exports.listRules = [
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category').optional().isMongoId().withMessage('Invalid category id'),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];