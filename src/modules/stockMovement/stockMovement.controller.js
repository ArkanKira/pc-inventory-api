const ApiError = require('../../error/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const Product = require('../../models/Product');
const StockMovement = require('../../models/StockMovement');

/**
 * POST /stock-movements
 *
 * Strategy (no transactions):
 * 1. Atomic conditional update via findOneAndUpdate:
 *    - Prevents negative stock under concurrent requests (OUT filter requires stock >= quantity)
 * 2. Insert movement record
 * 3. If insert fails → compensating update to revert stock
 */
exports.create = async (req, res) => {
  const { product: productId, type, quantity } = req.body;

  // Build atomic filter
  const filter = { _id: productId, isActive: true };
  if (type === 'OUT') {
    filter.stock = { $gte: quantity }; // hard guard against negative
  }

  const delta = type === 'IN' ? quantity : -quantity;

  // Atomic update — either succeeds fully or returns null
  const product = await Product.findOneAndUpdate(
    filter,
    { $inc: { stock: delta } },
    { new: true }
  );

  if (!product) {
    // Distinguish "not found/inactive" from "insufficient stock"
    const exists = await Product.findById(productId);
    if (!exists || !exists.isActive) {
      throw ApiError.notFound('Product not found or inactive');
    }
    throw ApiError.conflict(
      'Insufficient stock for this OUT movement',
      'INSUFFICIENT_STOCK'
    );
  }

  // Record the movement — immutable audit trail
  let movement;
  try {
    movement = await StockMovement.create({
      product: product._id,
      type,
      quantity,
      // SECURITY: from token, never from body
      performedBy: req.user._id,
    });
  } catch (err) {
    // Compensating action — revert stock if we couldn't record the movement
    await Product.updateOne(
      { _id: product._id },
      { $inc: { stock: -delta } }
    );
    throw ApiError.internal('Failed to record stock movement; stock reverted');
  }

  ApiResponse.created(res, {
    movement,
    product: {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
    },
  });
};

exports.list = async (req, res) => {
  const { type, product, performedBy, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (product) filter.product = product;
  if (performedBy) filter.performedBy = performedBy;

  const skip = (page - 1) * limit;
  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate('product', 'name sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    StockMovement.countDocuments(filter),
  ]);

  ApiResponse.success(res, {
    movements,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

exports.getOne = async (req, res) => {
  const movement = await StockMovement.findById(req.params.id)
    .populate('product', 'name sku')
    .populate('performedBy', 'name email');
  if (!movement) throw ApiError.notFound('Movement not found');
  ApiResponse.success(res, { movement });
};