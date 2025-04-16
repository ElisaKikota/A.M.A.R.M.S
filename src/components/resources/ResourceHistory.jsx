// src/components/resources/ResourceHistory.jsx
import React, { useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { format } from 'date-fns';

const ResourceHistory = ({ resourceId }) => {
  const [history] = useState([]);
  const [loading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');


  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || entry.action === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Actions</option>
          <option value="checkout">Checkouts</option>
          <option value="checkin">Check-ins</option>
          <option value="maintenance">Maintenance</option>
          <option value="booking">Bookings</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    entry.action === 'checkout' ? 'bg-yellow-100 text-yellow-800' :
                    entry.action === 'checkin' ? 'bg-green-100 text-green-800' :
                    entry.action === 'maintenance' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.action}
                  </span>
                  <p className="mt-2">{entry.details}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-1" />
                  {format(new Date(entry.timestamp.seconds * 1000), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceHistory;