import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const CalendarView = ({ project, tasks, timeframe, onEditTask, onDeleteTask, currentDate }) => {
  const hasTasksInWeek = (weekDays) => {
    return weekDays.some(day => getTasksForDate(day).length > 0);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days from previous month's monday to current month's last day sunday
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 })
  });

  // Group calendar days into weeks
  const weeks = calendarDays.reduce((acc, day, i) => {
    const weekIndex = Math.floor(i / 7);
    if (!acc[weekIndex]) {
      acc[weekIndex] = [];
    }
    acc[weekIndex].push(day);
    return acc;
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-l-4 border-purple-500';
      case 'dispose':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="text-green-500 flex-shrink-0" size={14} />;
      case 'inProgress':
        return <Clock className="text-blue-500 flex-shrink-0" size={14} />;
      case 'review':
        return <AlertCircle className="text-purple-500 flex-shrink-0" size={14} />;
      case 'dispose':
        return <AlertCircle className="text-red-500 flex-shrink-0" size={14} />;
      default:
        return <Clock className="text-gray-500 flex-shrink-0" size={14} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'done':
        return 'Done';
      case 'inProgress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'todo':
        return 'To Do';
      case 'dispose':
        return 'Disposed';
      default:
        return 'To Do';
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate || task.dueDate);
      const currentDate = new Date(date);
      
      // Reset time components for accurate date comparison
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      return currentDate >= taskStart && currentDate <= taskEnd;
    });
  };

  return (
    <div className="bg-white">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Weekday Headers */}
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="border-r last:border-r-0 border-b py-1 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Weeks */}
        {weeks.map((weekDays, weekIndex) => {
          const hasActivity = hasTasksInWeek(weekDays);
          
          return weekDays.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`${hasActivity ? 'min-h-[100px]' : 'h-8'} border-r last:border-r-0 border-b last-rows:border-b-0 p-1 transition-all ${
                  isToday(day) ? 'bg-blue-50' : ''
                } ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
              >
                <div className={`text-right text-xs px-1 ${isCurrentMonth ? 'font-medium' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </div>
                
                {hasActivity && (
                  <div className="space-y-0.5">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className="group relative"
                      >
                        <div 
                          className={`${getStatusColor(task.status)} rounded px-1.5 py-0.5 text-xs shadow-sm group-hover:shadow transition-shadow cursor-pointer`}
                          onClick={() => onEditTask(task)}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {getStatusIcon(task.status)}
                            <span className="truncate text-xs">{task.title}</span>
                          </div>

                          {/* Hover Info Card */}
                          <div className="absolute z-50 left-0 -top-1 -translate-y-full bg-white text-sm rounded shadow-lg border border-gray-200 p-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="font-medium mb-1 text-sm">{task.title}</div>
                            <div className="text-xs text-gray-600 mb-1">
                              {format(new Date(task.startDate), 'MMM d')} - {format(new Date(task.endDate || task.dueDate), 'MMM d')}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="font-medium">Stage: </span>
                              <span>{getStatusLabel(task.status)}</span>
                            </div>
                            {task.assignee && (
                              <div className="text-xs mt-0.5">
                                <span className="font-medium">Assigned: </span>
                                {task.assignee.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};

export default CalendarView; 