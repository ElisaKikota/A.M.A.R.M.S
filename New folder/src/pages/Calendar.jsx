import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { Calendar as Plus, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const Calendar = () => {
  const { user } = useFirebase();
  const { getRoles } = useAuth();
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    visibility: 'everyone',
    visibleToRoles: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load roles
        const rolesData = await getRoles();
        setRoles(rolesData);

        // Load events
        const eventsSnapshot = await getDocs(collection(db, 'calendarEvents'));
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading calendar data:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, getRoles]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...newEvent,
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'calendarEvents'), eventData);
      toast.success('Event created successfully');
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        visibility: 'everyone',
        visibleToRoles: []
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'calendarEvents', eventId));
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-gray-500 mt-1">Manage and view team events</p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {/* Calendar header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {eachDayOfInterval({
            start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
            end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
          }).map((date, index) => {
            const dayEvents = events.filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate.toDateString() === date.toDateString();
            });

            return (
              <div
                key={index}
                className={`min-h-[100px] border rounded-lg p-2 hover:bg-gray-50 ${
                  !isSameMonth(date, currentDate) ? 'bg-gray-50' : ''
                } ${isToday(date) ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !isSameMonth(date, currentDate) ? 'text-gray-400' : ''
                }`}>
                  {format(date, 'd')}
                </div>
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs bg-blue-100 text-blue-800 rounded p-1 mb-1 cursor-pointer hover:bg-blue-200"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Create New Event</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Visibility
                </label>
                <select
                  value={newEvent.visibility}
                  onChange={(e) => setNewEvent({ ...newEvent, visibility: e.target.value, visibleToRoles: [] })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="everyone">Everyone</option>
                  <option value="selected">Selected Roles</option>
                </select>
              </div>
              {newEvent.visibility === 'selected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    Select Roles
                  </label>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 max-h-32 overflow-y-auto">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={newEvent.visibleToRoles.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEvent({
                                ...newEvent,
                                visibleToRoles: [...newEvent.visibleToRoles, role.id]
                              });
                            } else {
                              setNewEvent({
                                ...newEvent,
                                visibleToRoles: newEvent.visibleToRoles.filter(id => id !== role.id)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Description</p>
                <p className="mt-1">{selectedEvent.description}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="mt-1">
                  {format(new Date(selectedEvent.startDate), 'PPpp')} -{' '}
                  {format(new Date(selectedEvent.endDate), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Visibility</p>
                <p className="mt-1 capitalize">{selectedEvent.visibility}</p>
              </div>
              {selectedEvent.visibleToRoles?.length > 0 && (
                <div>
                  <p className="text-gray-500">Visible To Roles</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedEvent.visibleToRoles.map(roleId => {
                      const role = roles.find(r => r.id === roleId);
                      return role ? (
                        <span
                          key={roleId}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          <Users size={14} />
                          {role.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 