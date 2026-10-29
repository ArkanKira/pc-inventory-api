const ApiError = require('../../error/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const Category = require('../../models/Category');
const Product = require('../../models/Product');

exports.list = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  ApiResponse.success(res, { categories, count: categories.length });
};

exports.getOne = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  ApiResponse.success(res, { category });
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  ApiResponse.created(res, { category });
};

exports.update = async (req, res) => {
  const { name, description } = req.body;

  const patch = {};
  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    patch,
    { new: true, runValidators: true }
  );

  if (!category) throw ApiError.notFound('Category not found');
  ApiResponse.success(res, { category });
};

exports.remove = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  // Prevent deletion if any product references this category
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category: ${productCount} product(s) reference it`,
      'CATEGORY_IN_USE'
    );
  }

  await category.deleteOne();
  ApiResponse.success(res, { message: 'Category deleted', id: category._id });
};