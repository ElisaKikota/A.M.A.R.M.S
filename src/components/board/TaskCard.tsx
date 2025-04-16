import React, { useState } from 'react';
import { Calendar, Users, Paperclip } from 'lucide-react';
import ReviewApprovalModal from './ReviewApprovalModal';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    assignee?: {
      id: string;
      name: string;
    };
    evidence?: any[];
    status?: string;
    review?: {
      status: string;
      comments: any[];
    };
  };
  onEdit: (task: any) => void;
  currentUser?: any;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, currentUser }) => {
  // Get evidence count
  const evidenceCount = task.evidence?.length || 0;

  return (
    <div
      onClick={() => onEdit(task)}
      className={`bg-white px-2.5 py-2 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full min-w-[200px] ${
        task.status === 'review' && task.review?.status === 'changes_requested'
          ? 'bg-red-50 border-red-100'
          : task.status === 'review' && task.review?.status === 'approved'
          ? 'bg-green-50 border-green-100'
          : ''
      }`}
    >
      <h4 className="font-medium text-sm mb-1 line-clamp-1">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-1 line-clamp-2">{task.description}</p>
      )}

      {task.assignee && (
        <div className="flex items-center gap-1 mb-1">
          <Users size={12} className="text-blue-600" />
          <div className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium truncate max-w-[100px]">
            {task.assignee.name}
          </div>
        </div>
      )}

      {(task.dueDate || evidenceCount > 0) && (
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1 border-t pt-1 border-gray-100">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {evidenceCount > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <Paperclip size={12} />
              <span>{evidenceCount}</span>
            </div>
          )}
        </div>
      )}

      {task.status === 'review' && (
        <div className="flex items-center gap-1 text-xs mt-2 pt-2 border-t border-gray-100">
          <div className={`px-1.5 py-0.5 rounded-full ${
            task.review?.status === 'changes_requested'
              ? 'bg-red-100 text-red-800'
              : task.review?.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {task.review?.status === 'changes_requested'
              ? 'Changes Requested'
              : task.review?.status === 'approved'
              ? 'Approved'
              : 'Under Review'}
          </div>
          {task.review?.comments?.length > 0 && (
            <span className="text-gray-500">
              ({task.review.comments.length} {task.review.comments.length === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard; 