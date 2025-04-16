import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { firebaseDb } from '../services/firebaseDb';
import {
  Folder,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import CalendarWidget from '../components/calendar/CalendarWidget';
import MiniCalendar from '../components/calendar/MiniCalendar';



const ProjectContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    totalProjects: 0,
    userProjects: 0,
    error: null
  });
  const { user } = useFirebase();
  
  useEffect(() => {
    const loadContributions = async () => {
      try {
        console.log("Loading project contributions for user:", user?.uid, user?.email);
        
        if (!user?.uid) {
          console.log("No user ID available");
          setLoading(false);
          return;
        }
        
        // Get all tasks assigned to the user using the same method as My Tasks page
        const userTasks = await firebaseDb.getUserTasks(user.uid);
        console.log("User tasks loaded:", userTasks.length);
        
        // Group tasks by project to calculate contributions
        const projectMap = {};
        
        userTasks.forEach(task => {
          const projectId = task.projectId;
          
          if (!projectMap[projectId]) {
            projectMap[projectId] = {
              id: projectId,
              name: task.projectName || 'Unnamed Project',
              totalTasks: 0, // This will be fetched separately
              totalTasksAssigned: 0,
              completedTasks: 0,
              tasks: []
            };
          }
          
          projectMap[projectId].totalTasksAssigned++;
          projectMap[projectId].tasks.push(task);
          
          if (task.status === 'done' || task.status === 'completed') {
            projectMap[projectId].completedTasks++;
          }
        });
        
        console.log("Project map created:", Object.keys(projectMap).length);
        
        // For each project, get total task count to calculate contribution percentage
        const projectPromises = Object.values(projectMap).map(async (project) => {
          try {
            // Get all tasks for this project
            const tasksRef = collection(db, 'projects', project.id, 'tasks');
            const snapshot = await getDocs(tasksRef);
            const totalTasks = snapshot.size;
            
            // Calculate contribution percentage
            const contributionPercentage = totalTasks > 0 
              ? Math.round((project.totalTasksAssigned / totalTasks) * 100) 
              : 0;
            
            return {
              ...project,
              totalTasks,
              contributionPercentage
            };
          } catch (error) {
            console.error(`Error getting tasks for project ${project.id}:`, error);
            return {
              ...project,
              totalTasks: project.totalTasksAssigned, // Fallback
              contributionPercentage: 100 // Assume 100% if we can't get total
            };
          }
        });
        
        const projectContributions = await Promise.all(projectPromises);
        console.log("Final project contributions:", projectContributions);
        
        setDebugInfo({
          totalProjects: projectContributions.length,
          userProjects: projectContributions.length,
          error: null
        });
        
        setContributions(projectContributions);
      } catch (error) {
        console.error('Error loading project contributions:', error);
        setDebugInfo(prev => ({
          ...prev,
          error: error.message
        }));
      } finally {
        setLoading(false);
      }
    };
    
    loadContributions();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Folder className="w-12 h-12 mb-2 opacity-30" />
        <p>No project contributions yet</p>
        <p className="text-xs mt-2 text-gray-400">
          {debugInfo.totalProjects === 0 
            ? "No projects found in database" 
            : `Found ${debugInfo.totalProjects} projects, but you're not assigned to any tasks`}
        </p>
        {debugInfo.error && (
          <p className="text-xs mt-2 text-red-400">Error: {debugInfo.error}</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasks Assigned
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contribution
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contributions.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{project.name}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-500">{project.totalTasksAssigned}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {project.completedTasks}/{project.totalTasksAssigned}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${project.contributionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{project.contributionPercentage}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ApprovalNotification = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <UserCheck className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            You have {count} member{count !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
        <div className="ml-auto pl-3">
          <Link
            to="/member-approvals"
            className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-lg text-yellow-800 text-sm hover:bg-yellow-200"
          >
            <UserCheck size={16} />
            Review Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const TaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksRef = collection(db, 'tasks');
        const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'), limit(3));
        const snapshot = await getDocs(tasksQuery);

        const tasksData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            // Get the latest review for the task (if any)
            let lastRemarks = '';
            try {
              if (data.projectId) {
                const reviewsSnapshot = await getDocs(
                  query(collection(db, 'projects', data.projectId, 'reviews'), 
                    where('taskId', '==', doc.id),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                  )
                );
                
                if (!reviewsSnapshot.empty) {
                  const reviewData = reviewsSnapshot.docs[0].data();
                  lastRemarks = reviewData.remarks || reviewData.comment || '';
                }
              }
            } catch (error) {
              console.error('Error fetching reviews:', error);
            }
            
            return {
              id: doc.id,
              ...data,
              lastRemarks,
              createdAt: data.createdAt?.toDate() || new Date(),
              dueDate: data.dueDate?.toDate() || null
            };
          })
        );

        setTasks(tasksData);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Remarks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr 
                key={task.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : 'No due date'}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {task.status === 'in-progress' ? 'In Progress' : 
                      task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {task.lastRemarks || 'No remarks'}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                No tasks available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';
  const canViewCalendar = hasPermission('calendar.view');

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load pending approvals count for admin
        if (isAdmin) {
          const pendingSnapshot = await getDocs(collection(db, 'usersWaitingApproval'));
          setPendingCount(pendingSnapshot.size);
        }

        // Load calendar events only if user has permission
        if (canViewCalendar) {
          const eventsSnapshot = await getDocs(collection(db, 'calendarEvents'));
          const events = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate()
          }));
          setCalendarEvents(events);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, isAdmin, canViewCalendar]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin && <ApprovalNotification count={pendingCount} />}

      {/* Personalized Greeting */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'User'} 👋
        </h1>
        <p className="text-gray-600">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Removed StatCards */}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Tasks Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Tasks</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <TaskTable />
          </div>

          {/* Project Contributions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Project Contributions</h2>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All Projects
              </button>
            </div>
            <ProjectContributions />
          </div>
        </div>

        {/* Right Column - Calendar and Events */}
        <div className="lg:col-span-1 space-y-6">
          {/* Small Calendar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Calendar</h2>
            <MiniCalendar events={calendarEvents} />
          </div>

          {canViewCalendar && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              <CalendarWidget events={calendarEvents} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;