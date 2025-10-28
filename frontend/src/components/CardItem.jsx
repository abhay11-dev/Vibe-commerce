import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove, loading }) => {
  const subtotal = (item.price * item.quantity).toFixed(2);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 animate-slide-in-up">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
        {item.image}
      </div>
      
      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-lg text-gray-800 truncate">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">{item.category}</span>
          <span className="text-purple-600 font-semibold">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        
        <span className="w-12 text-center font-bold text-gray-800">
          {item.quantity}
        </span>
        
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {/* Subtotal */}
      <div className="text-right min-w-20 flex-shrink-0">
        <div className="font-bold text-lg text-gray-800">
          ${subtotal}
        </div>
        <div className="text-xs text-gray-500">
          ${item.price.toFixed(2)} each
        </div>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={loading}
        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        aria-label="Remove item"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default CartItem;