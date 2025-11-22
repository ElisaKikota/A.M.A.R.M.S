import React from 'react';
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  Building, 
  Edit, 
  Plus,
  Clock,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

const CompetitionCard = ({ 
  competition, 
  onEdit, 
  onCreateApplication, 
  canEdit, 
  canCreateApplication 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'awarded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysLeft <= 7) return { status: 'Urgent', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (daysLeft <= 30) return { status: 'Soon', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Open', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const deadlineInfo = getDeadlineStatus(competition.applicationDeadline);

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{competition.name}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
            {competition.status}
          </span>
        </div>

        {/* Organization */}
        <div className="flex items-center gap-2 mb-3">
          <Building className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{competition.organization}</span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {competition.description}
        </p>

        {/* Funding Amount */}
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            {competition.currency} {Number(competition.fundingAmount).toLocaleString()}
          </span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Deadline: {format(new Date(competition.applicationDeadline), 'MMM d, yyyy, h:mm a')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${deadlineInfo.bgColor} ${deadlineInfo.color}`}>
              {deadlineInfo.status}
            </span>
          </div>
        </div>

        {/* Requirements */}
        {competition.requirements && competition.requirements.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Requirements:</p>
            <div className="flex flex-wrap gap-1">
              {competition.requirements.slice(0, 3).map((req, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {req}
                </span>
              ))}
              {competition.requirements.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{competition.requirements.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {canCreateApplication && competition.status === 'open' && (
            <button
              onClick={() => onCreateApplication(competition)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              Apply
            </button>
          )}
          
          {canEdit && (
            <button
              onClick={() => onEdit(competition)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit size={16} />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionCard; 