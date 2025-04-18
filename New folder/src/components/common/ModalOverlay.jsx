import React from 'react';
import { X } from 'lucide-react';

const ModalOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
        >
          <X size={20} className="text-gray-500" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay; 