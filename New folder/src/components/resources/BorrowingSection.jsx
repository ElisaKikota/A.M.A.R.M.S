import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Clock, X, UserCircle } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';

const BorrowingModal = ({ isOpen, onClose, hardware, onSubmit }) => {
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    quantity: 1,
    purpose: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.endDate) {
      toast.error('Please select a return date');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Borrow {hardware.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Borrow Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Return Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              min={formData.startDate}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border rounded-lg"
              min={1}
              max={hardware.status.available}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Available: {hardware.status.available}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
              placeholder="Please describe why you need to borrow this item..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResourceFlowSection = ({ hardware }) => {
  const [allBorrowings, setAllBorrowings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAllBorrowings = useCallback(async () => {
    try {
      const borrowings = await resourceService.getAllBorrowings();
      setAllBorrowings(borrowings);
    } catch (error) {
      console.error('Error loading all borrowings:', error);
      toast.error('Failed to load resource flow data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllBorrowings();
  }, [loadAllBorrowings]);

  const handleStatusChange = async (borrowingId, newStatus) => {
    try {
      await resourceService.updateBorrowing(borrowingId, { status: newStatus });
      toast.success('Status updated successfully');
      loadAllBorrowings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredBorrowings = allBorrowings.filter(borrowing => {
    const hardwareItem = hardware.find(h => h.id === borrowing.hardwareId);
    if (!hardwareItem) return false;

    const matchesSearch = 
      hardwareItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hardwareItem.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || borrowing.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Resource Flow Management</h3>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by hardware name, category, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'active', 'returned'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredBorrowings.map(borrowing => {
          const hardwareItem = hardware.find(h => h.id === borrowing.hardwareId);
          if (!hardwareItem) return null;

          return (
            <div key={borrowing.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-4">
                {hardwareItem.images?.length > 0 ? (
                  <img
                    src={hardwareItem.images[0]}
                    alt={hardwareItem.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{hardwareItem.name}</h4>
                      <p className="text-sm text-gray-500">{hardwareItem.category}</p>
                    </div>
                    <div className="flex gap-2">
                      {borrowing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(borrowing.id, 'active')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(borrowing.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        borrowing.status === 'active' ? 'bg-green-100 text-green-600' :
                        borrowing.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        borrowing.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserCircle size={14} />
                        <span>User ID: {borrowing.userId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{new Date(borrowing.startDate).toLocaleDateString()} - {new Date(borrowing.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>Quantity: {borrowing.quantity}</span>
                      </div>
                    </div>

                    {borrowing.purpose && (
                      <div className="text-sm text-gray-600">
                        <strong>Purpose:</strong>
                        <p>{borrowing.purpose}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BorrowingSection = ({ currentUser }) => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [hardware, setHardware] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('borrowing');
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [hardwareItems, borrowingItems] = await Promise.all([
        resourceService.getResources('hardware'),
        resourceService.getBorrowings(user.uid)
      ]);
      setHardware(hardwareItems);
      setBorrowings(borrowingItems);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load borrowing data');
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBorrow = async (formData) => {
    try {
      await resourceService.createBorrowing({
        ...formData,
        hardwareId: selectedHardware.id,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Borrowing request submitted successfully');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error submitting borrowing request:', error);
      toast.error('Failed to submit borrowing request');
    }
  };

  const handleReturn = async (borrowingId) => {
    try {
      await resourceService.updateBorrowing(borrowingId, { status: 'returned' });
      toast.success('Item marked as returned');
      loadData();
    } catch (error) {
      console.error('Error returning item:', error);
      toast.error('Failed to return item');
    }
  };

  const filteredHardware = hardware.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const hasAvailable = item.status.available > 0;
    return matchesSearch && hasAvailable;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hasPermission(['admin', 'supervisor', 'resourceManager']) && (
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveView('borrowing')}
            className={`px-4 py-1 border-b-2 transition-colors ${
              activeView === 'borrowing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            Borrowing
          </button>
          <button
            onClick={() => setActiveView('flow')}
            className={`px-4 py-1 border-b-2 transition-colors ${
              activeView === 'flow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            Resource Flow
          </button>
        </div>
      )}

      {activeView === 'borrowing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Hardware Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Available Hardware</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search available hardware..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <div className="space-y-2">
              {filteredHardware.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow p-3 flex items-center">
                  {item.images?.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-sm text-green-600">{item.status.available} available</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedHardware(item);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Borrow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Borrowings Section */}
          <div className="space-y-4">
            <h3 className="font-medium">My Borrowings</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filterStatus === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filterStatus === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('returned')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filterStatus === 'returned'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Returned
              </button>
            </div>

            <div className="space-y-2">
              {borrowings
                .filter(item => filterStatus === 'all' || item.status === filterStatus)
                .map(borrowing => {
                  const hardwareItem = hardware.find(h => h.id === borrowing.hardwareId);
                  if (!hardwareItem) return null;

                  return (
                    <div key={borrowing.id} className="bg-white rounded-lg shadow p-3">
                      <div className="flex items-center">
                        {hardwareItem.images?.length > 0 ? (
                          <img
                            src={hardwareItem.images[0]}
                            alt={hardwareItem.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium">{hardwareItem.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>{new Date(borrowing.startDate).toLocaleDateString()} - {new Date(borrowing.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>Quantity: {borrowing.quantity}</span>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col items-end">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            borrowing.status === 'active' ? 'bg-green-100 text-green-600' :
                            borrowing.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                          </span>
                          
                          {borrowing.status === 'active' && (
                            <button
                              onClick={() => handleReturn(borrowing.id)}
                              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Return
                            </button>
                          )}
                        </div>
                      </div>

                      {borrowing.purpose && (
                        <p className="mt-2 text-sm text-gray-600 border-t pt-2">
                          {borrowing.purpose}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <ResourceFlowSection hardware={hardware} />
      )}

      {isModalOpen && (
        <BorrowingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          hardware={selectedHardware}
          onSubmit={handleBorrow}
        />
      )}
    </div>
  );
};

export default BorrowingSection; 