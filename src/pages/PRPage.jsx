import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, FileText, Calendar, Users, BarChart, AlertTriangle } from 'lucide-react';

const PRPage = () => {
  const { user } = useAuth();
  const [pressReleases] = useState([]);
  const [events] = useState([]);
  const [mediaContacts] = useState([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Public Relations</h1>
          <p className="text-gray-500 mt-1">Manage media relations and public communications</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-blue-600" size={24} />
            <h3 className="font-medium">Press Releases</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Active Releases</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-green-600" size={24} />
            <h3 className="font-medium">Events</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-purple-600" size={24} />
            <h3 className="font-medium">Media Contacts</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Active Contacts</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <BarChart className="text-yellow-600" size={24} />
            <h3 className="font-medium">Coverage</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Media Mentions</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Press Releases Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Press Releases</h2>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                user?.permissions?.includes('pr.createPressRelease')
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!user?.permissions?.includes('pr.createPressRelease')}
            >
              <PlusCircle size={20} />
              New Release
            </button>
          </div>
          <div className="space-y-4">
            {pressReleases.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No press releases yet</p>
            ) : (
              <div className="space-y-2">
                {/* Press release list will go here */}
              </div>
            )}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Events</h2>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                user?.permissions?.includes('pr.manageEvents')
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!user?.permissions?.includes('pr.manageEvents')}
            >
              <PlusCircle size={20} />
              New Event
            </button>
          </div>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events scheduled</p>
            ) : (
              <div className="space-y-2">
                {/* Event list will go here */}
              </div>
            )}
          </div>
        </div>

        {/* Media Contacts Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Media Contacts</h2>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                user?.permissions?.includes('pr.manageMediaContacts')
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!user?.permissions?.includes('pr.manageMediaContacts')}
            >
              <PlusCircle size={20} />
              Add Contact
            </button>
          </div>
          <div className="space-y-4">
            {mediaContacts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No media contacts added</p>
            ) : (
              <div className="space-y-2">
                {/* Media contacts list will go here */}
              </div>
            )}
          </div>
        </div>

        {/* Crisis Communication Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Crisis Communication</h2>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                user?.permissions?.includes('pr.manageCrisis')
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!user?.permissions?.includes('pr.manageCrisis')}
            >
              <AlertTriangle size={20} />
              New Alert
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Crisis Protocols</h3>
              <p className="text-sm text-gray-600">
                Access pre-approved response templates and communication protocols for crisis situations.
              </p>
            </div>
            {/* Crisis alerts and protocols will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRPage; 