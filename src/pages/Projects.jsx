import React, { useState, useEffect } from 'react';
import { Plus, Filter, User, UserPlus, Users, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import { useFirebase } from '../contexts/FirebaseContext';
import { useProjectStore } from '../stores/projectsSlice';
import { firebaseDb } from '../services/firebaseDb';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/ui/LoadingOverlay';

const Projects = () => {
  const { user } = useFirebase();
  const { hasPermission, userRole } = useAuth();
  const projects = useProjectStore(state => state.projects);
  const setProjects = useProjectStore(state => state.setProjects);
  const addProject = useProjectStore(state => state.addProject);
  const updateProject = useProjectStore(state => state.updateProject);
  const deleteProject = useProjectStore(state => state.deleteProject);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownershipFilter, setOwnershipFilter] = useState('all');

  // Check if user can create projects
  const canCreateProject = hasPermission('projects.create');
  
  // Check if user is admin or supervisor
  const isAdminOrSupervisor = userRole === 'admin' || userRole === 'supervisor';
  
  // Ownership options for the filter
  const ownershipOptions =
    userRole === 'client'
      ? [
          { value: 'client', label: 'My Projects', icon: Building2 }
        ]
      : [
          { value: 'all', label: 'All Projects', icon: Users },
          { value: 'owned', label: 'Managing', icon: User },
          { value: 'member', label: 'Shared With Me', icon: UserPlus },
          ...(userRole === 'client' ? [{ value: 'client', label: 'My Projects', icon: Building2 }] : [])
        ];

  // Set default ownership filter for client
  useEffect(() => {
    if (userRole === 'client') {
      setOwnershipFilter('client');
    }
  }, [userRole]);

  // Convert projects object to array and filter by status and ownership
  const projectsArray = Object.values(projects).filter(project => {
    // Status filter
    const statusMatch = statusFilter === 'all' ? true : project.status === statusFilter;
    
    // Ownership filter
    let ownershipMatch = true;
    if (ownershipFilter !== 'all') {
      if (ownershipFilter === 'owned') {
        // "Managing" filter - show projects where user is the project manager
        ownershipMatch = project.projectManager === user?.uid;
      } else if (ownershipFilter === 'member') {
        // "Shared with Me" filter - show projects where user is a team member but NOT the project manager
        ownershipMatch = project.projectManager !== user?.uid && 
                         project.team && 
                         project.team.some(member => member.id === user?.uid);
      } else if (ownershipFilter === 'client') {
        // "My Projects" filter - show projects assigned to the client
        ownershipMatch = Array.isArray(project.clientIds) && project.clientIds.includes(user?.uid);
      }
    }
    
    return statusMatch && ownershipMatch;
  });

  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'onHold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use different loading method based on user role
        let projectsData;
        if (isAdminOrSupervisor) {
          // Admin and supervisor users can see all projects
          projectsData = await firebaseDb.getAllProjects();
        } else if (userRole === 'client') {
          // Client users only see their assigned projects
          projectsData = await firebaseDb.getClientProjects(user.uid);
        } else {
          // Regular users only see their own projects and those they're members of
          projectsData = await firebaseDb.getAllUserProjects(user.uid);
        }
        
        if (isMounted) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        if (isMounted) {
          setError('Failed to load projects. Please try again.');
          toast.error('Failed to load projects');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [user, setProjects, isAdminOrSupervisor, userRole]);

  // Handle loading state
  if (loading) {
    return <LoadingOverlay isLoading={loading} message="Loading projects..." />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (selectedProject) {
        await firebaseDb.updateProject(selectedProject.id, projectData);
        updateProject(selectedProject.id, projectData);
        toast.success('Project updated successfully');
      } else {
        const newProject = await firebaseDb.createProject({
          ...projectData,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        addProject(newProject);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await firebaseDb.deleteProject(selectedProject.id);
      deleteProject(selectedProject.id);
      toast.success('Project deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        {canCreateProject && (
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
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ownership Filter */}
        <div className="flex items-center gap-4">
          {ownershipOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setOwnershipFilter(option.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                ownershipFilter === option.value 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={userRole === 'client' && option.value !== 'client'}
            >
              <option.icon size={16} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsArray.length > 0 ? (
          projectsArray.map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="cursor-pointer"
            >
              <ProjectCard project={project} />
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 flex flex-col items-center justify-center text-gray-500">
            <Users size={48} className="mb-4 text-gray-300" />
            <p className="text-lg">No projects found</p>
            <p className="text-sm">Try changing your filters or create a new project</p>
          </div>
        )}
      </div>

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSave={handleSaveProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setIsModalOpen(true);
        }}
        onDelete={() => {
          setIsDetailsModalOpen(false);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteProject}
        projectName={selectedProject?.name}
      />
    </div>
  );
};

export default Projects;