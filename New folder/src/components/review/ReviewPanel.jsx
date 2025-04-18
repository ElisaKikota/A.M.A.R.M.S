import React, { useState, useEffect, useCallback } from 'react';
import { Paperclip, Calendar, Link, CheckCircle, MessageSquare, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';

const ReviewerForm = ({ taskId, reviewerNumber, onApprove, onRequestChanges, currentUser, initialValue = '' }) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [localComment, setLocalComment] = useState(initialValue);
  const [isApproved, setIsApproved] = useState(false);
  const [hasRequestedChanges, setHasRequestedChanges] = useState(false);
  const [submittedComment, setSubmittedComment] = useState('');

  const handleApproveClick = () => {
    onApprove('Approved');
    setIsApproved(true);
  };

  const handleCommentChangesClick = () => {
    setShowCommentForm(true);
  };

  const handleRequestChangesSubmit = () => {
    if (!localComment.trim()) {
      toast.error('Please add a comment before requesting changes');
      return;
    }
    onRequestChanges(localComment);
    setHasRequestedChanges(true);
    setSubmittedComment(localComment);
    setShowCommentForm(false);
  };

  const handleCancelComment = () => {
    setShowCommentForm(false);
    setLocalComment('');
  };

  if (isApproved) {
    return (
      <div className="space-y-2 bg-green-50 p-2 rounded-md animate-fade-in">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Approved by {currentUser.name}</span>
        </div>
      </div>
    );
  }

  if (hasRequestedChanges) {
    return (
      <div className="space-y-2 bg-red-50 p-2 rounded-md animate-fade-in">
        <div className="flex items-center space-x-2 text-red-600">
          <MessageSquare size={16} />
          <span className="text-sm font-medium">{currentUser.name} requested changes</span>
        </div>
        <p className="text-sm text-gray-600 italic">"{submittedComment}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!showCommentForm ? (
        <div className="flex flex-col space-y-1.5">
          <button
            onClick={handleApproveClick}
            className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-green-50 text-green-600 text-sm rounded-md hover:bg-green-100 transition-colors duration-200 border border-green-200"
          >
            <CheckCircle size={14} />
            <span>Approve</span>
          </button>
          <button
            onClick={handleCommentChangesClick}
            className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
          >
            <MessageSquare size={14} />
            <span>Comment Changes</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-slide-down">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Add Comment</span>
            <button
              onClick={handleCancelComment}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          <textarea
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            placeholder="Enter your comments..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            rows={3}
          />
          <button
            onClick={handleRequestChangesSubmit}
            className="flex items-center justify-center w-full space-x-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100 transition-colors duration-200 border border-red-200"
          >
            <Send size={14} />
            <span>Request Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Add these styles at the top of your CSS file or in your Tailwind config
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
`;

// Add the styles to a style tag in the document head
if (!document.getElementById('review-panel-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'review-panel-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const ReviewPanel = ({ projectId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  // Store comments as { taskId: { reviewer1: comment, reviewer2: comment } }
  const [setReviewComments] = useState({});

  const loadReviews = useCallback(async () => {
    try {
      const reviewsData = await firebaseDb.getTaskReviews(projectId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    }
  }, [projectId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleApprove = async (taskId, reviewerNumber, comment) => {
    try {
      const review = reviews.find(r => r.taskId === taskId);
      const updatedReview = {
        ...review,
        approvals: [
          ...(review.approvals || []),
          {
            userId: currentUser.id,
            userName: currentUser.name,
            comment: comment,
            timestamp: new Date().toISOString(),
            status: 'approved'
          }
        ]
      };

      // Check if this is the second approval
      if (updatedReview.approvals.length === 2) {
        // Move task to done
        await firebaseDb.updateTaskStatus(projectId, taskId, 'done');
      }

      await firebaseDb.updateTaskReview(projectId, taskId, updatedReview);
      setReviewComments(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`reviewer${reviewerNumber}`]: ''
        }
      }));
      await loadReviews();
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleRequestChanges = async (taskId, reviewerNumber, comment) => {
    try {
      const review = reviews.find(r => r.taskId === taskId);
      const updatedReview = {
        ...review,
        changes: [
          ...(review.changes || []),
          {
            userId: currentUser.id,
            userName: currentUser.name,
            comment: comment,
            timestamp: new Date().toISOString(),
            status: 'changes_requested'
          }
        ]
      };

      // Move task back to in progress
      await firebaseDb.updateTaskStatus(projectId, taskId, 'inProgress');
      await firebaseDb.updateTaskReview(projectId, taskId, updatedReview);
      setReviewComments(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [`reviewer${reviewerNumber}`]: ''
        }
      }));
      await loadReviews();
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Milestone
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assignees
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attachments
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reviewer 1
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reviewer 2
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                No tasks pending review
              </td>
            </tr>
          ) : (
            reviews.map((review) => {
              const reviewer1 = review.approvals?.[0] || review.changes?.[0];
              const reviewer2 = review.approvals?.[1] || review.changes?.[1];

              return (
                <tr key={review.taskId}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{review.taskTitle}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-500 line-clamp-2">{review.taskDescription}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {review.milestone ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{review.milestone.title}</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(review.milestone.dueDate)}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {Object.values(review.assignees || {}).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.values(review.assignees).map((assignee) => (
                          <span
                            key={assignee.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {assignee.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {review.evidence?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Paperclip size={12} />
                          <span>{review.evidence.length} files</span>
                        </div>
                      )}
                      {review.attachments?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Link size={12} />
                          <span>{review.attachments.length} links</span>
                        </div>
                      )}
                      {!review.evidence?.length && !review.attachments?.length && (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {reviewer1 ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{reviewer1.userName}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            reviewer1.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {reviewer1.status === 'approved' ? 'Approved' : 'Requested Changes'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{reviewer1.comment}"</p>
                      </div>
                    ) : (
                      <ReviewerForm 
                        taskId={review.taskId}
                        reviewerNumber={1}
                        currentUser={currentUser}
                        onApprove={(comment) => handleApprove(review.taskId, 1, comment)}
                        onRequestChanges={(comment) => handleRequestChanges(review.taskId, 1, comment)}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {reviewer2 ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{reviewer2.userName}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            reviewer2.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {reviewer2.status === 'approved' ? 'Approved' : 'Requested Changes'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{reviewer2.comment}"</p>
                      </div>
                    ) : (
                      <ReviewerForm 
                        taskId={review.taskId}
                        reviewerNumber={2}
                        currentUser={currentUser}
                        onApprove={(comment) => handleApprove(review.taskId, 2, comment)}
                        onRequestChanges={(comment) => handleRequestChanges(review.taskId, 2, comment)}
                      />
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewPanel; 