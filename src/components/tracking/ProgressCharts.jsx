import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '../shared/Card';

const ProgressCharts = ({ data }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
      <div className="h-64">
        <LineChart width={600} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="progress" stroke="#2563eb" />
          <Line type="monotone" dataKey="target" stroke="#16a34a" />
        </LineChart>
      </div>
    </Card>
  );
};

export default ProgressCharts;