import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewApprovalModal = ({ isOpen, onClose, task, currentUser, onApprove, onReject }) => {
  const [comment, setComment] = useState('');

  // Early return if modal is not open or task is not provided
  if (!isOpen || !task || !currentUser) return null;

  const handleApprove = () => {
    if (!comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    const existingApprovals = task.approvals || [];
    if (existingApprovals.some(a => a.userId === currentUser.id)) {
      toast.error('You have already approved this task');
      return;
    }

    onApprove({
      comment,
      reviewedAt: new Date().toISOString(),
      status: 'approved',
      userId: currentUser.id,
      userName: currentUser.name
    });
    setComment('');
  };

  const handleReject = () => {
    if (!comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    onReject({
      comment,
      reviewedAt: new Date().toISOString(),
      status: 'changes_requested',
      userId: currentUser.id,
      userName: currentUser.name
    });
    setComment('');
  };

  const approvalCount = (task.approvals || []).length;
  const userHasApproved = (task.approvals || []).some(a => a.userId === currentUser.id);
  const allComments = [...(task.approvals || []), ...(task.changes || [])].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-medium">{task.title || 'Untitled Task'}</h3>
            <p className="text-sm text-gray-600">{task.description || 'No description provided'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Review Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Review Status</span>
            <span className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
              approvalCount === 2 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <MessageSquare size={16} />
              {approvalCount}/2 Approvals
            </span>
          </div>

          {/* Review Form */}
          {!userHasApproved && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add your review comment..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Request Changes
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              </div>
            </div>
          )}

          {/* Review History */}
          {allComments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Review History</h4>
              <div className="space-y-2">
                {allComments.map((comment, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      comment.status === 'approved'
                        ? 'bg-green-50 border border-green-100'
                        : 'bg-red-50 border border-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {comment.userName || 'Unknown User'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        comment.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {comment.status === 'approved' ? 'Approved' : 'Changes Requested'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.reviewedAt || comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewApprovalModal; 