import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';


const TaskModal = ({ isOpen, onClose, onSave, task, projectId, teamMembers, hideReviewSection = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    assignee: {}, // Changed to object to store multiple assignees
    status: 'todo',
    evidence: [],
    isDisposed: false,
    review: {
      status: 'pending',
      comments: []
    }
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (task) {
      // Clean up assignees to only include valid entries
      const validAssignees = Object.entries(task.assignee || {})
        .filter(([_, assignee]) => assignee && assignee.name)
        .reduce((acc, [id, assignee]) => {
          acc[id] = assignee;
          return acc;
        }, {});

      setFormData({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate || new Date().toISOString().split('T')[0],
        dueDate: task.dueDate || '',
        assignee: validAssignees,
        status: task.status || 'todo',
        evidence: Array.isArray(task.evidence) ? task.evidence : [],
        isDisposed: task.isDisposed || false,
        review: task.review || {
          status: 'pending',
          comments: []
        }
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        assignee: {},
        status: 'todo',
        evidence: [],
        isDisposed: false,
        review: {
          status: 'pending',
          comments: []
        }
      });
    }
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
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [projectId, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (Object.keys(formData.assignee).length === 0) {
      toast.error('Please assign at least one team member');
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleAssigneeChange = (member) => {
    setFormData(prev => {
      const newAssignee = { ...prev.assignee };
      if (newAssignee[member.id]) {
        delete newAssignee[member.id];
      } else {
        newAssignee[member.id] = {
          email: member.email,
          id: member.id,
          name: member.name,
          role: member.role,
          skills: member.skills || []
        };
      }
      return { ...prev, assignee: newAssignee };
    });
  };

  const handleEvidenceToggle = (documentId) => {
    setFormData(prev => {
      const currentEvidence = prev.evidence || [];
      if (currentEvidence.includes(documentId)) {
        return {
          ...prev,
          evidence: currentEvidence.filter(id => id !== documentId)
        };
      } else {
        return {
          ...prev,
          evidence: [...currentEvidence, documentId]
        };
      }
    });
  };

  const handleReviewApprove = () => {
    if (!comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    setFormData(prev => ({
      ...prev,
      review: {
        ...prev.review,
        status: 'approved',
        comments: [
          ...(prev.review?.comments || []),
          {
            comment,
            status: 'approved',
            timestamp: new Date().toISOString()
          }
        ]
      }
    }));
    setComment('');
  };

  const handleReviewReject = () => {
    if (!comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    setFormData(prev => ({
      ...prev,
      review: {
        ...prev.review,
        status: 'changes_requested',
        comments: [
          ...(prev.review?.comments || []),
          {
            comment,
            status: 'changes_requested',
            timestamp: new Date().toISOString()
          }
        ]
      }
    }));
    setComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'Create Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Assignees
            </label>
            <div className="flex flex-wrap gap-1.5 p-1.5 border rounded-lg">
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleAssigneeChange(member)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm ${
                    formData.assignee[member.id]
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Evidence of Work
              <span className="text-xs text-gray-500 font-normal ml-1">(Select files or links as evidence)</span>
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-lg divide-y">
              {loading ? (
                <div className="flex justify-center items-center p-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 text-center">
                  No documents available
                </div>
              ) : (
                <div>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEvidenceToggle(doc.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.evidence?.includes(doc.id)}
                        onChange={() => handleEvidenceToggle(doc.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      {doc.type === 'link' ? (
                        <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <FileText size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate flex-1">{doc.name}</span>
                      {formData.evidence?.includes(doc.id) && (
                        <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review Section - Only show for tasks in review status and when not hidden */}
          {formData.status === 'review' && !hideReviewSection && (
            <div className="space-y-3 border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700">Review</h4>
              
              {/* Review Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.review?.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : formData.review?.status === 'changes_requested'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.review?.status === 'approved'
                    ? 'Approved'
                    : formData.review?.status === 'changes_requested'
                    ? 'Changes Requested'
                    : 'Pending Review'}
                </span>
              </div>

              {/* Review Comment Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  Review Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your review comment..."
                  rows={2}
                />
              </div>

              {/* Review Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReviewReject}
                  className="px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-1.5"
                >
                  <XCircle size={16} />
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={handleReviewApprove}
                  className="px-3 py-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1.5"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              </div>

              {/* Review History */}
              {formData.review?.comments?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Review History</h5>
                  <div className="space-y-2">
                    {formData.review.comments.map((comment, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg ${
                          comment.status === 'approved'
                            ? 'bg-green-50 border border-green-100'
                            : 'bg-red-50 border border-red-100'
                        }`}
                      >
                        <p className="text-sm text-gray-600">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 