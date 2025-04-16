import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Overview from './pages/Overview';
import Timeline from './pages/Timeline';
import Board from './pages/Board';
import Files from './pages/Files';
import Specifications from './pages/Specifications';
import Activity from './pages/Activity';
import LaunchStrategy from './pages/LaunchStrategy';
import Comments from './pages/Comments';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'Info' },
  { id: 'specifications', label: 'Specifications', icon: 'FileText' },
  { id: 'board', label: 'Board', icon: 'LayoutGrid' },
  { id: 'timeline', label: 'Timeline', icon: 'Clock' },
  { id: 'files', label: 'Files', icon: 'File' },
  { id: 'activity', label: 'Activity', icon: 'Activity' },
  { id: 'launch-strategy', label: 'Launch Strategy', icon: 'Rocket' },
  { id: 'comments', label: 'Comments', icon: 'MessageSquare' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview project={currentProject} />;
      case 'timeline':
        return <Timeline project={currentProject} />;
      case 'board':
        return <Board project={currentProject} />;
      case 'files':
        return <Files project={currentProject} />;
      case 'specifications':
        return <Specifications project={currentProject} />;
      case 'activity':
        return <Activity project={currentProject} />;
      case 'launch-strategy':
        return <LaunchStrategy project={currentProject} />;
      case 'comments':
        return <Comments projectId={currentProject.id} />;
      default:
        return <Overview project={currentProject} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Project Management</h1>
          <div className="flex items-center space-x-4">
            {/* ... other header content */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;