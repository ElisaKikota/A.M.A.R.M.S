import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Upload} from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';


const SoftwareSection = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [softwareToDelete, setSoftwareToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    licenseType: '',
    status: 'available',
    expiryDate: '',
    description: '',
    images: []
  });

  useEffect(() => {
    loadSoftware();
  }, []);

  const loadSoftware = async () => {
    try {
      setLoading(true);
      const items = await resourceService.getResources('software');
      setSoftware(items);
    } catch (error) {
      console.error('Error loading software:', error);
      toast.error('Failed to load software items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare image data
      const imageFiles = images
        .filter(img => !img.isExisting) // Only include new images
        .map(img => img.file);

      // Create resource data
      const resourceData = {
        ...formData,
        imageFiles,
        imagesToDelete: [], // Add this if you need to handle image deletions
        userId: user.uid
      };

      // If editing, include existing images that weren't removed
      if (isEditing && selectedSoftware) {
        resourceData.images = images
          .filter(img => img.isExisting)
          .map(img => img.url);
      }

      if (isEditing && selectedSoftware) {
        // Update existing software
        await resourceService.updateResource('software', selectedSoftware.id, resourceData);
        toast.success('Software updated successfully');
      } else {
        // Create new software
        await resourceService.addResource('software', resourceData);
        toast.success('Software added successfully');
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setSelectedSoftware(null);
      setFormData({
        name: '',
        category: '',
        quantity: 1,
        licenseType: '',
        status: 'available',
        expiryDate: '',
        description: '',
        images: []
      });
      setImages([]);
      loadSoftware();
    } catch (error) {
      console.error('Error saving software:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} software`);
    }
  };

  const handleDeleteSoftware = async (softwareId) => {
    try {
      await resourceService.deleteResource('software', softwareId);
      setSoftware(prev => prev.filter(item => item.id !== softwareId));
    } catch (error) {
      console.error('Error deleting software:', error);
      throw error;
    }
  };

  const handleUpdateSoftware = (software) => {
    setIsEditing(true);
    setSelectedSoftware(software);
    // Populate form data with all existing software fields
    setFormData({
      name: software.name || '',
      category: software.category || '',
      quantity: software.quantity || 1,
      licenseType: software.licenseType || '',
      status: typeof software.status === 'object' ? 'available' : software.status || 'available',
      expiryDate: software.expiryDate || '',
      description: software.description || '',
      images: software.images || []
    });
    
    // Set existing images if any
    if (software.images && software.images.length > 0) {
      setImages(software.images.map(url => ({
        preview: url,
        isExisting: true,
        url // Keep the original URL for existing images
      })));
    } else {
      setImages([]);
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteClick = (software) => {
    setSoftwareToDelete(software);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await handleDeleteSoftware(softwareToDelete.id);
      toast.success('Software deleted successfully');
      setShowDeleteConfirm(false);
      setSoftwareToDelete(null);
    } catch (error) {
      toast.error('Failed to delete software');
    }
  };

  const filteredSoftware = software.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="expired">Expired</option>
        </select>
        {hasPermission('resources.addSoftware') && (
          <button
            onClick={() => {
              setSelectedSoftware(null);
              setFormData({
                name: '',
                category: '',
                company: '',
                description: '',
                licenseType: '',
                licenseCount: 0,
                expiryDate: '',
                images: []
              });
              setImages([]);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus size={20} />
            Add Software
          </button>
        )}
      </div>

      {/* Software Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSoftware.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-3">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
              
              {item.description && (
                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
              )}

              {item.expiryDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {hasPermission('resources.addSoftware') && (
                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    onClick={() => handleUpdateSoftware(item)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Software Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">{isEditing ? 'Edit Software' : 'Add New Software'}</h2>
              <button onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setSelectedSoftware(null);
                setFormData({
                  name: '',
                  category: '',
                  quantity: 1,
                  licenseType: '',
                  status: 'available',
                  expiryDate: '',
                  description: '',
                  images: []
                });
                setImages([]);
              }} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Category row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* License Type and Quantity row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">License Type</label>
                  <input
                    type="text"
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
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
                    required
                  />
                </div>
              </div>

              {/* Expiry Date and Description row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={1}
                  />
                </div>
              </div>

              {/* Images section */}
              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <div className="mt-2 grid grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="mt-1 text-xs text-gray-500">Add Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setSelectedSoftware(null);
                    setFormData({
                      name: '',
                      category: '',
                      quantity: 1,
                      licenseType: '',
                      status: 'available',
                      expiryDate: '',
                      description: '',
                      images: []
                    });
                    setImages([]);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'Update Software' : 'Add Software'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Delete Software</h2>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete "{softwareToDelete?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSoftwareToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoftwareSection;