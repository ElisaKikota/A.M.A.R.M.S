import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Upload, X, Edit2, Trash2, Filter } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';

const HardwareModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  selectedHardware, 
  formData, 
  setFormData, 
  images, 
  setImages, 
  handleImageUpload, 
  removeImage 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            {selectedHardware ? 'Edit Hardware' : 'Add Hardware'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Available Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.status.available}
                onChange={(e) => setFormData({
                  ...formData,
                  status: { ...formData.status, available: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">In Use Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.status.inUse}
                onChange={(e) => setFormData({
                  ...formData,
                  status: { ...formData.status, inUse: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maintenance Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.status.maintenance}
                onChange={(e) => setFormData({
                  ...formData,
                  status: { ...formData.status, maintenance: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <div className="mt-2 grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Image</span>
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
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {selectedHardware ? 'Update Hardware' : 'Add Hardware'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HardwareSection = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [hardware, setHardware] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    company: '',
    description: '',
    status: {
      available: 0,
      inUse: 0,
      maintenance: 0
    },
    serialNumber: '',
    condition: 'good',
    images: []
  });

  const loadHardware = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resourceService.getResources('hardware');
      setHardware(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load hardware items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHardware();
  }, [loadHardware]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false // Mark as new image
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    if (!newImages[index].isExisting) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalQuantity = Object.values(formData.status).reduce((a, b) => a + b, 0);
      if (totalQuantity === 0) {
        toast.error('Total quantity must be greater than 0');
        return;
      }

      // Prepare the hardware data
      const hardwareData = {
        ...formData,
        imageFiles: images.map(img => img.file).filter(Boolean), // Only include new files
        imagesToDelete: [], // Add this if you need to handle image deletion
        totalQuantity,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };

      if (selectedHardware) {
        // For updates, we need to handle existing images
        hardwareData.images = selectedHardware.images || [];
        await resourceService.updateResource('hardware', selectedHardware.id, hardwareData);
        toast.success('Hardware updated successfully');
      } else {
        await resourceService.addResource('hardware', hardwareData);
        toast.success('Hardware added successfully');
      }

      setIsModalOpen(false);
      setSelectedHardware(null);
      setImages([]);
      setFormData({
        name: '',
        category: '',
        company: '',
        description: '',
        status: {
          available: 0,
          inUse: 0,
          maintenance: 0
        },
        serialNumber: '',
        condition: 'good',
        images: []
      });
      loadHardware();
    } catch (error) {
      console.error('Error saving hardware:', error);
      toast.error('Failed to save hardware');
    }
  };

  const filteredHardware = hardware.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search hardware..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="inUse">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        {hasPermission('resources.addHardware') && (
          <button
            onClick={() => {
              setSelectedHardware(null);
              setFormData({
                name: '',
                category: '',
                company: '',
                description: '',
                status: {
                  available: 0,
                  inUse: 0,
                  maintenance: 0
                },
                serialNumber: '',
                condition: 'good',
                images: []
              });
              setImages([]);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus size={20} />
            Add Hardware
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Error loading hardware items</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : filteredHardware.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-center">
            <p className="font-semibold">No hardware items found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHardware.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-3 flex">
              {item.images?.length > 0 ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {item.images.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-xs">
                      +{item.images.length - 1}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{item.category}</p>
                    <p className="text-xs text-gray-500 truncate">Made by: {item.company}</p>
                  </div>
                  {hasPermission('resources.addHardware') && (
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedHardware(item);
                          setFormData({
                            ...item,
                            status: item.status || {
                              available: 0,
                              inUse: 0,
                              maintenance: 0
                            }
                          });
                          setImages(
                            (item.images || []).map(url => ({
                              preview: url,
                              isExisting: true
                            }))
                          );
                          setIsModalOpen(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            try {
                              await resourceService.deleteResource('hardware', item.id);
                              toast.success('Hardware deleted successfully');
                              loadHardware();
                            } catch (error) {
                              console.error('Error deleting hardware:', error);
                              toast.error('Failed to delete hardware');
                            }
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1">
                  <div className="bg-green-50 px-1.5 py-1 rounded text-center">
                    <div className="text-xs text-green-600 leading-none">Available</div>
                    <div className="font-medium text-sm">{item.status.available}</div>
                  </div>
                  <div className="bg-blue-50 px-1.5 py-1 rounded text-center">
                    <div className="text-xs text-blue-600 leading-none">In Use</div>
                    <div className="font-medium text-sm">{item.status.inUse}</div>
                  </div>
                  <div className="bg-yellow-50 px-1.5 py-1 rounded text-center">
                    <div className="text-xs text-yellow-600 leading-none">Maintenance</div>
                    <div className="font-medium text-sm">{item.status.maintenance}</div>
                  </div>
                </div>

                <div className="mt-2 text-xs space-y-0.5">
                  {item.serialNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">S/N:</span>
                      <span className="font-medium">{item.serialNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{item.condition}</span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <HardwareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          selectedHardware={selectedHardware}
          formData={formData}
          setFormData={setFormData}
          images={images}
          setImages={setImages}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
        />
      )}
    </div>
  );
};

export default HardwareSection;