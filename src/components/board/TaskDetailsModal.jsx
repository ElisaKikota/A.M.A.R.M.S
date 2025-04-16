import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Edit, ExternalLink, FileText } from 'lucide-react';
import { firebaseDb } from '../../services/firebaseDb';
import { storageService } from '../../firebase/storageConfig';

const TaskDetailsModal = ({ isOpen, onClose, task, onEdit, projectId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleDocumentClick = async (document) => {
    if (!document) return;
    
    try {
      if (document.type === 'link') {
        window.open(document.url, '_blank');
      } else if (document.type === 'file') {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-start p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-sm ${
                task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                task.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                task.status === 'done' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status === 'todo' ? 'To Do' :
                 task.status === 'inProgress' ? 'In Progress' :
                 task.status === 'review' ? 'Review' :
                 task.status === 'done' ? 'Done' :
                 task.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 hover:text-blue-700"
              title="Edit Task"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {task.description || 'No description provided'}
            </p>
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
                        onClick={() => document && handleDocumentClick(document)}
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
    </div>
  );
};

export default TaskDetailsModal; 