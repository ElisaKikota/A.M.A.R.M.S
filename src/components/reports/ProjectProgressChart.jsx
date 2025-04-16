// src/components/reports/ProjectProgressChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProjectProgressChart = ({ data }) => {
  // If no data is provided, display a placeholder
  const chartData = data && data.length > 0 
    ? data.map(item => ({
        name: item.name,
        completed: item.completed || 0,
        inProgress: item.inProgress || 0
      }))
    : [
        { name: 'No projects', completed: 0, inProgress: 0 }
      ];

  // Calculate max value for Y axis
  const maxCount = Math.max(
    ...chartData.map(item => Math.max(item.completed + item.inProgress, 1)),
    3 // Minimum scale of 3 for better visualization
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Project Progress Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={25}
            barGap={5}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Truncate long names
                return value.length > 12 ? value.substring(0, 10) + '...' : value;
              }}
            />
            <YAxis 
              domain={[0, maxCount]} 
              allowDecimals={false} 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (value === 0) return ["None", name];
                return [`${value} milestone${value !== 1 ? 's' : ''}`, name];
              }}
              labelFormatter={(label) => `Project: ${label}`}
              cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}
            />
            <Legend />
            <Bar 
              dataKey="completed" 
              name="Completed Milestones" 
              fill="#10B981"
            />
            <Bar 
              dataKey="inProgress" 
              name="In Progress Milestones" 
              fill="#3B82F6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectProgressChart;