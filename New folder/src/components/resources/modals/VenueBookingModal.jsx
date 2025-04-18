// src/components/resources/modals/VenueBookingModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import TimeSlotSelector from './TimeSlotSelector';
import { toast } from 'react-hot-toast';

const VENUES = {
  D24: { name: 'D24 3D HUB', capacity: 20 },
  D18: { name: 'D18', capacity: 50 }
};

export const VenueBookingModal = ({ isOpen, onClose, onSave, selectedTimeSlot, existingBookings = [] }) => {
  const [booking, setBooking] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    timeSlots: [],
    venue: 'D24',
    attendees: 1,
    purpose: '',
  });

  useEffect(() => {
    if (selectedTimeSlot) {
      // For editing, we need to handle the time slot format correctly
      const timeSlot = selectedTimeSlot.timeSlot || selectedTimeSlot.timeSlots?.[0];
      setBooking(prev => ({
        ...prev,
        date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
        venue: selectedTimeSlot.venue,
        timeSlots: timeSlot ? [timeSlot] : [], // Convert single timeSlot to array if needed
        attendees: selectedTimeSlot.attendees || 1,
        purpose: selectedTimeSlot.purpose || '',
        action: selectedTimeSlot.action,
        id: selectedTimeSlot.id // Preserve the booking ID for editing
      }));
    }
  }, [selectedTimeSlot]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (booking.timeSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }
    
    // Create a clean booking object with only the needed fields
    const bookingToSave = {
      date: booking.date,
      venue: booking.venue,
      attendees: booking.attendees,
      purpose: booking.purpose,
      timeSlots: booking.timeSlots,
      affectedTimeSlots: booking.timeSlots,
    };
    
    // If editing, add the ID
    if (booking.action === 'edit' && booking.id) {
      bookingToSave.id = booking.id;
      bookingToSave.action = 'edit';
    }
    
    onSave(bookingToSave);
  };

  // Get booked slots for the selected date and venue
  const bookedSlots = useMemo(() => {
    return existingBookings
      .filter(b => 
        b.date === booking.date && 
        b.venue === booking.venue &&
        (!booking.action || b.id !== selectedTimeSlot?.id) // Exclude current booking when editing
      )
      .flatMap(b => b.timeSlots || b.affectedTimeSlots || []);
  }, [existingBookings, booking.date, booking.venue, booking.action, selectedTimeSlot?.id]);

  const handleTimeSlotSelect = (timeSlot) => {
    setBooking(prev => {
      const timeSlots = prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter(t => t !== timeSlot) // Remove if already selected
        : [...prev.timeSlots, timeSlot].sort(); // Add and sort by time
      return { ...prev, timeSlots };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {booking.action === 'edit' ? 'Edit' : 'Book'} {VENUES[booking.venue]?.name}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Attendees
              </label>
              <div className="relative">
                <Users className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  min="1"
                  max={VENUES[booking.venue]?.capacity}
                  value={booking.attendees}
                  onChange={(e) => setBooking({ ...booking, attendees: parseInt(e.target.value) })}
                  className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm"
                  required
                />
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Maximum capacity: {VENUES[booking.venue]?.capacity} people
              </p>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slots
              <span className="ml-1 text-xs text-gray-500">
                (Selected: {booking.timeSlots.length})
              </span>
            </label>
            <TimeSlotSelector
              selectedDate={booking.date}
              bookedSlots={bookedSlots}
              onSelectSlot={handleTimeSlotSelect}
              selectedTimeSlots={booking.timeSlots}
              isEditing={booking.action === 'edit'}
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              value={booking.purpose}
              onChange={(e) => setBooking({ ...booking, purpose: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border rounded-lg text-sm"
              required
              placeholder="Please describe the purpose of your booking..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-3 py-1.5 text-sm text-white rounded-lg transition-colors
                ${booking.timeSlots.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
              disabled={booking.timeSlots.length === 0}
            >
              {booking.action === 'edit' ? 'Update Booking' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};