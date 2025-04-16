import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck } from 'lucide-react';

const ApprovalNotification = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <UserCheck className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            You have {count} member{count !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
        <div className="ml-auto pl-3">
          <Link
            to="/member-approvals"
            className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-lg text-yellow-800 text-sm hover:bg-yellow-200"
          >
            <UserCheck size={16} />
            Review Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApprovalNotification; 