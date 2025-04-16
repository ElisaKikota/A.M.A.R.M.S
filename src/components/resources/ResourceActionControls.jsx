import React, { useState } from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';

const ResourceActionControls = ({ 
  resource, 
  type, 
  onDelete, 
  onUpdate,
  userRole 
}) => {
  const [showEditQuantity, setShowEditQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState(resource.quantity);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowQuantity, setBorrowQuantity] = useState(1);
  const [returnDate, setReturnDate] = useState('');
  const { user } = useAuth();

  // Role-based permissions
  const canBorrow = ['admin', 'supervisor', 'community_member', 'project_member', 'instructor', 'resource_manager'].includes(userRole);
  const canEdit = ['admin', 'resource_manager'].includes(userRole);
  const canDelete = ['admin', 'resource_manager'].includes(userRole);

  const handleQuantityUpdate = async () => {
    try {
      if (!canEdit) {
        toast.error('You do not have permission to edit quantities');
        return;
      }

      if (newQuantity < 0) {
        toast.error('Quantity cannot be negative');
        return;
      }

      await resourceService.updateQuantity(type, resource.id, newQuantity, user.uid);
      onUpdate({ ...resource, quantity: newQuantity });
      setShowEditQuantity(false);
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleBorrow = async () => {
    try {
      if (!canBorrow) {
        toast.error('You do not have permission to borrow resources');
        return;
      }

      if (borrowQuantity > resource.quantity) {
        toast.error('Cannot borrow more than available quantity');
        return;
      }

      if (!returnDate) {
        toast.error('Please select a return date');
        return;
      }

      await resourceService.borrowResource(type, resource.id, user.uid, {
        quantity: borrowQuantity,
        returnDate: returnDate
      });

      onUpdate({ 
        ...resource, 
        quantity: resource.quantity - borrowQuantity 
      });
      
      setShowBorrowForm(false);
      toast.success('Resource borrowed successfully');
    } catch (error) {
      console.error('Error borrowing resource:', error);
      toast.error('Failed to borrow resource');
    }
  };

  const handleDelete = async () => {
    try {
      if (!canDelete) {
        toast.error('You do not have permission to delete resources');
        return;
      }

      if (window.confirm('Are you sure you want to delete this resource?')) {
        await onDelete(resource.id);
        toast.success('Resource deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Action Buttons */}
      <div className="flex gap-2">
        {canBorrow && (
          <button
            onClick={() => setShowBorrowForm(true)}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
          >
            <Package size={16} />
            Borrow
          </button>
        )}
        
        {canEdit && (
          <button
            onClick={() => setShowEditQuantity(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Edit2 size={16} />
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Edit Quantity Form */}
      {showEditQuantity && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium mb-1">New Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value))}
              className="flex-1 px-3 py-1.5 border rounded-lg"
            />
            <button
              onClick={handleQuantityUpdate}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
            <button
              onClick={() => setShowEditQuantity(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Borrow Form */}
      {showBorrowForm && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity to Borrow</label>
              <input
                type="number"
                min="1"
                max={resource.quantity}
                value={borrowQuantity}
                onChange={(e) => setBorrowQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBorrow}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBorrowForm(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceActionControls;