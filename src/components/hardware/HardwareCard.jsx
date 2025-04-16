// src/components/hardware/HardwareCard.jsx
import React from 'react';
import { Edit, Trash2, Clock, Tool, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const HardwareCard = ({ item, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-use':
        return <Clock className="w-4 h-4" />;
      case 'maintenance':
        return <Tool className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {item.status}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Serial Number:</span>
          <span className="font-medium">{item.serialNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{item.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Condition:</span>
          <span className="font-medium">{item.condition}</span>
        </div>
        {item.currentCheckout && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Checked out by: {item.currentCheckout.userId}</p>
            <p className="text-sm text-gray-600">
              Return by: {format(new Date(item.currentCheckout.expectedReturnDate), 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onEdit(item)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          title="Edit"
        >
          <Edit size={16} />
        </button>
        {!item.currentCheckout && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 hover:bg-red-100 rounded-full text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default HardwareCard;