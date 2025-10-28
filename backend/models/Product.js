const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['Electronics', 'Accessories', 'Home', 'Fashion', 'Sports'],
        message: '{VALUE} is not a valid category'
      }
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
      default: '📦'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
      min: [0, 'Stock cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Index for faster queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Instance method to check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity && this.isActive;
};

// Static method to get products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;