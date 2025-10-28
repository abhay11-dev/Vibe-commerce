import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, X } from 'lucide-react';

// Mock Backend API (In real app, this would be separate Express server)
const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, image: '🎧', category: 'Electronics' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: '⌚', category: 'Electronics' },
  { id: 3, name: 'Laptop Stand', price: 49.99, image: '💻', category: 'Accessories' },
  { id: 4, name: 'Mechanical Keyboard', price: 129.99, image: '⌨️', category: 'Electronics' },
  { id: 5, name: 'USB-C Hub', price: 39.99, image: '🔌', category: 'Accessories' },
  { id: 6, name: 'Desk Lamp', price: 34.99, image: '💡', category: 'Home' },
  { id: 7, name: 'Phone Case', price: 19.99, image: '📱', category: 'Accessories' },
  { id: 8, name: 'Bluetooth Speaker', price: 89.99, image: '🔊', category: 'Electronics' },
];

// Mock API functions (simulating backend)
const api = {
  getProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRODUCTS;
  },
  
  getCart: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const savedCart = JSON.parse(localStorage.getItem('vibeCart') || '[]');
    const total = savedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { items: savedCart, total };
  },
  
  addToCart: async (productId, quantity = 1) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    
    const savedCart = JSON.parse(localStorage.getItem('vibeCart') || '[]');
    const existingItem = savedCart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      savedCart.push({ ...product, quantity });
    }
    
    localStorage.setItem('vibeCart', JSON.stringify(savedCart));
    return { success: true, cart: savedCart };
  },
  
  removeFromCart: async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    let savedCart = JSON.parse(localStorage.getItem('vibeCart') || '[]');
    savedCart = savedCart.filter(item => item.id !== productId);
    localStorage.setItem('vibeCart', JSON.stringify(savedCart));
    return { success: true, cart: savedCart };
  },
  
  updateQuantity: async (productId, quantity) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const savedCart = JSON.parse(localStorage.getItem('vibeCart') || '[]');
    const item = savedCart.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('vibeCart', JSON.stringify(savedCart));
    }
    return { success: true, cart: savedCart };
  },
  
  checkout: async (cartItems, customerInfo) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const receipt = {
      orderId: `ORD-${Date.now()}`,
      items: cartItems,
      total,
      customerInfo,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };
    localStorage.setItem('vibeCart', '[]');
    return receipt;
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [view, setView] = useState('products');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [receipt, setReceipt] = useState(null);
  
  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const { items, total } = await api.getCart();
      setCart(items);
      setCartTotal(total);
    } catch (error) {
      showNotification('Failed to load cart', 'error');
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.addToCart(productId);
      await loadCart();
      showNotification('Item added to cart!', 'success');
    } catch (error) {
      showNotification('Failed to add item', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.removeFromCart(productId);
      await loadCart();
      showNotification('Item removed from cart', 'success');
    } catch (error) {
      showNotification('Failed to remove item', 'error');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    try {
      await api.updateQuantity(productId, newQuantity);
      await loadCart();
    } catch (error) {
      showNotification('Failed to update quantity', 'error');
    }
  };

  const handleCheckout = async () => {
    if (!customerName || !customerEmail) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      showNotification('Please enter a valid email', 'error');
      return;
    }
    
    if (cart.length === 0) {
      showNotification('Cart is empty', 'error');
      return;
    }

    try {
      setLoading(true);
      const receiptData = await api.checkout(cart, { name: customerName, email: customerEmail });
      setReceipt(receiptData);
      await loadCart();
      setCustomerName('');
      setCustomerEmail('');
      setView('products');
    } catch (error) {
      showNotification('Checkout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🛍️</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Vibe Commerce
            </h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setView('products')}
              className={`font-medium transition-colors ${
                view === 'products' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setView('cart')}
              className="relative flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'products' ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Products</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-6xl">
                      {product.image}
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-purple-600 font-semibold mb-1">{product.category}</div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
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
                <p className="text-gray-600 mb-6">Add some items to get started!</p>
                <button
                  onClick={() => setView('products')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                        {item.image}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-purple-600 font-semibold">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right min-w-20">
                        <div className="font-bold text-lg text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Checkout Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                    
                    <div className="space-y-2 mb-4 pb-4 border-b">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
                      <span>Total</span>
                      <span className="text-purple-600">${cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Complete Checkout'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
            <button
              onClick={() => setReceipt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-semibold">{receipt.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(receipt.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span>{receipt.customerInfo.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span>{receipt.customerInfo.email}</span>
              </div>
            </div>

            <div className="border-t border-b py-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Order Items:</h3>
              <div className="space-y-2">
                {receipt.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-bold mb-6">
              <span>Total Paid:</span>
              <span className="text-purple-600">${receipt.total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;