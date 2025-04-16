import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, CheckCircle, Trash2, Edit, AlertCircle, 
  LayoutDashboard, Info, Clock, MessageSquare, 
  FileText, Upload, FolderOpen, Plus, Rocket 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';
import Comments from './Comments';

const ProjectDetailsPanel = ({ project, isOpen, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [projectProgress, setProjectProgress] = useState(project?.progress || 0);

  useEffect(() => {
    if (isOpen && project?.id) {
      calculateTaskBasedProgress(project.id);
    }
  }, [project?.id, isOpen]);

  // Calculate task-based progress
  const calculateTaskBasedProgress = async (projectId) => {
    try {
      // Get all tasks for the project
      const allProjectTasks = await firebaseDb.getProjectTasks(projectId);
      
      if (allProjectTasks.length === 0) {
        setProjectProgress(0);
        return;
      }
      
      // Calculate progress based on completed tasks
      const completedTasks = allProjectTasks.filter(task => task.status === 'done').length;
      const progressPercentage = Math.round((completedTasks / allProjectTasks.length) * 100);
      
      setProjectProgress(progressPercentage);
    } catch (error) {
      console.error('Error calculating task-based progress:', error);
      // Fallback to project progress if available
      setProjectProgress(project?.progress || 0);
    }
  };

  if (!isOpen || !project) return null;

  const formatDate = (dateValue) => {
    if (!dateValue) return '';

    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
      <div className="bg-white w-full max-w-4xl h-full overflow-auto animate-slide-left">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'overview' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info size={18} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'specifications' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={18} />
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'board' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard size={18} />
              Board
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'timeline' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={18} />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'files' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={18} />
              Files
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'activity' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={18} />
              Activity
            </button>
            <button
              onClick={() => setActiveTab('launchStrategy')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'launchStrategy' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Rocket size={18} />
              Launch Strategy
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-4 flex items-center gap-2 ${
                activeTab === 'comments' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={18} />
              Comments
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Project Overview</h3>
              <p className="text-gray-700">{project.description}</p>
              
              {/* Progress Card */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Progress</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        projectProgress >= 75 ? 'bg-green-500' : 
                        projectProgress >= 40 ? 'bg-blue-500' : 
                        'bg-orange-500'
                      }`}
                      style={{ width: `${projectProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{projectProgress}%</span>
                </div>
              </div>
              
              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'active' || project.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'onHold' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'inProgress' ? 'Active' : 
                     project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p>{project.startDate ? formatDate(project.startDate) : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p>{project.endDate ? formatDate(project.endDate) : 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Team Members */}
              <div>
                <h4 className="font-medium mb-3">Team Members</h4>
                <div className="space-y-3">
                  {project.team?.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 font-medium">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  {!project.team?.length && (
                    <p className="text-gray-500">No team members assigned</p>
                  )}
                </div>
              </div>
              
              {/* Project milestones */}
              <div>
                <h4 className="font-medium mb-3">Milestones</h4>
                <div className="space-y-3">
                  {project.milestones?.map((milestone, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <h5 className="font-medium">{milestone.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Overseer: {project.team?.find(m => m.id === milestone.overseer)?.name || 'Not assigned'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Due: {milestone.dueDate ? formatDate(milestone.dueDate) : 'No date set'}</p>
                    </div>
                  ))}
                  {!project.milestones?.length && (
                    <p className="text-gray-500">No milestones defined</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            // ... specifications content ...
          )}

          {activeTab === 'board' && (
            // ... board content ...
          )}

          {activeTab === 'timeline' && (
            // ... timeline content ...
          )}
          
          {activeTab === 'files' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Files</h3>
                <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1">
                  <Upload size={16} />
                  Upload File
                </button>
              </div>
              
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FolderOpen size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No files uploaded yet</p>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Activity Log</h3>
              
              <div className="space-y-4">
                {project.createdAt && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Plus size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">Project created</p>
                      <p className="text-xs text-gray-500">{formatDate(project.createdAt)}</p>
                    </div>
                  </div>
                )}
                
                {project.updatedAt && project.updatedAt !== project.createdAt && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Edit size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">Project updated</p>
                      <p className="text-xs text-gray-500">{formatDate(project.updatedAt)}</p>
                    </div>
                  </div>
                )}
                
                {(!project.createdAt && !project.updatedAt) && (
                  <div className="text-center py-8">
                    <Clock size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'launchStrategy' && (
            // ... launch strategy content ...
          )}

          {activeTab === 'comments' && (
            <Comments projectId={project.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPanel;