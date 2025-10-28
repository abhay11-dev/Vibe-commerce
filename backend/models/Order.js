const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: '📦'
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
      }
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'mock'],
      default: 'mock'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid'
    },
    notes: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
  return `$${this.total.toFixed(2)}`;
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Calculate tax (example: 8%)
    this.tax = this.subtotal * 0.08;
    
    // Free shipping for orders over $100
    this.shipping = this.subtotal >= 100 ? 0 : 10;
    
    // Calculate total
    this.total = this.subtotal + this.tax + this.shipping;
  }
  next();
});

// Index for faster queries
orderSchema.index({ 'customerInfo.email': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Static method to find orders by email
orderSchema.statics.findByEmail = function(email) {
  return this.find({ 'customerInfo.email': email }).sort({ createdAt: -1 });
};

// Instance method to get order summary
orderSchema.methods.getSummary = function() {
  return {
    orderId: this.orderId,
    customerName: this.customerInfo.name,
    itemCount: this.itemCount,
    total: this.formattedTotal,
    status: this.status,
    orderDate: this.createdAt
  };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;