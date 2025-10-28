const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @route   POST /api/checkout
 * @desc    Process checkout and create order
 * @access  Public
 * @body    { cartItems, customerInfo, sessionId }
 */
router.post('/', async (req, res, next) => {
  try {
    const { cartItems, customerInfo, sessionId } = req.body;
    
    // Validate input
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required (name and email)'
      });
    }
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customerInfo.email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Verify all products exist and are in stock
    const orderItems = [];
    let subtotal = 0;
    
    for (const item of cartItems) {
      const product = await Product.findById(item.id || item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || item.id}`
        });
      }
      
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product is no longer available: ${product.name}`
        });
      }
      
      if (!product.isInStock(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
        });
      }
      
      // Add to order items
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
      
      subtotal += product.price * item.quantity;
    }
    
    // Calculate totals
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;
    
    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;
    
    // Create order
    const order = await Order.create({
      orderId,
      customerInfo: {
        name: customerInfo.name.trim(),
        email: customerInfo.email.toLowerCase().trim()
      },
      items: orderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: 'confirmed',
      paymentMethod: 'mock',
      paymentStatus: 'paid'
    });
    
    // Update product stock (optional - comment out for demo)
    // for (const item of orderItems) {
    //   await Product.findByIdAndUpdate(item.productId, {
    //     $inc: { stock: -item.quantity }
    //   });
    // }
    
    // Prepare receipt
    const receipt = {
      orderId: order.orderId,
      orderNumber: order._id,
      timestamp: order.createdAt,
      customerInfo: order.customerInfo,
      items: order.items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: parseFloat((item.price * item.quantity).toFixed(2))
      })),
      pricing: {
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total
      },
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: order.itemCount,
      message: 'Order placed successfully! Thank you for your purchase.'
    };
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: receipt
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/checkout/orders
 * @desc    Get all orders (for admin or demo purposes)
 * @access  Public
 */
router.get('/orders', async (req, res, next) => {
  try {
    const { email, status, limit = 20 } = req.query;
    
    let query = {};
    
    if (email) {
      query['customerInfo.email'] = email.toLowerCase();
    }
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/checkout/orders/:orderId
 * @desc    Get single order by order ID
 * @access  Public
 */
router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/checkout/orders/email/:email
 * @desc    Get orders by customer email
 * @access  Public
 */
router.get('/orders/email/:email', async (req, res, next) => {
  try {
    const orders = await Order.findByEmail(req.params.email.toLowerCase());
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/checkout/orders/:orderId
 * @desc    Update order status
 * @access  Public (should be protected in production)
 */
router.put('/orders/:orderId', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;