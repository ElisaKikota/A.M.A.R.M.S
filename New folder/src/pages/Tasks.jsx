import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Filter, Search, Briefcase, File, Flag, Paperclip, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseDb } from '../services/firebaseDb';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useActivityLog } from '../contexts/ActivityLogContext';

// Mapping of file extensions to icons and styles
const getFileIcon = (fileName) => {
  if (!fileName) return <File size={12} />;
  
  const ext = fileName.split('.').pop().toLowerCase();
  
  // Return appropriate icon based on file extension
  switch (ext) {
    case 'pdf':
      return <File size={12} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <Paperclip size={12} />;
    default:
      return <LinkIcon size={12} />;
  }
};

// Helper to get short file name
const getShortFileName = (fileName) => {
  if (!fileName) return "Attachment";
  
  if (fileName.length <= 15) return fileName;
  
  const ext = fileName.split('.').pop();
  const name = fileName.substring(0, fileName.lastIndexOf('.'));
  
  return `${name.substring(0, 10)}...${ext}`;
};

const TaskCard = ({ task, onStatusChange }) => {

  // Format date with color based on status
  const formatDueDate = () => {
    if (!task.dueDate) return 'No due date';
    const date = new Date(task.dueDate);
    const today = new Date();
    const isOverdue = date < today && task.status !== 'done';
    return (
      <span className={isOverdue ? 'text-red-600' : 'text-gray-600'}>
        {format(date, 'MMM d, yyyy')}
        {isOverdue && ' (Overdue)'}
      </span>
    );
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'dispose':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status label
  const formatStatus = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'inProgress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      case 'dispose':
        return 'Dispose';
      default:
        return status;
    }
  };

  // State for evidence files
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  
  // Fetch evidence information when task changes
  useEffect(() => {
    const fetchEvidence = async () => {
      if (task.evidence && task.evidence.length > 0 && task.projectId) {
        try {
          const files = await firebaseDb.getTaskEvidence(task.projectId, task.id);
          setEvidenceFiles(files);
        } catch (error) {
          console.error('Error fetching evidence:', error);
          setEvidenceFiles([]);
        }
      } else {
        setEvidenceFiles([]);
      }
    };
    
    fetchEvidence();
  }, [task]);

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-medium">{task.title}</h3>
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {formatStatus(task.status)}
        </span>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <Briefcase size={14} className="mr-1" />
        <Link to={`/projects/${task.projectId}`} className="text-blue-600 hover:underline">
          {task.projectName}
        </Link>
      </div>

      {/* Improved milestone display with better fallback handling */}
      {task.milestoneId && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Flag size={14} className="mr-1 text-gray-400" />
          <span className="flex items-center gap-1">
            <span className="text-gray-600">Milestone:</span>
            <span className="text-blue-600">
              {task.milestoneName || task.milestoneName === '' ? task.milestoneName : 'Unknown'}
            </span>
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center">
          <Calendar size={14} className="mr-1 text-gray-400" />
          {formatDueDate()}
        </div>
        
        <div className="flex items-center">
          <Clock size={14} className="mr-1 text-gray-400" />
          <span>{task.createdAt ? format(new Date(task.createdAt), 'MMM d') : 'Unknown'}</span>
        </div>
      </div>
      
      {(task.priority === 'high' || (task.evidenceFiles && task.evidenceFiles.length > 0)) && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            {task.priority === 'high' && (
              <span className="flex items-center text-xs text-red-600">
                <AlertCircle size={14} className="mr-1" />
                High Priority
              </span>
            )}
            
            {task.evidenceFiles && task.evidenceFiles.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 font-medium">Attached Files:</span>
                <div className="flex flex-wrap gap-1">
                  {task.evidenceFiles.map((file, index) => (
                    <span key={index} className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs">
                      <File size={12} />
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attachments section */}
      {task.evidence && task.evidence.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Paperclip size={14} className="mr-1" />
            <span>Attachments ({evidenceFiles.length || task.evidence.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {evidenceFiles.length > 0 ? (
              evidenceFiles.map((file) => (
                <a 
                  key={file.id} 
                  href={file.fileUrl || file.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-600 flex items-center hover:bg-gray-200"
                >
                  <span className="mr-1">{getFileIcon(file.fileName)}</span>
                  <span>{getShortFileName(file.fileName || file.name)}</span>
                </a>
              ))
            ) : (
              task.evidence.map((evidenceId, index) => (
                <div key={evidenceId} className="bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-600">
                  <File size={12} className="mr-1 inline" />
                  File #{index + 1}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Tasks = () => {
  const { user } = useFirebase();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { logTaskActivity } = useActivityLog();

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Loading tasks for user:", user.uid);
        const tasksData = await firebaseDb.getUserTasks(user.uid);
        console.log("Tasks loaded:", tasksData.length);
        setTasks(tasksData);
        
        // Initialize debug info with projects object
        const projectsMap = {};
        
        // Count tasks per project for debugging
        tasksData.forEach(task => {
          if (!projectsMap[task.projectId]) {
            projectsMap[task.projectId] = {
              name: task.projectName || 'Unknown Project',
              taskCount: 0
            };
          }
          projectsMap[task.projectId].taskCount++;
        });
        
        // Set the complete debug info
        setDebugInfo({
          userId: user.uid,
          taskCount: tasksData.length,
          projects: projectsMap
        });
        
      } catch (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks. Please try again.');
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user, setDebugInfo]);

  const handleStatusChange = async (projectId, taskId, newStatus) => {
    try {
      await firebaseDb.updateTaskStatus(projectId, taskId, newStatus);
      
      // Update local state and get the updated task
      let updatedTask;
      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => {
          if (task.id === taskId && task.projectId === projectId) {
            updatedTask = { ...task, status: newStatus };
            return updatedTask;
          }
          return task;
        });
        return newTasks;
      });
      
      // Log the task activity
      if (updatedTask) {
        const action = newStatus === 'done' ? 'complete' : 'update';
        await logTaskActivity(action, updatedTask, projectId);
      }
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      throw error;
    }
  };

  // Filter tasks by status and search term
  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' ? true : task.status === statusFilter;
    const searchMatch = searchTerm === '' ? true : 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Separate completed tasks
  const completedTasks = filteredTasks.filter(task => task.status === 'done');
  const activeTasks = filteredTasks.filter(task => task.status !== 'done');

  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'review', label: 'Review' }
  ];

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
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

  // For the empty state when no tasks are found, replace with:
  const emptyState = (
    <div className="col-span-3 py-12 flex flex-col items-center justify-center text-gray-500">
      <CheckCircle size={48} className="mb-4 text-gray-300" />
      <p className="text-lg">No active tasks found</p>
      <p className="text-sm">
        {tasks.length > 0 
          ? 'Try changing your filters to see more tasks' 
          : 'You have no assigned tasks at the moment'}
      </p>
      
      {tasks.length === 0 && (
        <button 
          onClick={() => setDebugMode(!debugMode)} 
          className="mt-4 text-xs text-blue-600 underline"
        >
          {debugMode ? 'Hide Debugging Info' : 'Show Debugging Info'}
        </button>
      )}
      
      {debugMode && tasks.length === 0 && (
        <div className="mt-4 text-left p-4 bg-gray-100 rounded-lg w-full max-w-xl overflow-auto">
          <h3 className="font-bold text-sm mb-2">Debugging Information:</h3>
          <p className="text-xs mb-1">User ID: {user?.uid}</p>
          <p className="text-xs mb-1">Tasks Found: {tasks.length}</p>
          
          {debugInfo && (
            <div className="mt-2">
              <p className="text-xs font-bold">Project Details:</p>
              <ul className="list-disc text-xs ml-4 mt-1">
                {Object.entries(debugInfo.projects).map(([projectId, project]) => (
                  <li key={projectId}>
                    {project.name}: {project.taskCount} tasks
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-2">
            <p className="text-xs font-bold">Try one of these fixes:</p>
            <ol className="list-decimal text-xs ml-4 mt-1">
              <li>Make sure you have tasks assigned to your user ID</li>
              <li>Check that task assignees use your exact user ID: {user?.uid}</li>
              <li>Different projects may use different assignee formats, some might not be detected</li>
              <li>If you're an admin, you could create a test task assigned to yourself</li>
            </ol>
          </div>
          
          <button
            onClick={async () => {
              setLoading(true);
              await firebaseDb.getUserTasks(user.uid);
              setLoading(false);
              toast.success('Check browser console for detailed task logs');
            }}
            className="mt-3 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg"
          >
            Run Verbose Task Search
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className={`flex-1 space-y-6 ${showCompleted ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCompleted} 
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4"
              />
              Show Completed
            </label>
          </div>
        </div>

        {/* Debug Info Section (shown only when debug mode is on) */}
        {debugMode && debugInfo && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-2">Debug Information</h3>
            <p className="text-xs text-gray-600">User ID: {debugInfo.userId}</p>
            <p className="text-xs text-gray-600">Total Tasks: {debugInfo.taskCount}</p>
            {Object.keys(debugInfo.projects).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-600">Projects:</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {Object.entries(debugInfo.projects).map(([projectId, project]) => (
                    <p key={projectId} className="text-xs text-gray-600">
                      {project.name}: {project.taskCount} tasks
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>

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
        </div>

        {/* Task Count */}
        <div className="text-sm text-gray-500">
          Showing {activeTasks.length} active tasks
        </div>

        {/* Active Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <TaskCard 
                key={`${task.projectId}-${task.id}`} 
                task={task} 
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            emptyState
          )}
        </div>
      </div>

      {/* Completed Tasks Column */}
      {showCompleted && (
        <div className="w-1/3 space-y-6 border-l pl-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Completed Tasks</h2>
            <span className="text-sm text-gray-500">{completedTasks.length} tasks</span>
          </div>

          <div className="space-y-4">
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <div key={`${task.projectId}-${task.id}`} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>Completed on {format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                  </div>

                  {task.evidenceFiles && task.evidenceFiles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {task.evidenceFiles.map((file, index) => (
                          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">
                            <File size={14} />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No completed tasks</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;