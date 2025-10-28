import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const types = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircle size={20} />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <AlertCircle size={20} />,
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: <AlertCircle size={20} />,
    },
    info: {
      bg: 'bg-blue-500',
      icon: <Info size={20} />,
    },
  };
  
  const config = types[type] || types.success;
  
  return (
    <div 
      className={`fixed top-20 right-4 z-50 ${config.bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right max-w-md`}
      role="alert"
    >
      {config.icon}
      <span className="flex-grow font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Notification;