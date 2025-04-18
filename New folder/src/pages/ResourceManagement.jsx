import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { Calendar, Package, Monitor, Home, History, PlusCircle, Search, Filter, CheckSquare, XSquare } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import HardwareSection from '../components/resources/HardwareSection';
import SoftwareSection from '../components/resources/SoftwareSection';

// Simple Card component to replace @/components/ui/card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState('hardware');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with Firebase data
  const venues = [
    { id: 1, name: 'Main Lab', capacity: 30, equipment: ['Projector', 'Whiteboards'] },
    { id: 2, name: 'Workshop', capacity: 15, equipment: ['3D Printer', 'Tools'] }
  ];

  // Weekly calendar data
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  });

  const navigationTabs = [
    { id: 'hardware', label: 'Hardware', icon: Package },
    { id: 'software', label: 'Software', icon: Monitor },
    { id: 'venues', label: 'Venues', icon: Home },
    { id: 'history', label: 'Usage History', icon: History }
  ];

  const WeeklyCalendar = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          Previous
        </button>
        <h3 className="text-lg font-semibold">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        <button
          onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.toString()} className="border rounded-lg p-2">
            <div className="text-sm font-medium mb-1">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
            <div className="mt-2 space-y-1">
              {/* Sample events */}
              <div className="text-xs bg-blue-100 text-blue-800 rounded p-1">
                Lab Meeting (9:00)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ResourceCard = ({ resource, type }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{resource.name}</h3>
          {type === 'hardware' ? (
            <div className="space-y-2 mt-2">
              <p className="text-sm text-gray-600">Quantity: {resource.quantity}</p>
              <p className="text-sm text-gray-600">Condition: {resource.condition}</p>
              <span className={`px-2 py-1 rounded-full text-sm ${resource.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}>
                {resource.status}
              </span>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              <p className="text-sm text-gray-600">
                Licenses: {resource.used}/{resource.licenses}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${(resource.used / resource.licenses) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {type === 'hardware' && (
            <>
              <button className="p-2 hover:bg-green-100 rounded-full text-green-600">
                <CheckSquare size={20} />
              </button>
              <button className="p-2 hover:bg-red-100 rounded-full text-red-600">
                <XSquare size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all resources</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <PlusCircle size={20} />
          Add Resource
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 border-b">
        {navigationTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:border-gray-300'
              }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {activeTab === 'hardware' && <HardwareSection />}

        {activeTab === 'software' && <SoftwareSection />}

        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map(venue => (
                <Card key={venue.id} className="p-4">
                  <h3 className="font-semibold">{venue.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Capacity: {venue.capacity}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Equipment:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {venue.equipment.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <WeeklyCalendar />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Resource Usage History</h3>
            </div>
            <div className="p-4">
              {/* Add history table or list here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagement;