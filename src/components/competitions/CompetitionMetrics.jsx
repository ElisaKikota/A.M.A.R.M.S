import React from 'react';
import { Trophy, TrendingUp, DollarSign, Clock, Award } from 'lucide-react';

const CompetitionMetrics = ({ metrics }) => {
  if (!metrics) return null;

  const metricCards = [
    {
      title: 'Total Applications',
      value: metrics.totalApplications,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Funding',
      value: `$${metrics.totalFundingReceived.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Competitions',
      value: metrics.activeCompetitions,
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Upcoming Deadlines',
      value: metrics.upcomingDeadlines,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Competition Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="flex items-center p-4 rounded-lg border">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompetitionMetrics; 