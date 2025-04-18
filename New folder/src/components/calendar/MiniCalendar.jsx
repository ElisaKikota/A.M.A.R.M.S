import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';

const MiniCalendar = ({ events = [], currentDate = new Date() }) => {
  const [currentMonth, setCurrentMonth] = useState(currentDate);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Get calendar days
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
  });

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.startDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  const renderDays = () => {
    return calendarDays.map((day, index) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const hasEvents = eventsByDate[dateKey]?.length > 0;
      
      return (
        <div
          key={index}
          className={`
            text-center text-xs p-1 rounded
            ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
            ${isToday(day) ? 'bg-blue-50 text-blue-600 font-medium' : ''}
            ${hasEvents ? 'font-medium' : ''}
            hover:bg-gray-50
          `}
        >
          <span className="block">{format(day, 'd')}</span>
          {hasEvents && (
            <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-0.5" />
          )}
        </div>
      );
    });
  };

  return (
    <div className="select-none">
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="text-blue-600 hover:text-blue-800">&lt;</button>
        <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button onClick={nextMonth} className="text-blue-600 hover:text-blue-800">&gt;</button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
};

export default MiniCalendar; 