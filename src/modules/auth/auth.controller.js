const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../../config/env');
const ApiError = require('../../error/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const User = require('../../models/User');

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

/**
 * POST /api/v1/auth/register
 * Public registration — role is FORCED to 'staff'.
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // SECURITY: never trust body for role — always staff
  const user = await User.create({ name, email, password, role: 'staff' });

  const token = signToken(user);
  ApiResponse.created(res, { user, token });
};

/**
 * POST /api/v1/auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // password has select:false — must explicitly request it
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Same message for "not found" and "wrong password" — don't leak which
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is inactive');
  }

  const token = signToken(user);
  ApiResponse.success(res, { user, token });
};

/**
 * GET /api/v1/auth/me
 * Requires protect middleware
 */
exports.me = async (req, res) => {
  ApiResponse.success(res, { user: req.user });
};