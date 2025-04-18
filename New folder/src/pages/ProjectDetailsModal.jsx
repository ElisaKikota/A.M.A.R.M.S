import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, CheckCircle, Trash2, Edit,  
  LayoutDashboard, Info, Clock, MessageSquare,
  FileText, Link2, Upload, Flag, CheckSquare,
  LayoutGrid, File, Activity, Rocket, Presentation
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/board/KanbanBoard';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseDb } from '../services/firebaseDb';

import LoadingOverlay from '../components/ui/LoadingOverlay';
import ProjectSpecifications from '../components/projects/ProjectSpecifications';
import ProjectOverview from '../components/projects/ProjectOverview';
import LaunchStrategy from '../components/projects/LaunchStrategy';
import TimelineView from '../components/timeline/TimelineView';
import DocumentItem from '../components/files/DocumentItem';
import Comments from '../pages/Comments';
import Presentable from '../components/files/Presentable';

// Safe function to format activity timestamps that handles invalid dates
const formatActivityDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  
  try {
    // Handle Firebase Timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'MMM d, yyyy h:mm a');
    }
    
    // Handle ISO strings and other date formats
    const date = new Date(timestamp);
    
    // Check if date is valid before formatting
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors text-sm ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent hover:border-gray-300'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

// File Upload Modal Component
const FileUploadModal = ({ isOpen, onClose, projectId, onFileUploaded }) => {
  const { user } = useFirebase();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Clear state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileName('');
      setDescription('');
      setIsUploading(false);
      setUploadError(null);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploadError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    if (!fileName.trim()) {
      setUploadError('Please enter a file name');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Get user's full name from Firebase Auth or Firestore
      let uploaderName = '';
      
      // First try to get from Firebase Auth displayName
      if (user.displayName) {
        uploaderName = user.displayName;
      } 
      // If not available, try to get from Firestore user document
      else {
        try {
          const userDoc = await firebaseDb.getUserById(user.uid);
          if (userDoc && (userDoc.name || userDoc.fullName)) {
            uploaderName = userDoc.name || userDoc.fullName;
          } else {
            // Last resort: use first part of email (before @)
            uploaderName = user.email.split('@')[0];
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          uploaderName = user.email.split('@')[0];
        }
      }
      
      const documentData = {
        name: fileName,
        description: description,
        uploadedBy: uploaderName,
        uploadedById: user.uid,
      };
      
      const result = await firebaseDb.addProjectDocument(projectId, documentData, file);
      
      toast.success('File uploaded successfully');
      onFileUploaded(result);
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload File">
      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{uploadError}</span>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            File (Max 5MB)
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={isUploading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fileName">
            File Name
          </label>
          <input
            type="text"
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={isUploading}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            disabled={isUploading}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Upload File'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Link Modal Component
const LinkModal = ({ isOpen, onClose, projectId, onLinkAdded }) => {
  const { user } = useFirebase();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Clear state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setUrl('');
      setDescription('');
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name.trim()) {
      setError('Please enter a name for the link');
      return;
    }
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    // Ensure URL has http:// or https:// prefix
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get user's full name from Firebase Auth or Firestore
      let uploaderName = '';
      
      // First try to get from Firebase Auth displayName
      if (user.displayName) {
        uploaderName = user.displayName;
      } 
      // If not available, try to get from Firestore user document
      else {
        try {
          const userDoc = await firebaseDb.getUserById(user.uid);
          if (userDoc && (userDoc.name || userDoc.fullName)) {
            uploaderName = userDoc.name || userDoc.fullName;
          } else {
            // Last resort: use first part of email (before @)
            uploaderName = user.email.split('@')[0];
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          uploaderName = user.email.split('@')[0];
        }
      }
      
      const linkData = {
        name: name.trim(),
        description: description.trim(),
        url: formattedUrl,
        uploadedBy: uploaderName,
        uploadedById: user.uid,
      };
      
      const result = await firebaseDb.addProjectDocument(projectId, linkData);
      
      toast.success('Link added successfully');
      onLinkAdded(result);
      onClose();
    } catch (error) {
      console.error('Error adding link:', error);
      setError(error.message || 'Failed to add link');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Link">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Link Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
            URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com"
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            If you don't include http:// or https://, https:// will be added automatically.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkDescription">
            Description (Optional)
          </label>
          <textarea
            id="linkDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Link'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Helper functions for activity display
const getActivityIcon = (type) => {
  switch (type) {
    case 'task_created':
    case 'task_updated':
    case 'task_deleted':
    case 'task_status_changed':
      return <LayoutDashboard size={16} className="text-blue-500" />;
    case 'milestone_created':
    case 'milestone_updated':
    case 'milestone_deleted':
    case 'milestone_completed':
      return <Flag size={16} className="text-green-500" />;
    case 'file_uploaded':
    case 'document_deleted':
      return <FileText size={16} className="text-purple-500" />;
    case 'link_added':
      return <Link2 size={16} className="text-indigo-500" />;
    case 'evidence_added':
    case 'evidence_removed':
      return <CheckSquare size={16} className="text-orange-500" />;
    case 'comment':
      return <MessageSquare size={16} className="text-yellow-500" />;
    case 'status':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'tasks_cleared':
      return <Trash2 size={16} className="text-red-500" />;
    default:
      return <Clock size={16} className="text-gray-500" />;
  }
};

const getActivityIconBackground = (type) => {
  switch (type) {
    case 'task_created':
    case 'task_updated':
    case 'task_deleted':
    case 'task_status_changed':
      return 'bg-blue-100';
    case 'milestone_created':
    case 'milestone_updated':
    case 'milestone_deleted':
    case 'milestone_completed':
      return 'bg-green-100';
    case 'file_uploaded':
    case 'document_deleted':
      return 'bg-purple-100';
    case 'link_added':
      return 'bg-indigo-100';
    case 'evidence_added':
    case 'evidence_removed':
      return 'bg-orange-100';
    case 'comment':
      return 'bg-yellow-100';
    case 'status':
      return 'bg-green-100';
    case 'tasks_cleared':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

const ProjectDetailsModal = ({ project: initialProject, isOpen, onClose, onEdit, onDelete }) => {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [team, setTeam] = useState([]);

  // Load project data including milestones
  const loadProjectData = useCallback(async () => {
    if (!isOpen || !initialProject?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Load project details
      const projectData = await firebaseDb.getProject(initialProject.id);
      setProject(projectData);
      
      // Load project milestones
      const milestonesData = await firebaseDb.getProjectMilestones(initialProject.id);
      setMilestones(milestonesData);
      
      // Load project tasks
      const tasksData = await firebaseDb.getProjectTasks(initialProject.id);
      setTasks(tasksData);
      
      // Load project documents
      const documentsData = await firebaseDb.getProjectDocuments(initialProject.id);
      setDocuments(documentsData);
      
      // Update project with documents
      setProject(prevProject => ({
        ...prevProject,
        documents: documentsData
      }));
      
      // Load project activities
      const activitiesData = await firebaseDb.getProjectActivities(initialProject.id);
      setActivities(activitiesData);

      // Load team members
      const teamData = await firebaseDb.getProjectTeam(initialProject.id);
      setTeam(teamData);
    } catch (error) {
      console.error('Error loading project data:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [isOpen, initialProject?.id]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // Handler for milestone updates
  const handleMilestoneUpdate = useCallback(async () => {
    try {
      const milestonesData = await firebaseDb.getProjectMilestones(project.id);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error updating milestones:', error);
      toast.error('Failed to update milestones');
    }
  }, [project?.id]);

  // Add tabConfig definition
  const tabConfig = {
    requirements: {
      title: 'Project Requirements',
      icon: '📋',
      sections: {
        functional: 'Functional Requirements',
        nonFunctional: 'Non-Functional Requirements',
        businessRules: 'Business Rules',
        userStories: 'User Stories'
      }
    },
    technical: {
      title: 'Technical Specifications',
      icon: '⚙️',
      sections: {
        stack: 'Technology Stack',
        architecture: 'Architecture Overview',
        integration: 'Integration Points',
        infrastructure: 'Infrastructure Requirements'
      }
    },
    scope: {
      title: 'Scope Definition',
      icon: '🎯',
      sections: {
        boundaries: 'Project Boundaries',
        deliverables: 'Deliverables',
        constraints: 'Constraints',
        dependencies: 'Dependencies'
      }
    },
    success: {
      title: 'Success Criteria',
      icon: '🎉',
      sections: {
        metrics: 'Success Metrics',
        kpis: 'Key Performance Indicators',
        acceptance: 'Acceptance Criteria',
        validation: 'Validation Methods'
      }
    },
    launch: {
      title: 'Launch Strategy',
      icon: '🚀',
      sections: {
        market: 'Market Launch',
        advertising: 'Advertising & Promotion',
        deployment: 'Deployment & Release'
      }
    }
  };

  const handleUpdateSpecifications = async (updatedSpecs, changeDetails) => {
    try {
      // Update project in Firestore
      await firebaseDb.updateProject(project.id, {
        specifications: updatedSpecs
      });

      // Update local state
      setProject({
        ...project,
        specifications: updatedSpecs
      });

      // Create a descriptive message based on the type of change
      let description;
      const sectionTitle = tabConfig[changeDetails.section].sections[changeDetails.subsection];

      switch (changeDetails.type) {
        case 'add':
          description = `Added new specification "${changeDetails.item.title}" to ${sectionTitle}`;
          break;
        case 'edit':
          description = `Updated specification "${changeDetails.newItem.title}" in ${sectionTitle}`;
          if (changeDetails.oldItem.title !== changeDetails.newItem.title) {
            description += ` (previously "${changeDetails.oldItem.title}")`;
          }
          break;
        case 'delete':
          description = `Deleted specification "${changeDetails.item.title}" from ${sectionTitle}`;
          break;
        case 'attach_files':
          const oldFileCount = changeDetails.oldItem.evidence?.length || 0;
          const newFileCount = changeDetails.newItem.evidence?.length || 0;
          const addedCount = newFileCount - oldFileCount;
          description = `${addedCount > 0 ? 'Added' : 'Removed'} ${Math.abs(addedCount)} ${Math.abs(addedCount) === 1 ? 'file' : 'files'} to specification "${changeDetails.newItem.title}" in ${sectionTitle}`;
          break;
        default:
          description = 'Updated project specifications';
      }

      // Add activity with detailed information
      await addActivity({
        type: `specifications_${changeDetails.type}`,
        description,
        details: {
          section: changeDetails.section,
          subsection: changeDetails.subsection,
          changeType: changeDetails.type,
          ...(changeDetails.type === 'edit' && {
            oldTitle: changeDetails.oldItem.title,
            newTitle: changeDetails.newItem.title
          })
        }
      });

      // Show success message
      switch (changeDetails.type) {
        case 'add':
          toast.success('New specification added successfully');
          break;
        case 'edit':
          toast.success('Specification updated successfully');
          break;
        case 'delete':
          toast.success('Specification deleted successfully');
          break;
        case 'attach_files':
          toast.success('Files linked successfully');
          break;
        default:
          toast.success('Specifications updated successfully');
      }
    } catch (error) {
      console.error('Error updating specifications:', error);
      toast.error('Failed to update specifications');
    }
  };

  const handleUpdateLaunchStrategy = async (updatedStrategy) => {
    try {
      const updatedProject = {
        ...project,
        launchStrategy: updatedStrategy
      };
      setProject(updatedProject);
      
      // Update project in Firebase
      await firebaseDb.updateProject(project.id, updatedProject);

      // Log activity for launch strategy updates
      let activityMessage = 'Updated launch strategy';
      
      // Add more specific details if it's a social media update
      if (updatedStrategy.socialMedia) {
        const { posts } = updatedStrategy.socialMedia;
        if (posts) {
          const platforms = [...new Set(posts.map(post => post.platform))];
          activityMessage = `Updated social media content for ${platforms.join(', ')}`;
        }
      }
      
      // Add activity using the existing addActivity function
      await addActivity({
        type: 'launch_strategy_updated',
        description: activityMessage
      });

      toast.success('Launch strategy updated successfully');
    } catch (error) {
      console.error('Error updating launch strategy:', error);
      toast.error('Failed to update launch strategy');
    }
  };

  if (!isOpen) return null;
  
  if (loading) {
    return <LoadingOverlay isLoading={loading} message="Loading project data..." />;
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-red-600">Error</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                loadProjectData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return null;
  }

  // Legacy milestone-based progress calculation (keeping for reference)
  
  




  const addActivity = async (activity) => {
    try {
      const activityData = {
        ...activity,
        timestamp: new Date().toISOString(),
        user: {
          id: user?.uid || 'unknown',
          name: user?.displayName || user?.email || 'Unknown User'
        }
      };
      
      await firebaseDb.addProjectActivity(project.id, activityData);
      
      // Update activities list
      setActivities(prev => [activityData, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    try {
      let selectedFiles;
      
      // Handle both direct file input changes and modal callbacks
      if (e?.target?.files) {
        // Direct file input change
        selectedFiles = e.target.files;
        
        if (!selectedFiles || selectedFiles.length === 0) {
          toast.error('No files selected');
          return;
        }

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
          }

          const documentData = {
            name: file.name,
            description: '',
            uploadedBy: user?.displayName || user?.email || 'Unknown User',
            uploadedById: user?.uid || 'unknown',
          };
          
          const result = await firebaseDb.addProjectDocument(project.id, documentData, file);
          
          // Update the documents list
          setDocuments(prev => [result, ...prev]);
          
          // Add activity
          await addActivity({
            type: 'file_uploaded',
            description: `Added file: ${file.name}`,
            documentId: result.id
          });
          
          // Show success message
          toast.success(`File "${file.name}" uploaded successfully`);
        }
      } else if (e) {
        // Modal callback with link or single file
        // This part handles a link added through the modal or a single file
        if (e.type === 'link') {
          // Update the documents list
          setDocuments(prev => [e, ...prev]);
          
          // Add activity
          await addActivity({
            type: 'link_added',
            description: `Added link: ${e.name}`,
            documentId: e.id
          });
          
          // Show success message
          toast.success(`Link "${e.name}" added successfully`);
        } else {
          // Single file from modal
          setDocuments(prev => [e, ...prev]);
          
          // Add activity
          await addActivity({
            type: 'file_uploaded',
            description: `Added file: ${e.name}`,
            documentId: e.id
          });
          
          // Show success message
          toast.success(`File "${e.name}" uploaded successfully`);
        }
      } else {
        toast.error('No valid file or link data provided');
        return;
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to process files');
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      // Get the document before deleting it
      const documentToDelete = documents.find(doc => doc.id === documentId);
      
      if (!documentToDelete) {
        toast.error('Document not found');
        return;
      }
      
      await firebaseDb.deleteProjectDocument(project.id, documentId);
      
      // Update the documents list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Add activity
      await addActivity({
        type: 'document_deleted',
        description: `Deleted file: ${documentToDelete.name}`,
        documentName: documentToDelete.name
      });
      
      // Show success message
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'specifications', label: 'Specifications', icon: FileText },
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'files', label: 'Files', icon: File },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'launch-strategy', label: 'Launch Strategy', icon: Rocket },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'presentable', label: 'Presentables', icon: Presentation }
  ];

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{project.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-sm ${
                project.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 mt-1 text-sm">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {project.status !== 'completed' && (
              <button
                onClick={async () => {
                  try {
                    await firebaseDb.updateProjectStatus(project.id, 'completed');
                    addActivity({
                      type: 'status',
                      description: 'Marked project as completed'
                    });
                    toast.success('Project marked as completed');
                  } catch (error) {
                    console.error('Error updating project status:', error);
                    toast.error('Failed to update project status');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle size={16} />
                Mark as Completed
              </button>
            )}
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
              title="Edit Project"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
              title="Delete Project"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <div className="flex gap-2 px-4">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <ProjectOverview 
                  project={project}
                  tasks={tasks}
                  team={team}
                  milestones={milestones}
                />
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-4">
                  <ProjectSpecifications
                    project={project}
                    onUpdate={handleUpdateSpecifications}
                    tabConfig={tabConfig}
                  />
                </div>
              )}

              {activeTab === 'board' && (
                <div className="h-full">
                  <KanbanBoard
                    projectId={project.id}
                    currentUser={user}
                    onMilestoneUpdate={handleMilestoneUpdate}
                  />
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <TimelineView
                    project={project}
                    milestones={milestones}
                    onUpdate={handleMilestoneUpdate}
                  />
                </div>
              )}

              {activeTab === 'files' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Project Files</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{documents.length} files</span>
                        {documents.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{Math.round(documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0) / 1024)} KB total</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        <Link2 size={14} />
                        Add Link
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <Upload size={14} />
                        Upload Files
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    {documents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
                        <FileText size={32} className="text-gray-300 mb-1" />
                        <p className="text-gray-500 text-sm">No files uploaded yet</p>
                        <p className="text-gray-400 text-xs mt-1">Upload files or add links to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {documents.map((doc) => (
                          <DocumentItem
                            key={doc.id}
                            document={doc}
                            onDelete={() => handleDeleteDocument(doc.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Activity Timeline</h3>
                  
                  {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
                      <Clock size={48} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">No activity recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div key={activity.id || index} className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${getActivityIconBackground(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {formatActivityDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'launch-strategy' && (
                <LaunchStrategy
                  project={project}
                  onUpdate={handleUpdateLaunchStrategy}
                />
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <Comments projectId={project.id} />
                </div>
              )}

              {activeTab === 'presentable' && (
                <div className="space-y-4">
                  <Presentable projectId={project.id} documents={documents} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
        projectId={project?.id}
        onFileUploaded={(result) => handleFileUpload(result)}
      />
      
      {/* Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        projectId={project?.id}
        onLinkAdded={(result) => handleFileUpload(result)}
      />
    </div>
  );

  // Use ReactDOM.createPortal to render the modal at the root level of the DOM
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default ProjectDetailsModal;