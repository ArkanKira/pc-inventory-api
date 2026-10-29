const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], unique: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);