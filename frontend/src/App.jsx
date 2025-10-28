import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, TrendingUp, Search } from 'lucide-react';
import ProductCard from './components/ProductCard.jsx';
import CartItem from './components/CardItem.jsx';
import Notification from './components/Notification.jsx';
import Receipt from './components/Receipt.jsx';
import { productsAPI, cartAPI, checkoutAPI } from './services/api';

function App() {
  // State management
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [view, setView] = useState('products');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load products on mount
  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      showNotification('Failed to load products', 'error');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartAPI.get();
      if (response.success) {
        setCart(response.data.items);
        setCartTotal(response.data.total);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await cartAPI.add(productId, 1);
      if (response.success) {
        setCart(response.data.items);
        setCartTotal(response.data.total);
        showNotification('Item added to cart!', 'success');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to add item', 'error');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    try {
      const response = await cartAPI.update(productId, newQuantity);
      if (response.success) {
        setCart(response.data.items);
        setCartTotal(response.data.total);
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.remove(productId);
      if (response.success) {
        setCart(response.data.items);
        setCartTotal(response.data.total);
        showNotification('Item removed from cart', 'success');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to remove item', 'error');
    }
  };

  const handleCheckout = async () => {
    // Validation
    if (!customerName.trim() || !customerEmail.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customerEmail)) {
      showNotification('Please enter a valid email', 'error');
      return;
    }
    
    if (cart.length === 0) {
      showNotification('Cart is empty', 'error');
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await checkoutAPI.process(cart, {
        name: customerName,
        email: customerEmail
      });
      
      if (response.success) {
        setReceipt(response.data);
        await loadCart();
        setCustomerName('');
        setCustomerEmail('');
        setView('products');
        showNotification('Order placed successfully!', 'success');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-3xl">🛍️</div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Vibe Commerce
                </h1>
                <p className="text-xs text-gray-500">Your Modern Shopping Experience</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setView('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'products'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package size={18} />
                <span className="hidden sm:inline">Products</span>
              </button>
              
              <button
                onClick={() => setView('cart')}
                className="relative flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'products' ? (
          <div>
            {/* Products Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-purple-600" size={28} />
                <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search */}
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={addToCart}
                    loading={false}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some awesome products to get started!</p>
                <button
                  onClick={() => setView('products')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      loading={false}
                    />
                  ))}
                </div>

                {/* Checkout Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                    
                    {/* Pricing */}
                    <div className="space-y-2 mb-4 pb-4 border-b">
                      <div className="flex justify-between text-gray-600">
                        <span>Items ({cartItemCount})</span>
                        <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600 font-semibold">
                          {cartTotal >= 100 ? 'FREE' : '$10.00'}
                        </span>
                      </div>
                      {cartTotal < 100 && (
                        <p className="text-xs text-gray-500 italic">
                          Add ${(100 - cartTotal).toFixed(2)} more for free shipping!
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
                      <span>Total</span>
                      <span className="text-purple-600">
                        ${(cartTotal + (cartTotal >= 100 ? 0 : 10)).toFixed(2)}
                      </span>
                    </div>

                    {/* Customer Form */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        'Complete Checkout'
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Mock checkout - No real payment required
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {receipt && <Receipt receipt={receipt} onClose={() => setReceipt(null)} />}

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">© 2025 Vibe Commerce. All rights reserved.</p>
          <p className="text-sm">
            Built with React, Node.js, Express & MongoDB | Screening Assignment
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;