const express = require('express');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth');
const controller = require('./auth.controller');
const rules = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(rules.registerRules), controller.register);
router.post('/login', validate(rules.loginRules), controller.login);
router.get('/me', protect, controller.me);

module.exports = router;