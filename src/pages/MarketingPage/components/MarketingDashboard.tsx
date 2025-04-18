import React from 'react';
import { Link } from 'react-router-dom';

interface MarketingDashboardProps {
  data: any;
}

const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ data }) => {
  // Mock data for demonstration
  const metrics = [
    { name: 'Total Campaigns', value: '12', change: '+2', changeType: 'increase' },
    { name: 'Active Content', value: '24', change: '+5', changeType: 'increase' },
    { name: 'Engagement Rate', value: '3.2%', change: '+0.5%', changeType: 'increase' },
    { name: 'Conversion Rate', value: '1.8%', change: '-0.2%', changeType: 'decrease' },
  ];

  const recentCampaigns = [
    { id: 1, name: 'Summer Promotion', status: 'Active', progress: 75 },
    { id: 2, name: 'Product Launch', status: 'Planning', progress: 30 },
    { id: 3, name: 'Holiday Special', status: 'Completed', progress: 100 },
  ];

  return (
    <div className="p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-indigo-500 flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {metric.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metric.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {metric.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Campaigns
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentCampaigns.map((campaign, index) => (
                <li key={campaign.id}>
                  <div className="relative pb-8">
                    {index !== recentCampaigns.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            campaign.status === 'Active'
                              ? 'bg-green-500'
                              : campaign.status === 'Planning'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                          }`}
                        >
                          <span className="text-white text-sm">📢</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {campaign.name}{' '}
                            <span className="font-medium text-gray-900">
                              {campaign.status}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${campaign.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <Link
              to="/marketing/campaigns"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all campaigns
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create New Campaign
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Schedule Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard; 