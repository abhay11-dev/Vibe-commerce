import React from 'react';
import { X, CheckCircle, Download, Mail } from 'lucide-react';

const Receipt = ({ receipt, onClose }) => {
  if (!receipt) return null;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Confirmed!</h2>
              <p className="text-sm text-gray-600">Thank you for your purchase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="bg-purple-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono font-bold text-purple-600">{receipt.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-semibold text-gray-800">{formatDate(receipt.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer</p>
                <p className="font-semibold text-gray-800">{receipt.customerInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-800 truncate">{receipt.customerInfo.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                receipt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                receipt.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {receipt.status.toUpperCase()}
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                {receipt.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-3">
              {receipt.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-bold text-gray-800 flex-shrink-0">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pricing Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">${receipt.pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span className="font-semibold">${receipt.pricing.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">
                {receipt.pricing.shipping === 0 ? 'FREE' : `$${receipt.pricing.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total</span>
              <span className="text-purple-600">${receipt.pricing.total.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-medium">{receipt.message}</p>
            <p className="text-sm text-green-600 mt-1">
              A confirmation email has been sent to {receipt.customerInfo.email}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
            >
              <Download size={18} />
              Print Receipt
            </button>
            <button
              onClick={() => window.location.href = `mailto:${receipt.customerInfo.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
            >
              <Mail size={18} />
              Email Receipt
            </button>
          </div>
          
          {/* Continue Shopping */}
          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;