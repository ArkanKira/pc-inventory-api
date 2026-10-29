const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 64 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: { validator: Number.isInteger, message: 'Stock must be an integer' },
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);