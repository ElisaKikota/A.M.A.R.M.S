import React, { useState, useMemo } from 'react';
import { format, parse, addMinutes } from 'date-fns';

export const TimeSlotSelector = ({ selectedDate, bookedSlots = [], onSelectSlot, selectedTimeSlots = [], isEditing = false }) => {
  const [interval, setInterval] = useState(60); // Default 1 hour

  const timeSlots = useMemo(() => {
    const slots = [];
    const startTime = parse('06:00', 'HH:mm', new Date());
    const endTime = parse('20:00', 'HH:mm', new Date());
    let currentTime = startTime;

    while (currentTime < endTime) {
      const timeSlot = `${format(currentTime, 'HH:mm')}-${format(addMinutes(currentTime, interval), 'HH:mm')}`;
      slots.push(timeSlot);
      currentTime = addMinutes(currentTime, interval);
    }
    return slots;
  }, [interval]);

  // Helper function to check if a time slot is selected
  const isTimeSlotSelected = (timeSlot) => {
    return selectedTimeSlots.some(selected => selected === timeSlot);
  };

  // Helper function to check if a time slot is booked
  const isTimeSlotBooked = (timeSlot) => {
    return bookedSlots.some(booked => booked === timeSlot);
  };

  return (
    <div className="space-y-3">
      {/* Interval Selector */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Time Slot Interval:</span>
        <div className="flex gap-1">
          {[30, 60, 120].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors
                ${interval === value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
            >
              {value === 60 ? '1 hour' : value === 120 ? '2 hours' : '30 min'}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((timeSlot) => {
          const isBooked = isTimeSlotBooked(timeSlot);
          const isSelected = isTimeSlotSelected(timeSlot);
          const isDisabled = isBooked && !isEditing;
          
          return (
            <button
              key={timeSlot}
              type="button"
              onClick={() => !isDisabled && onSelectSlot(timeSlot)}
              disabled={isDisabled}
              className={`
                p-2 rounded-lg border text-sm transition-colors
                ${isSelected 
                  ? 'bg-blue-100 border-blue-300 text-blue-700 font-medium' 
                  : isBooked && isEditing
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : isBooked
                      ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                      : 'hover:bg-gray-50 border-gray-200'
                }
              `}
            >
              {timeSlot}
              {isBooked && !isEditing && (
                <span className="block text-xs text-red-500 mt-1">Booked</span>
              )}
              {isBooked && isEditing && !isSelected && (
                <span className="block text-xs text-blue-500 mt-1">Already Booked</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotSelector; 