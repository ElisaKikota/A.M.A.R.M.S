import React from 'react';

/**
 * LoadingOverlay - A consistent full-screen overlay for loading states
 * 
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether the loading overlay is visible
 * @param {string} props.message - The loading message to display (default: "Loading...")
 * @param {string} props.zIndex - The z-index of the overlay (default: 50)
 */
const LoadingOverlay = ({ 
  isLoading, 
  message = "Loading...",
  zIndex = 50
}) => {
  if (!isLoading) return null;

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
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl border border-gray-200 m-0">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 