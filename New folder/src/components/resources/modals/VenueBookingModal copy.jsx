import React, { useState, useEffect } from 'react';  // Add useEffect import
import { Calendar as CalendarIcon, Clock, Users, X } from 'lucide-react';
import { format, parse, startOfWeek, endOfWeek, eachDayOfInterval, addMinutes } from 'date-fns';
import { parseISO } from 'date-fns';

const VENUES = {
  D24: {
    name: 'D24 3D HUB',
    capacity: 20,
    equipment: ['3D Printer', 'Computer Workstation', 'Design Software']
  },
  D18: {
    name: 'D18',
    capacity: 50,
    equipment: ['Projector', 'Whiteboard', 'Conference System']
  }
};


export const VenueBookingModal = ({ isOpen, onClose, onSave, selectedTimeSlot }) => {
  const [booking, setBooking] = useState({
    date: selectedTimeSlot?.date || format(new Date(), 'yyyy-MM-dd'),
    timeSlot: selectedTimeSlot?.timeSlot || '07:00-08:00',
    venue: selectedTimeSlot?.venue || 'D24',
    duration: 60,
    attendees: 1,
    purpose: '',
    equipment: []
  });

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return format(endDate, 'HH:mm');
  };

  // Get start time from time slot
  const getStartTime = (timeSlot) => {
    return timeSlot.split('-')[0];
  };

  const startTime = getStartTime(booking.timeSlot);
  const endTime = calculateEndTime(startTime, booking.duration);

  const timeSlots = [];
  let currentTime = parse('07:00', 'HH:mm', new Date());
  // const endTime = parse('20:00', 'HH:mm', new Date());

  while (currentTime <= endTime) {
    timeSlots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, 30);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(booking);
    onClose();
  };

  const selectedVenueName = VENUES[booking.venue]?.name || '';
  const selectedVenueCapacity = VENUES[booking.venue]?.capacity || 0;

  useEffect(() => {
    if (selectedTimeSlot) {
      setBooking(prev => ({
        ...prev,
        date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot.timeSlot,
        venue: selectedTimeSlot.venue
      }));
    }
  }, [selectedTimeSlot]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Book {selectedVenueName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={booking.startTime}
                  onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={booking.duration}
                  onChange={(e) => setBooking({ ...booking, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Start</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      {startTime}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">End</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      {endTime}
                    </div>
                  </div>
                </div>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Attendees
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    min="1"
                    max={selectedVenueCapacity}
                    value={booking.attendees}
                    onChange={(e) => setBooking({ ...booking, attendees: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <textarea
                value={booking.purpose}
                onChange={(e) => setBooking({ ...booking, purpose: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            {VENUES[booking.venue]?.equipment?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Equipment
                </label>
                <div className="space-y-2">
                  {VENUES[booking.venue].equipment.map((item, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={booking.equipment.includes(item)}
                        onChange={(e) => {
                          const newEquipment = e.target.checked
                            ? [...booking.equipment, item]
                            : booking.equipment.filter(eq => eq !== item);
                          setBooking({ ...booking, equipment: newEquipment });
                        }}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            )}

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
                Book Venue
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};