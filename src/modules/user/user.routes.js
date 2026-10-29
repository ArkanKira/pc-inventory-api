const express = require('express');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');
const controller = require('./user.controller');
const rules = require('./user.validation');

const router = express.Router();

// All user routes are admin-only
router.use(protect, restrictTo('admin'));

router.get('/', controller.list);
router.patch('/:id/role', validate(rules.roleRules), controller.updateRole);
router.patch('/:id/status', validate(rules.statusRules), controller.updateStatus);

module.exports = router;