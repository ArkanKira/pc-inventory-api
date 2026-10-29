const ApiError = require('../../error/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const User = require('../../models/User');

exports.list = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  ApiResponse.success(res, { users, count: users.length });
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevent admin from demoting themselves — locks the system out
  if (id === req.user._id.toString()) {
    throw ApiError.forbidden('You cannot change your own role');
  }

  // findByIdAndUpdate avoids running save() validators on password (which isn't loaded because select:false)
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, { user });
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (id === req.user._id.toString()) {
    throw ApiError.forbidden('You cannot change your own status');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );

  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, { user });
};