import React, { useState, useEffect } from 'react';
import { Users, FileText, ExternalLink, CheckCircle, Download } from 'lucide-react';
import { firebaseDb } from '../../services/firebaseDb';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const TaskForm = ({ task, onClose, onSave, projectTeam, milestones, selectedMilestoneId, projectId, project }) => {
  // Initialize form data from task or with default values
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    startDate: task?.startDate || new Date().toISOString().split('T')[0],
    dueDate: task?.dueDate || '',
    assignee: task?.assignee || null,
    milestoneId: task?.milestoneId || selectedMilestoneId,
    evidence: task?.evidence || [],
    status: task?.status || 'todo'
  });
  
  const [documents, setDocuments] = useState([]);
  const [taskEvidence, setTaskEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // For new tasks (no id), we should always be in edit mode
  // For existing tasks with an id, we start in view mode
  const [isEditMode, setIsEditMode] = useState(!task?.id);

  // Get the selected milestone
  const selectedMilestone = milestones.find(m => m.id === formData.milestoneId);

  // Validate date when it changes
  const handleDateChange = (e) => {
    const { value } = e.target;
    if (!value) {
      setFormData(prev => ({ ...prev, dueDate: '' }));
      setError('');
      return;
    }

    const selectedDate = new Date(value);
    const milestoneDate = selectedMilestone?.dueDate ? new Date(selectedMilestone.dueDate) : null;

    if (milestoneDate && selectedDate > milestoneDate) {
      setError('Task due date cannot be after milestone due date');
    } else {
      setError('');
      setFormData(prev => ({ ...prev, dueDate: value }));
    }
  };

  // Validate date when milestone changes
  const handleMilestoneChange = (e) => {
    const newMilestoneId = e.target.value;
    const newMilestone = milestones.find(m => m.id === newMilestoneId);
    const currentDueDate = formData.dueDate ? new Date(formData.dueDate) : null;
    const newMilestoneDueDate = newMilestone?.dueDate ? new Date(newMilestone.dueDate) : null;

    if (currentDueDate && newMilestoneDueDate && currentDueDate > newMilestoneDueDate) {
      setError('Task due date cannot be after milestone due date');
    } else {
      setError('');
    }

    setFormData(prev => ({ ...prev, milestoneId: newMilestoneId }));
  };

  // Update form data when task or selectedMilestoneId changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate || new Date().toISOString().split('T')[0],
        dueDate: task.dueDate || '',
        assignee: task.assignee || null,
        milestoneId: task.milestoneId || selectedMilestoneId,
        evidence: task.evidence || [],
        status: task.status || 'todo'
      });
      // For new tasks (no id), we should be in edit mode
      setIsEditMode(!task.id);
    } else {
      // If no task is provided, we're creating a new task
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        assignee: null,
        milestoneId: selectedMilestoneId === 'all' ? null : selectedMilestoneId,
        evidence: [],
        status: 'todo'
      });
      setIsEditMode(true);
    }
  }, [task, selectedMilestoneId]);

  // Load project documents and task evidence
  useEffect(() => {
    const loadDocuments = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        // Load all project documents
        const projectDocs = await firebaseDb.getProjectDocuments(projectId);
        setDocuments(projectDocs);
        
        // If editing an existing task, load its evidence
        if (task?.id) {
          const evidence = await firebaseDb.getTaskEvidence(projectId, task.id);
          setTaskEvidence(evidence);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [projectId, task?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEvidenceToggle = (documentId) => {
    const currentEvidence = formData.evidence || [];
    
    if (currentEvidence.includes(documentId)) {
      // Remove evidence
      setFormData({
        ...formData,
        evidence: currentEvidence.filter(id => id !== documentId)
      });
    } else {
      // Add evidence
      setFormData({
        ...formData,
        evidence: [...currentEvidence, documentId]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate date before submitting
    if (error) {
      toast.error(error);
      return;
    }
    
    onSave(formData);
  };

  // Get evidence documents
  const evidenceDocuments = documents.filter(doc => 
    formData.evidence?.includes(doc.id) || task?.evidence?.includes(doc.id)
  );

  // Get milestone name
  const getMilestoneName = () => {
    if (!formData.milestoneId) return 'None';
    const milestone = milestones.find(m => m.id === formData.milestoneId);
    return milestone ? milestone.title : 'Unknown';
  };

  return (
    <div className="space-y-4">
      {isEditMode ? (
        // Edit Mode
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleChange}
              name="title"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={handleChange}
              name="description"
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={formData.assignee?.id || ""}
                  onChange={(e) => {
                    const selectedMemberId = e.target.value;
                    const selectedMember = selectedMemberId 
                      ? projectTeam.find(m => m.id === selectedMemberId) 
                      : null;
                    setFormData({ ...formData, assignee: selectedMember });
                  }}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                >
                  <option value="">Select a person</option>
                  {projectTeam.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Milestone</label>
              <select
                value={formData.milestoneId || ''}
                onChange={handleMilestoneChange}
                name="milestoneId"
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select a milestone</option>
                {milestones.filter(m => m.id !== 'all').map(milestone => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title}
                    {milestone.dueDate ? ` (Due: ${new Date(milestone.dueDate).toLocaleDateString()})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleDateChange}
                className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : ''}`}
                required
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              {selectedMilestone?.dueDate && (
                <p className="text-gray-500 text-sm mt-1">
                  Milestone due date: {new Date(selectedMilestone.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Evidence Section */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Evidence of Work
              <span className="text-xs text-gray-500 ml-2">
                (Select files or links as evidence)
              </span>
            </label>
            
            {loading ? (
              <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No files or links available</p>
                <p className="text-gray-500 text-xs mt-1">
                  Add files or links in the Files tab first
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {documents.map(doc => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      formData.evidence?.includes(doc.id) 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleEvidenceToggle(doc.id)}
                  >
                    <div className="flex-shrink-0">
                      {formData.evidence?.includes(doc.id) ? (
                        <CheckCircle className="text-blue-500" size={16} />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {doc.type === 'file' ? (
                        <FileText className="text-blue-500 flex-shrink-0" size={16} />
                      ) : (
                        <ExternalLink className="text-green-500 flex-shrink-0" size={16} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : 'No date'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => task?.id ? setIsEditMode(false) : onClose()}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {task?.id ? 'Cancel' : 'Close'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Task
            </button>
          </div>
        </form>
      ) : (
        // View Mode
        <div className="space-y-6">
          {/* Title and Status */}
          <div>
            <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                task.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                task.status === 'done' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {task.status === 'todo' ? 'To Do' :
                 task.status === 'inProgress' ? 'In Progress' :
                 task.status === 'review' ? 'Review' :
                 task.status === 'done' ? 'Done' :
                 task.status === 'dispose' ? 'Dispose' : task.status}
              </span>
              <span className="text-sm text-gray-500">
                in milestone: <span className="font-medium">{getMilestoneName()}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{task.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h3>
              {task.assignee ? (
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-medium">
                      {task.assignee.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{task.assignee.name}</p>
                    <p className="text-xs text-gray-500">{task.assignee.role || 'Team Member'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">Not assigned</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
              {task.dueDate ? (
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <span>{format(new Date(task.dueDate), 'MMMM d, yyyy')}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">No due date</p>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Evidence of Work
              <span className="text-xs text-gray-500 ml-2">
                ({evidenceDocuments.length} {evidenceDocuments.length === 1 ? 'item' : 'items'})
              </span>
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : evidenceDocuments.length === 0 ? (
              <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No evidence attached</p>
              </div>
            ) : (
              <div className="space-y-2">
                {evidenceDocuments.map(doc => (
                  <div key={doc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {doc.type === 'file' ? (
                      <FileText className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                    ) : (
                      <ExternalLink className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{doc.name}</h4>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Added by {doc.uploadedBy} on {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : 'Unknown date'}
                        </span>
                        {doc.type === 'file' && doc.fileSize && (
                          <span>{Math.round(doc.fileSize / 1024)} KB</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {doc.type === 'file' && doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 inline-flex"
                          title="Download file"
                        >
                          <Download size={16} />
                        </a>
                      ) : doc.type === 'link' && doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 inline-flex"
                          title="Open link"
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm; 