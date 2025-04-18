import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

const CalendarWidget = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Calendar className="w-8 h-8 mx-auto mb-2" />
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4" />
              <span>{format(event.date, 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarWidget; 