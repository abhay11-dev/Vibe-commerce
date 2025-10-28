import React from 'react';
import { Plus, Star } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 card-hover animate-slide-in-up">
      {/* Product Image */}
      <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-6xl relative group">
        {product.image}
        
        {/* Stock badge */}
        {product.stock < 10 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Only {product.stock} left
          </div>
        )}
        
        {/* Quick view on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
            {product.category}
          </span>
          
          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-600 font-medium">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          )}
        </div>
        
        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[56px]">
          {product.name}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>
        )}
        
        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-purple-600">
              ${product.price.toFixed(2)}
            </span>
            {product.stock > 0 && (
              <span className="text-xs text-green-600 font-medium">
                In Stock
              </span>
            )}
          </div>
          
          <button
            onClick={() => onAddToCart(product._id)}
            disabled={loading || product.stock === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 btn-ripple ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;