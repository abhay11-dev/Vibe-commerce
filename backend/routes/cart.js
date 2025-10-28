const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// In-memory cart storage (simulating session/user cart)
// In production, use Redis, MongoDB sessions, or user-specific collections
const cartStore = new Map();

/**
 * @route   GET /api/cart
 * @desc    Get cart items and total
 * @access  Public
 * @query   sessionId - Session identifier for cart
 */
router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId || 'default';
    const cart = cartStore.get(sessionId) || [];
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      data: {
        items: cart,
        total: parseFloat(total.toFixed(2)),
        itemCount,
        sessionId
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Public
 * @body    { productId, quantity, sessionId }
 */
router.post('/', async (req, res, next) => {
  try {
    const { productId, quantity = 1, sessionId = 'default' } = req.body;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Find product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    // Check stock
    if (!product.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }
    
    // Get or create cart
    let cart = cartStore.get(sessionId) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity;
      
      // Check stock again
      if (!product.isInStock(cart[existingItemIndex].quantity)) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }
    } else {
      // Add new item
      cart.push({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity
      });
    }
    
    // Save cart
    cartStore.set(sessionId, cart);
    
    // Calculate new total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: cart,
        total: parseFloat(total.toFixed(2)),
        itemCount,
        sessionId
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/cart/:productId
 * @desc    Update cart item quantity
 * @access  Public
 * @body    { quantity, sessionId }
 */
router.put('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, sessionId = 'default' } = req.body;
    
    // Validate quantity
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }
    
    // Get cart
    let cart = cartStore.get(sessionId) || [];
    
    // Find item
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // If quantity is 0, remove item
    if (quantity === 0) {
      cart.splice(itemIndex, 1);
    } else {
      // Check stock
      const product = await Product.findById(productId);
      
      if (!product || !product.isInStock(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
      
      // Update quantity
      cart[itemIndex].quantity = quantity;
    }
    
    // Save cart
    cartStore.set(sessionId, cart);
    
    // Calculate new total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        items: cart,
        total: parseFloat(total.toFixed(2)),
        itemCount,
        sessionId
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/cart/:productId
 * @desc    Remove item from cart
 * @access  Public
 * @query   sessionId - Session identifier
 */
router.delete('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const sessionId = req.query.sessionId || 'default';
    
    // Get cart
    let cart = cartStore.get(sessionId) || [];
    
    // Find and remove item
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    const removedItem = cart.splice(itemIndex, 1)[0];
    
    // Save cart
    cartStore.set(sessionId, cart);
    
    // Calculate new total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      removedItem,
      data: {
        items: cart,
        total: parseFloat(total.toFixed(2)),
        itemCount,
        sessionId
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Public
 * @query   sessionId - Session identifier
 */
router.delete('/', async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId || 'default';
    
    // Clear cart
    cartStore.set(sessionId, []);
    
    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        total: 0,
        itemCount: 0,
        sessionId
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;