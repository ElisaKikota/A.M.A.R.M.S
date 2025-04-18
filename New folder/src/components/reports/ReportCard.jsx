// src/components/reports/ReportCard.jsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ReportCard = ({ title, value, change, changeType, icon: Icon }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className={`flex items-center mt-2 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span className="text-sm ml-1">{change}%</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${
          isPositive ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            isPositive ? 'text-green-600' : 'text-blue-600'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default ReportCard;