const { body, param } = require('express-validator');

exports.roleRules = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('role')
    .isIn(['admin', 'staff'])
    .withMessage("Role must be 'admin' or 'staff'"),
];

exports.statusRules = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean (true/false)'),
];