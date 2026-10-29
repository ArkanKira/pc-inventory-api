const express = require('express');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');
const controller = require('./stockMovement.controller');
const rules = require('./stockMovement.validation');

const router = express.Router();

router.use(protect);

// Staff + admin can register movements
router.post('/', validate(rules.createRules), controller.create);

// Admin only — read history
router.get('/', restrictTo('admin'), validate(rules.listRules), controller.list);
router.get('/:id', restrictTo('admin'), validate(rules.idRule), controller.getOne);

module.exports = router;