import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  Info, 
  CheckSquare, 
  LayoutGrid, 
  FileText, 
  Upload, 
  Edit, 
  FolderOpen, 
  Checkbox
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseDb } from '../services/firebaseDb';
import ProjectModal from '../components/projects/ProjectModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import { format, isAfter, differenceInDays } from 'date-fns';

// Enhanced ProjectCard component with all the required details
const ProjectCard = ({ project, onClick }) => {
  // Calculate progress based on completed milestones
  const calculateProgress = () => {
    const totalMilestones = project.milestones?.length || 0;
    if (totalMilestones === 0) return 0;
    
    const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  // Determine due date status
  const getDueDateStatus = () => {
    if (!project.endDate) return 'default';
    
    const dueDate = new Date(project.endDate);
    const today = new Date();
    const daysLeft = differenceInDays(dueDate, today);
    
    if (isAfter(today, dueDate)) return 'overdue';
    if (daysLeft <= 7) return 'near';
    return 'ontrack';
  };

  // Format date with color based on status
  const formatDueDate = () => {
    if (!project.endDate) return 'No due date';
    
    const status = getDueDateStatus();
    const dateStr = format(new Date(project.endDate), 'MMM d, yyyy');
    
    let colorClass = 'text-gray-700';
    if (status === 'overdue') colorClass = 'text-red-600 font-medium';
    else if (status === 'near') colorClass = 'text-orange-500';
    else if (status === 'ontrack') colorClass = 'text-green-600';
    
    return <span className={colorClass}>{dateStr}</span>;
  };

  // Get project manager
  const projectManager = project.team?.find(member => member.role === 'manager') || project.team?.[0];

  // Calculate tasks completed
  const tasksCompleted = project.tasks?.filter(task => task.status === 'completed').length || 0;
  const totalTasks = project.tasks?.length || 0;

  const progress = calculateProgress();

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.status === 'completed' ? 'bg-green-100 text-green-800' :
          project.status === 'active' ? 'bg-blue-100 text-blue-800' :
          project.status === 'onHold' ? 'bg-orange-100 text-orange-800' :
          project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {project.status === 'inProgress' ? 'Active' : 
           project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
        </span>
      </div>
      
      {/* Project Manager */}
      {projectManager && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
            {projectManager.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{projectManager.name}</p>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              progress >= 75 ? 'bg-green-500' : 
              progress >= 40 ? 'bg-blue-500' : 
              'bg-orange-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Project Details */}
      <div className="space-y-2 text-sm">
        {/* Due Date */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-gray-600">Due:</span>
          {formatDueDate()}
        </div>
        
        {/* Tasks */}
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-gray-500" />
          <span className="text-gray-600">Tasks:</span>
          <span>{tasksCompleted}/{totalTasks}</span>
        </div>
        
        {/* Team Members */}
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <span className="text-gray-600">Team:</span>
          <div className="flex -space-x-2">
            {project.team?.slice(0, 3).map((member, index) => (
              <div 
                key={index} 
                className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center border border-white"
                title={member.name}
              >
                <span className="text-xs text-blue-700 font-medium">{member.name.charAt(0)}</span>
              </div>
            ))}
            {project.team?.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-white">
                <span className="text-xs text-gray-600 font-medium">+{project.team.length - 3}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Last Updated */}
        {project.updatedAt && (
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span className="text-gray-600">Updated:</span>
            <span>{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
      
      {/* Description preview */}
      {project.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        </div>
      )}
    </div>
  );
};

const Projects = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const projectsData = await firebaseDb.getProjects(user.uid);
        
        // Enhance projects with task data
        const enhancedProjects = await Promise.all(projectsData.map(async (project) => {
          try {
            // Get project tasks
            const tasks = await firebaseDb.getProjectTasks(project.id);
            return { ...project, tasks };
          } catch (err) {
            console.error(`Error fetching tasks for project ${project.id}:`, err);
            return { ...project, tasks: [] };
          }
        }));
        
        setProjects(enhancedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('Failed to load projects. Please try again.');
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsDetailsPanelOpen(true);
    setActiveTab('overview');
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (selectedProject) {
        await firebaseDb.updateProject(selectedProject.id, projectData);
        setProjects(prev => prev.map(p => 
          p.id === selectedProject.id ? { ...p, ...projectData } : p
        ));
        toast.success('Project updated successfully');
      } else {
        const newProject = await firebaseDb.createProject({
          ...projectData,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          status: projectData.status || 'active',
          tasks: []
        });
        setProjects(prev => [...prev, newProject]);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await firebaseDb.deleteProject(selectedProject.id);
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      toast.success('Project deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };
  
  // Filter projects based on search term and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      project.status === filter ||
      (filter === 'active' && project.status === 'inProgress');
    
    return matchesSearch && matchesFilter;
  });

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button 
          onClick={() => {
            setSelectedProject(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Projects</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="onHold">On Hold</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No projects found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter' 
              : 'Create your first project to get started'}
          </p>
        </div>
      )}

      {/* Project Modal - for creating/editing */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSave={handleSaveProject}
        onDelete={() => {
          setIsModalOpen(false);
          setIsDeleteModalOpen(true);
        }}
      />
      
      {/* Project Details Panel */}
      {isDetailsPanelOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
          <div className="bg-white w-full max-w-4xl h-full overflow-auto animate-slide-left">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 border-b">
              <div className="flex justify-between items-center px-6 py-4">
                <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                <button 
                  onClick={() => setIsDetailsPanelOpen(false)}
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
                  onClick={() => setActiveTab('tasks')}
                  className={`py-3 px-4 flex items-center gap-2 ${
                    activeTab === 'tasks' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckSquare size={18} />
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('board')}
                  className={`py-3 px-4 flex items-center gap-2 ${
                    activeTab === 'board' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid size={18} />
                  Board
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
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Project Overview</h3>
                  <p className="text-gray-700">{selectedProject.description}</p>
                  
                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Status</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedProject.status === 'active' || selectedProject.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                        selectedProject.status === 'onHold' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedProject.status === 'inProgress' ? 'Active' : 
                         selectedProject.status?.charAt(0).toUpperCase() + selectedProject.status?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p>{selectedProject.startDate ? format(new Date(selectedProject.startDate), 'MMM d, yyyy') : 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p>{selectedProject.endDate ? format(new Date(selectedProject.endDate), 'MMM d, yyyy') : 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div>
                    <h4 className="font-medium mb-3">Team Members</h4>
                    <div className="space-y-3">
                      {selectedProject.team?.map((member, index) => (
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
                      {!selectedProject.team?.length && (
                        <p className="text-gray-500">No team members assigned</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Project milestones */}
                  <div>
                    <h4 className="font-medium mb-3">Milestones</h4>
                    <div className="space-y-3">
                      {selectedProject.milestones?.map((milestone, index) => (
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
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-sm text-gray-500 mt-2">Due: {milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM d, yyyy') : 'No date set'}</p>
                        </div>
                      ))}
                      {!selectedProject.milestones?.length && (
                        <p className="text-gray-500">No milestones defined</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Tasks</h3>
                    <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1">
                      <Plus size={16} />
                      Add Task
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedProject.tasks?.map((task, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <Checkbox
                              checked={task.status === 'completed'}
                              className="mt-1"
                            />
                            <div>
                              <h5 className="font-medium">{task.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              {task.dueDate && (
                                <p className="text-xs text-gray-500 mt-2">Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!selectedProject.tasks || selectedProject.tasks.length === 0) && (
                      <div className="text-center py-8">
                        <CheckSquare size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No tasks yet</p>
                        <button className="mt-2 text-blue-600 hover:text-blue-800">Add your first task</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'board' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Kanban Board</h3>
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <LayoutGrid size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Kanban board view is coming soon</p>
                  </div>
                </div>
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
                    {selectedProject.createdAt && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Plus size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm">Project created</p>
                          <p className="text-xs text-gray-500">{format(new Date(selectedProject.createdAt), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedProject.updatedAt && selectedProject.updatedAt !== selectedProject.createdAt && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Edit size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm">Project updated</p>
                          <p className="text-xs text-gray-500">{format(new Date(selectedProject.updatedAt), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                      </div>
                    )}
                    
                    {(!selectedProject.createdAt && !selectedProject.updatedAt) && (
                      <div className="text-center py-8">
                        <Clock size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No activity recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteConfirm}
        projectName={selectedProject?.name}
      />
    </div>
  );
};

export default Projects;