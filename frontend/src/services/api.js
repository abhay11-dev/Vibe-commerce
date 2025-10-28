import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add session ID to requests
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper to get/create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('vibeSessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('vibeSessionId', sessionId);
  }
  return sessionId;
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  
  getByCategory: async (category) => {
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  get: async () => {
    const sessionId = getSessionId();
    const response = await api.get('/api/cart', {
      params: { sessionId }
    });
    return response.data;
  },
  
  add: async (productId, quantity = 1) => {
    const sessionId = getSessionId();
    const response = await api.post('/api/cart', {
      productId,
      quantity,
      sessionId
    });
    return response.data;
  },
  
  update: async (productId, quantity) => {
    const sessionId = getSessionId();
    const response = await api.put(`/api/cart/${productId}`, {
      quantity,
      sessionId
    });
    return response.data;
  },
  
  remove: async (productId) => {
    const sessionId = getSessionId();
    const response = await api.delete(`/api/cart/${productId}`, {
      params: { sessionId }
    });
    return response.data;
  },
  
  clear: async () => {
    const sessionId = getSessionId();
    const response = await api.delete('/api/cart', {
      params: { sessionId }
    });
    return response.data;
  },
};

// Checkout API
export const checkoutAPI = {
  process: async (cartItems, customerInfo) => {
    const sessionId = getSessionId();
    const response = await api.post('/api/checkout', {
      cartItems,
      customerInfo,
      sessionId
    });
    return response.data;
  },
  
  getOrders: async (params = {}) => {
    const response = await api.get('/api/checkout/orders', { params });
    return response.data;
  },
  
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/checkout/orders/${orderId}`);
    return response.data;
  },
  
  getOrdersByEmail: async (email) => {
    const response = await api.get(`/api/checkout/orders/email/${email}`);
    return response.data;
  },
};

export default api;