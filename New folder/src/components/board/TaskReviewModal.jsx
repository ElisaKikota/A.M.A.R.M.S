import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, CheckCircle, XCircle, ExternalLink, FileText } from 'lucide-react';
import TaskModal from './TaskModal';
import { firebaseDb } from '../../services/firebaseDb';
import { storageService } from '../../firebase/storageConfig';

const TaskReviewModal = ({ isOpen, onClose, task, currentUser, onApprove, onReject, onUpdateTask, projectId, teamMembers }) => {
  const [reviewComment, setReviewComment] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState(task?.review?.comments || []);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update local reviews when task changes
    setLocalReviews(task?.review?.comments || []);
  }, [task]);

  // Load project documents when modal opens
  useEffect(() => {
    const loadDocuments = async () => {
      if (!projectId || !isOpen) return;
      
      setLoading(true);
      try {
        const projectDocs = await firebaseDb.getProjectDocuments(projectId);
        setDocuments(projectDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [projectId, isOpen]);

  if (!isOpen || !task) return null;

  const getReviewStatus = () => {
    if (localReviews.length === 0) {
      return {
        text: 'Under Review',
        className: 'bg-purple-100 text-purple-800'
      };
    }

    const lastReview = localReviews[localReviews.length - 1];
    if (lastReview.status === 'approved') {
      return {
        text: 'Approved',
        className: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        text: 'Changes Requested',
        className: 'bg-red-100 text-red-800'
      };
    }
  };

  const handleApprove = () => {
    const newReview = {
      comment: reviewComment,
      reviewer: {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email
      },
      status: 'approved',
      timestamp: new Date().toISOString()
    };
    
    // Update local state first
    setLocalReviews([...localReviews, newReview]);
    setReviewComment('');
    
    // Then call the parent handler
    onApprove({
      comment: reviewComment,
      reviewer: {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email
      },
      timestamp: new Date().toISOString()
    });
  };

  const handleReject = () => {
    const newReview = {
      comment: reviewComment,
      reviewer: {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email
      },
      status: 'changes_requested',
      timestamp: new Date().toISOString()
    };
    
    // Update local state first
    setLocalReviews([...localReviews, newReview]);
    setReviewComment('');
    
    // Then call the parent handler
    onReject({
      comment: reviewComment,
      reviewer: {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email
      },
      timestamp: new Date().toISOString()
    });
  };

  const handleTaskUpdate = (updatedTask) => {
    onUpdateTask(updatedTask);
    setIsTaskModalOpen(false);
  };

  const handleDocumentClick = async (document) => {
    if (!document) return;
    
    try {
      if (document.type === 'link') {
        // For links, use the url property
        window.open(document.url, '_blank');
      } else if (document.type === 'file') {
        // For files, use the fileUrl if available, otherwise get it from storage
        if (document.fileUrl) {
          window.open(document.fileUrl, '_blank');
        } else if (document.filePath) {
          const downloadUrl = await storageService.getDownloadUrl(document.filePath);
          if (downloadUrl) {
            window.open(downloadUrl, '_blank');
          }
        }
      }
    } catch (error) {
      console.error('Error opening document:', error);
      alert('Error opening document. Please try again.');
    }
  };

  const reviewStatus = getReviewStatus();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-start p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold mb-1">Task Review</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-sm ${reviewStatus.className}`}>
                  {reviewStatus.text}
                </span>
                {localReviews.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({localReviews.length} {localReviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Column - Task Details */}
            <div className="w-1/2 p-4 border-r overflow-y-auto">
              <div className="space-y-6">
                {/* Task Title and Description */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">Start Date</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{new Date(task.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {task.dueDate && (
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">Due Date</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignees */}
                {Object.values(task.assignee || {}).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Assignees</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(task.assignee || {})
                        .filter(assignee => assignee && assignee.name)
                        .map((assignee, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                            <Users size={14} />
                            <span>{assignee.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Evidence */}
                {task.evidence?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Evidence of Work</h3>
                    <div className="space-y-2">
                      {loading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                          <span>Loading evidence...</span>
                        </div>
                      ) : (
                        task.evidence.map((evidenceId, idx) => {
                          const document = documents.find(doc => doc.id === evidenceId);
                          return (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer group"
                              onClick={() => handleDocumentClick(document)}
                            >
                              {document?.type === 'link' ? (
                                <ExternalLink size={16} className="group-hover:text-blue-600" />
                              ) : (
                                <FileText size={16} className="group-hover:text-blue-600" />
                              )}
                              <span className="group-hover:text-blue-600 group-hover:underline">
                                {document ? document.name : 'Loading...'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Review Section */}
            <div className="w-1/2 p-4 flex flex-col overflow-y-auto">
              {/* Review History */}
              {localReviews.length > 0 && (
                <div className="space-y-3 flex-1 overflow-y-auto mb-4">
                  <h4 className="font-medium">Review History</h4>
                  <div className="space-y-3">
                    {localReviews.map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{comment.reviewer.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            comment.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {comment.status === 'approved' ? 'Approved' : 'Changes Requested'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.comment}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Input */}
              <div className="space-y-3 mt-auto">
                <h4 className="font-medium">Add Review</h4>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Enter your review comments..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!reviewComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    Request Changes
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={!reviewComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={task}
          onSave={handleTaskUpdate}
          mode="edit"
          projectId={projectId}
          teamMembers={teamMembers}
          hideReviewSection={true}
        />
      )}
    </>
  );
};

export default TaskReviewModal; 