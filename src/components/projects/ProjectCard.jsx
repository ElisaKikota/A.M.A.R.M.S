import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, UserPlus, Crown } from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';
import { useFirebase } from '../../contexts/FirebaseContext';
import { firebaseDb } from '../../services/firebaseDb';

const ProjectCard = ({ project, onClick }) => {
  const { user } = useFirebase();
  const [progress, setProgress] = useState(0);
  
  // Check if current user is the project manager
  const isProjectManager = project.projectManager === user?.uid;
  
  useEffect(() => {
    const loadTasksAndCalculateProgress = async () => {
      try {
        const tasks = await firebaseDb.getProjectTasks(project.id);
        
        if (!tasks || tasks.length === 0) {
          setProgress(0);
          return;
        }

        const nonTrashTasks = tasks.filter(task => task.status !== 'trash');
        if (nonTrashTasks.length === 0) {
          setProgress(0);
          return;
        }

        const completedTasks = nonTrashTasks.filter(task => task.status === 'done').length;
        const percentage = Math.round((completedTasks / nonTrashTasks.length) * 100);
        setProgress(percentage);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setProgress(0);
      }
    };

    loadTasksAndCalculateProgress();
  }, [project.id]);

  // Helper function to safely parse dates
  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  // Determine due date status
  const getDueDateStatus = () => {
    if (!project.endDate) return 'default';
    
    const dueDate = parseDate(project.endDate);
    if (!dueDate) return 'default';
    
    const today = new Date();
    const daysLeft = differenceInDays(dueDate, today);
    
    if (isAfter(today, dueDate)) return 'overdue';
    if (daysLeft <= 7) return 'near';
    return 'ontrack';
  };

  // Format date with color based on status
  const formatDueDate = () => {
    if (!project.endDate) return 'No due date';
    
    const dueDate = parseDate(project.endDate);
    if (!dueDate) return 'Invalid date';
    
    const status = getDueDateStatus();
    const dateStr = format(dueDate, 'MMM d, yyyy');
    
    let colorClass = 'text-gray-700';
    if (status === 'overdue') colorClass = 'text-red-600 font-medium';
    else if (status === 'near') colorClass = 'text-orange-500';
    else if (status === 'ontrack') colorClass = 'text-green-600';
    
    return <span className={colorClass}>{dateStr}</span>;
  };

  // Get project manager
  const projectManager = project.projectManager 
    ? project.team?.find(member => member.id === project.projectManager) 
    : project.team?.[0];

  // Get manager initials
  const getManagerInitials = () => {
    if (!projectManager?.name) return '';
    return projectManager.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get manager name
  const getManagerName = () => {
    return projectManager?.name || 'Not assigned';
  };

  // Format last updated date
  const formatLastUpdated = () => {
    if (!project.updatedAt) return null;
    
    const date = parseDate(project.updatedAt);
    if (!date) return null;
    
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div 
      className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          {isProjectManager ? (
            <span title="You are the project manager" className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <Crown size={12} className="mr-1" />
              Manager
            </span>
          ) : (
            <span title="You are a member of this project" className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <UserPlus size={12} className="mr-1" />
              Member
            </span>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.status === 'completed' ? 'bg-green-100 text-green-800' :
          project.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
          project.status === 'onHold' ? 'bg-orange-100 text-orange-800' :
          project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
          project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {project.status === 'inProgress' ? 'In Progress' : 
           project.status === 'onHold' ? 'On Hold' :
           project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
        </span>
      </div>
      
      {/* Project Manager */}
      {projectManager && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
            {getManagerInitials()}
          </div>
          <div>
            <p className="text-sm font-medium">{getManagerName()}</p>
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
            <span>{formatLastUpdated()}</span>
          </div>
        )}
      </div>
      
      {project.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;