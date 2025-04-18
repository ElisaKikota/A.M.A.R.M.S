// src/pages/Resources.jsx
import { startOfMonth, endOfMonth } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';
import { Package, Monitor, Home, History, PlusCircle } from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { AddResourceModal, VenueBookingModal } from '../components/resources/modals';
import ResourceCalendar from '../components/resources/ResourceCalendar';
import ResourceHistory from '../components/resources/ResourceHistory';
import { DeleteBookingModal } from '../components/resources/modals/DeleteBookingModal';

const Resources = () => {
    const { user } = useFirebase();
    const [activeTab, setActiveTab] = useState('venues');
    const [resources, setResources] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedResource] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [bookingToDelete, setBookingToDelete] = useState(null);

    useEffect(() => {
        loadData();
    }, [user]);

    // When loading bookings
const loadData = async () => {
    try {
      setLoading(true);
      const bookingsData = await resourceService.getBookings(
        startOfMonth(new Date()),
        endOfMonth(new Date())
      );
      console.log('Loaded bookings:', bookingsData); // Debug log
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

      const handleDeleteBooking = async () => {
        try {
          await resourceService.removeBooking(bookingToDelete.id);
          await loadData(); // Reload bookings
          toast.success('Booking cancelled successfully');
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        } catch (error) {
          console.error('Error cancelling booking:', error);
          toast.error('Failed to cancel booking');
        }
      };

      

    const handleAddResource = async (resourceData) => {
        try {
            const newResource = await resourceService.addResource(resourceData);
            setResources(prev => [...prev, newResource]);
            toast.success('Resource added successfully');
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding resource:', error);
            toast.error('Failed to add resource');
        }
    };

    const handleBookVenue = async (bookingData) => {
        try {
          setLoading(true);
          console.log('Booking data:', bookingData); // Debug log
      
          // If it's a delete action
          if (bookingData.action === 'delete') {
            await resourceService.removeBooking(bookingData.id);
            toast.success('Booking cancelled successfully');
            await loadData(); // Reload the bookings
            return;
          }
      
          // If it's a new booking
          await resourceService.addBooking({
            ...bookingData,
            duration: 60, // Default duration
            userId: user.uid
          });
      
          toast.success('Venue booked successfully');
          await loadData(); // Reload the bookings
          setIsBookingModalOpen(false);
        } catch (error) {
          console.error('Error handling booking:', error);
          toast.error(error.message || 'Failed to process booking');
        } finally {
          setLoading(false);
        }
      };
      
      const handleTimeSlotSelect = (slotData) => {
        if (slotData.action === 'delete') {
          setBookingToDelete(slotData);
          setIsDeleteModalOpen(true);
          return;
        }
      
        setSelectedTimeSlot(slotData);
        setIsBookingModalOpen(true);
      };

    const HardwareSection = ({ resources }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
                .filter(resource => resource.type === 'hardware')
                .map(resource => (
                    <div key={resource.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-sm text-gray-500">{resource.category}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm ${resource.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {resource.status}
                            </span>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{resource.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Condition:</span>
                                <span className="font-medium">{resource.condition}</span>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );

    const SoftwareSection = ({ resources }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
                .filter(resource => resource.type === 'software')
                .map(resource => (
                    <div key={resource.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-sm text-gray-500">{resource.category}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Licenses:</span>
                                <span className="font-medium">{resource.licenses}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium">{resource.used || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 rounded-full h-2"
                                    style={{ width: `${((resource.used || 0) / resource.licenses) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Resource Management</h1>
                    <p className="text-gray-500 mt-1">Manage equipment, software, and venue bookings</p>
                </div>
                {activeTab !== 'venues' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <PlusCircle size={20} />
                        Add Resource
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('venues')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'venues'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <Home size={20} />
                    Venue Booking
                </button>
                <button
                    onClick={() => setActiveTab('hardware')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'hardware'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <Package size={20} />
                    Hardware
                </button>
                <button
                    onClick={() => setActiveTab('software')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'software'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <Monitor size={20} />
                    Software
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'history'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <History size={20} />
                    History
                </button>
            </div>

            {/* Tab Content */}
            {!loading && (
                <div>
                    {activeTab === 'venues' && (
  <ResourceCalendar 
  bookings={bookings}
  onSelectTimeSlot={handleTimeSlotSelect}
/>
)}
                    {activeTab === 'hardware' && (
  <HardwareSection resources={resources.filter(r => r.type === 'hardware')} />
)}
                    {activeTab === 'software' && (
                        <SoftwareSection resources={resources} />
                    )}
                    {activeTab === 'history' && (
                        <ResourceHistory
                            resourceId={selectedResource?.id}
                        />
                    )}
                </div>
            )}

            {/* Modals */}
            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddResource}
                type={activeTab}
            />

            <VenueBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={handleBookVenue}
                selectedTimeSlot={selectedTimeSlot}
            />

            {/* DeleteBookingModal */}
        <DeleteBookingModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
                setIsDeleteModalOpen(false);
                setBookingToDelete(null);
            }}
            onConfirm={handleDeleteBooking}
        />
        </div>
    );
};

export default Resources;