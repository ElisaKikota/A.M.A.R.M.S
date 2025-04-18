import React from 'react';
import { Image, FileText, Droplet, Upload, AlertCircle } from 'react-feather';

const GraphicsPage = () => {
  const quickStats = [
    { label: 'Active Projects', value: '12', icon: Image, color: 'bg-blue-500' },
    { label: 'Pending Approvals', value: '5', icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'Total Assets', value: '245', icon: FileText, color: 'bg-green-500' },
    { label: 'Recent Uploads', value: '8', icon: Upload, color: 'bg-purple-500' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Graphics Dashboard</h1>
        <p className="text-gray-600">Manage design assets and projects</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design Assets Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Design Assets</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
              <Upload size={16} className="mr-2" />
              Upload New
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Image size={20} className="text-gray-500 mr-3" />
                <span>Brand Guidelines 2024</span>
              </div>
              <span className="text-sm text-gray-500">Updated 2 days ago</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Image size={20} className="text-gray-500 mr-3" />
                <span>Social Media Templates</span>
              </div>
              <span className="text-sm text-gray-500">Updated 1 week ago</span>
            </div>
          </div>
        </div>

        {/* Project Requests Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Project Requests</h2>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
              New Request
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Website Redesign</p>
                <p className="text-sm text-gray-500">Due: 2024-03-15</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                In Progress
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Product Launch Graphics</p>
                <p className="text-sm text-gray-500">Due: 2024-03-20</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Brand Guidelines Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Brand Guidelines</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Droplet size={20} className="text-gray-500 mb-2" />
              <h3 className="font-medium">Color Palette</h3>
              <p className="text-sm text-gray-500">Primary and secondary colors</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <FileText size={20} className="text-gray-500 mb-2" />
              <h3 className="font-medium">Typography</h3>
              <p className="text-sm text-gray-500">Font styles and usage</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Asset Usage</span>
              <span className="font-medium">1,234 views</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Team Performance</span>
              <span className="font-medium">98% on time</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Approval Rate</span>
              <span className="font-medium">95%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicsPage; 