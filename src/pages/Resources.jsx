import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import HardwareSection from '../components/resources/HardwareSection';
import SoftwareSection from '../components/resources/SoftwareSection';
import ResourceCalendar from '../components/resources/ResourceCalendar';
import BorrowingSection from '../components/resources/BorrowingSection';
import { DeleteBookingModal } from '../components/resources/modals/DeleteBookingModal';
import { VenueBookingModal } from '../components/resources/modals/VenueBookingModal';
import { toast } from 'react-hot-toast';
import { resourceService } from '../services/resourceService';

const Resources = () => {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState('venues');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [selectedVenue] = useState('D24');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(1); // Start of current month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0); // End of current month
      
      const bookingsData = await resourceService.getBookings(startDate, endDate);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookVenue = async (bookingData) => {
    try {
      setLoading(true);
      if (bookingData.action === 'delete') {
        await resourceService.removeBooking(bookingData.id);
        toast.success('Booking cancelled successfully');
      } else {
        await resourceService.addBooking({
          ...bookingData,
          userId: user.uid
        });
        toast.success('Venue booked successfully');
      }
      await loadData();
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

  const handleDeleteBooking = async () => {
    try {
      await resourceService.removeBooking(bookingToDelete.id);
      await loadData();
      toast.success('Booking cancelled successfully');
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Resource Management</h1>
      </div>

      <div className="flex flex-col gap-2">
        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('hardware')}
              className={`px-4 py-1 border-b-2 transition-colors ${
                activeTab === 'hardware'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Hardware
            </button>
            <button
              onClick={() => setActiveTab('software')}
              className={`px-4 py-1 border-b-2 transition-colors ${
                activeTab === 'software'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Software
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`px-4 py-1 border-b-2 transition-colors ${
                activeTab === 'venues'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Venue Booking
            </button>
            <button
              onClick={() => setActiveTab('borrowing')}
              className={`px-4 py-1 border-b-2 transition-colors ${
                activeTab === 'borrowing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Borrowing
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {!loading && (
          <div>
            {activeTab === 'venues' && (
              <ResourceCalendar
                bookings={bookings.filter(b => b.venue === selectedVenue)}
                onSelectTimeSlot={handleTimeSlotSelect}
                selectedVenue={selectedVenue}
              />
            )}
            {activeTab === 'hardware' && <HardwareSection />}
            {activeTab === 'software' && <SoftwareSection />}
            {activeTab === 'borrowing' && <BorrowingSection />}
          </div>
        )}
      </div>

      <VenueBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedTimeSlot(null);
        }}
        onSave={handleBookVenue}
        selectedTimeSlot={selectedTimeSlot}
        existingBookings={bookings}
      />

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