const ApiError = require('../../error/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const Product = require('../../models/Product');
const Category = require('../../models/Category');

/**
 * GET /products?search=&category=&minPrice=&maxPrice=&page=&limit=
 * Returns only active products (soft-deleted excluded)
 */
exports.list = async (req, res) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };

  // Text search on name OR sku (escaped to prevent ReDoS from user regex metacharacters)
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { sku: { $regex: escaped, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  ApiResponse.success(res, {
    products,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

exports.getOne = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('createdBy', 'name email');
  if (!product) throw ApiError.notFound('Product not found');
  ApiResponse.success(res, { product });
};

exports.create = async (req, res) => {
  const { name, sku, description, price, stock, category } = req.body;

  // Validate category reference
  const cat = await Category.findById(category);
  if (!cat) throw ApiError.badRequest('Invalid category', 'INVALID_CATEGORY');

  const product = await Product.create({
    name,
    sku,
    description,
    price,
    stock: stock || 0,
    category,
    // SECURITY: always from req.user — never from body
    createdBy: req.user._id,
  });

  ApiResponse.created(res, { product });
};

exports.update = async (req, res) => {
  const patch = {};
  ['name', 'sku', 'description', 'price', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) patch[f] = req.body[f];
  });

  if (req.body.category !== undefined) {
    const cat = await Category.findById(req.body.category);
    if (!cat) throw ApiError.badRequest('Invalid category', 'INVALID_CATEGORY');
    patch.category = req.body.category;
  }

  // NOTE: `stock` is intentionally excluded from update — use stock movements
  const product = await Product.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound('Product not found');

  ApiResponse.success(res, { product });
};

/**
 * Soft delete — set isActive: false.
 * Movement history stays intact for audit.
 */
exports.remove = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) throw ApiError.notFound('Product not found');

  ApiResponse.success(res, {
    message: 'Product deactivated',
    id: product._id,
  });
};