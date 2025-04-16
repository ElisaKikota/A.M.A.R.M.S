import React from 'react';

/**
 * ModalOverlay - A consistent full-screen overlay for modals
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the overlay is clicked (optional)
 * @param {React.ReactNode} props.children - The modal content
 * @param {boolean} props.closeOnOverlayClick - Whether to close the modal when the overlay is clicked (default: false)
 * @param {string} props.zIndex - The z-index of the overlay (default: 50)
 */
const ModalOverlay = ({ 
  isOpen, 
  onClose, 
  children, 
  closeOnOverlayClick = false,
  zIndex = 50
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`}
      style={{ 
        zIndex: zIndex,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
      onClick={handleOverlayClick}
    >
      <div className="flex items-center justify-center w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay; 