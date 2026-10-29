const express = require('express');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');
const controller = require('./category.controller');
const rules = require('./category.validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Read — any authenticated user
router.get('/', controller.list);
router.get('/:id', validate(rules.idRule), controller.getOne);

// Mutations — admin only
router.post('/', restrictTo('admin'), validate(rules.createRules), controller.create);
router.patch('/:id', restrictTo('admin'), validate(rules.updateRules), controller.update);
router.delete('/:id', restrictTo('admin'), validate(rules.idRule), controller.remove);

module.exports = router;