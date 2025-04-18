import React from 'react';
import {
  Info,
  Clock,
  LayoutGrid,
  FileText,
  Activity,
  Rocket,
  File,
  MessageSquare
} from 'lucide-react';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'specifications', label: 'Specifications', icon: FileText },
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'files', label: 'Files', icon: File },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'launch-strategy', label: 'Launch Strategy', icon: Rocket },
    { id: 'comments', label: 'Comments', icon: MessageSquare }
  ];

  return (
    <div className="flex space-x-8">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default Navigation; 