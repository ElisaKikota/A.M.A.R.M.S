# Project Documentation


# Directory: src


### File: App.css
```
.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

```


### File: App.js
```
import React from 'react';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import MemberApprovals from './pages/MemberApprovals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import SignIn from './components/auth/SignIn';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Resources from './pages/Resources';
import TrainingProgress from './pages/TrainingProgress';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Tasks from './pages/Tasks';
import TaskAssign from './pages/TaskAssign';
import PermissionsControl from './pages/PermissionsControl';
import DatabaseSetup from './pages/DatabaseSetup';

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Layout />}>
              {/* Dashboard - Requires dashboard.view permission */}
              <Route index element={
                <ProtectedRoute requiredPermission="dashboard.view">
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Training - Requires training.view permission */}
              <Route path="training" element={
                <ProtectedRoute requiredPermission="training.view">
                  <TrainingProgress />
                </ProtectedRoute>
              } />
              
              {/* Projects - Requires projects.view permission */}
              <Route path="projects" element={
                <ProtectedRoute requiredPermission="projects.view">
                  <Projects />
                </ProtectedRoute>
              } />
              
              {/* Team - Requires team.view permission */}
              <Route path="team" element={
                <ProtectedRoute requiredPermission="team.view">
                  <Team />
                </ProtectedRoute>
              } />
              
              {/* Resources - Requires resources.view permission */}
              <Route path="resources" element={
                <ProtectedRoute requiredPermission="resources.view">
                  <Resources />
                </ProtectedRoute>
              } />
              
              {/* Reports - Requires reports.view permission */}
              <Route path="reports" element={
                <ProtectedRoute requiredPermission="reports.view">
                  <Reports />
                </ProtectedRoute>
              } />
              
              {/* Settings - Accessible to all logged-in users */}
              <Route path="settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Tasks - Requires tasks.view permission */}
              <Route path="tasks" element={
                <ProtectedRoute requiredPermission="tasks.view">
                  <Tasks />
                </ProtectedRoute>
              } />
              
              {/* Task Assign - Requires team.assignTasks permission */}
              <Route path="tasks/assign/:memberId" element={
                <ProtectedRoute requiredPermission="team.assignTasks">
                  <TaskAssign />
                </ProtectedRoute>
              } />
              
              {/* Member Approvals - Requires admin.approveMembers permission */}
              <Route path="/member-approvals" element={
                <AdminRoute requiredPermission="admin.approveMembers">
                  <MemberApprovals />
                </AdminRoute>
              } />
              
              {/* Permissions Control - Requires admin.managePermissions permission */}
              <Route path="/permissions" element={
                <AdminRoute requiredPermission="admin.managePermissions">
                  <PermissionsControl />
                </AdminRoute>
              } />
              
              {/* Database Setup - Requires admin.managePermissions permission */}
              <Route path="/setup" element={
                <AdminRoute requiredPermission="admin.managePermissions">
                  <DatabaseSetup />
                </AdminRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
```


### File: App.test.js
```
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

```


## Directory: components


## Directory: components\analytics


### File: components\analytics\AnalyticsDashboard.jsx
```
import React from 'react';
import { LineChart, BarChart } from 'recharts';
import { Card } from '@/components/ui/card';

export const AnalyticsDashboard = () => {
  const projectStore = useProjectStore();
  const projects = Object.values(projectStore.projects);

  const progressData = projects.map(project => ({
    name: project.name,
    progress: calculateProgress(project),
    target: 100
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Projects Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Projects</span>
              <span className="font-medium">{projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span>On Track</span>
              <span className="text-green-600 font-medium">
                {projects.filter(p => isOnTrack(p)).length}
              </span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Resources</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Utilization Rate</span>
              <span className="font-medium">78%</span>
            </div>
            <div className="flex justify-between">
              <span>Available Equipment</span>
              <span className="font-medium">12/15</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Team Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Members</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between">
              <span>Task Completion Rate</span>
              <span className="font-medium">92%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
          <div className="h-64">
            <BarChart width={400} height={250} data={progressData}>
              {/* Chart configuration */}
            </BarChart>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
          <div className="h-64">
            <PieChart width={400} height={250}>
              {/* Chart configuration */}
            </PieChart>
          </div>
        </Card>
      </div>
    </div>
  );
};
```


## Directory: components\auth


### File: components\auth\ProtectedRoute.jsx
```
// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(permission => 
    hasPermission(permission)
  );

  if (!hasAllPermissions) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```


### File: components\auth\SignIn.jsx
```
import React, { useState } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';

const SignIn = () => {
  const { login } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to HUB</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
```


## Directory: components\dashboard


### File: components\dashboard\ProjectsOverview.jsx
```
const ProjectsOverview = () => {
    const projects = useProjectStore(state => state.projects);
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };
  
```


### File: components\dashboard\ResourceAllocation.jsx
```

```


### File: components\dashboard\TeamProgress.jsx
```

```


## Directory: components\hardware


### File: components\hardware\HardwareCard.jsx
```
// src/components/hardware/HardwareCard.jsx
import React from 'react';
import { Edit, Trash2, Clock, Tool, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const HardwareCard = ({ item, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-use':
        return <Clock className="w-4 h-4" />;
      case 'maintenance':
        return <Tool className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {item.status}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Serial Number:</span>
          <span className="font-medium">{item.serialNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{item.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Condition:</span>
          <span className="font-medium">{item.condition}</span>
        </div>
        {item.currentCheckout && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Checked out by: {item.currentCheckout.userId}</p>
            <p className="text-sm text-gray-600">
              Return by: {format(new Date(item.currentCheckout.expectedReturnDate), 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onEdit(item)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          title="Edit"
        >
          <Edit size={16} />
        </button>
        {!item.currentCheckout && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 hover:bg-red-100 rounded-full text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default HardwareCard;
```


### File: components\hardware\HardwareSection.jsx
```
// src/components/resources/HardwareSection.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const HardwareSection = () => {
  const { user } = useFirebase();
  const [hardware, setHardware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    condition: 'good',
    status: 'available',
    serialNumber: '',
    description: ''
  });

  useEffect(() => {
    loadHardware();
  }, [user]);

  const loadHardware = async () => {
    try {
      setLoading(true);
      const hardwareRef = collection(db, 'hardware');
      const snapshot = await getDocs(hardwareRef);
      console.log('Fetched hardware:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setHardware(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error loading hardware:', error);
      toast.error('Failed to load hardware items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hardwareRef = collection(db, 'hardware');
      const newHardware = {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      console.log('Adding hardware:', newHardware);
      await addDoc(hardwareRef, newHardware);
      toast.success('Hardware added successfully');
      setIsModalOpen(false);
      setFormData({
        name: '',
        category: '',
        quantity: 1,
        condition: 'good',
        status: 'available',
        serialNumber: '',
        description: ''
      });
      loadHardware();
    } catch (error) {
      console.error('Error adding hardware:', error);
      toast.error('Failed to add hardware');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Hardware Inventory</h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search hardware..."
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add New Hardware
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hardware.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {item.status}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{item.condition}</span>
                </div>
                {item.serialNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serial Number:</span>
                    <span className="font-medium">{item.serialNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Hardware Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Hardware</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HardwareSection;

const KanbanBoard = ({ projectId, tasks, onTasksChange, onUpdateTask, onAddTask, onDeleteTask }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Drop outside the list
    if (!destination) return;

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Reorder tasks array
    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    const updatedTask = { ...removed, status: destination.droppableId };
    newTasks.splice(destination.index, 0, updatedTask);

    // Optimistic update
    onTasksChange(newTasks);

    try {
      // Update task status
      await onUpdateTask(draggableId, { status: destination.droppableId });
      toast.success('Task updated successfully');
    } catch (error) {
      // Revert optimistic update on error
      onTasksChange(tasks);
      toast.error('Failed to update task');
    }
  };

  const handleAddNewTask = (status) => {
    setSelectedStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        await onUpdateTask(selectedTask.id, taskData);
      } else {
        await onAddTask({
          ...taskData,
          status: selectedStatus,
        });
      }
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'inProgress'),
    review: tasks.filter(task => task.status === 'review'),
    done: tasks.filter(task => task.status === 'done')
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        <Column
          title="To Do"
          tasks={columns.todo}
          status="todo"
          onAddTask={handleAddNewTask}
        >
          {columns.todo.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </Column>

        <Column
          title="In Progress"
          tasks={columns.inProgress}
          status="inProgress"
          onAddTask={handleAddNewTask}
        >
          {columns.inProgress.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </Column>

        <Column
          title="Review"
          tasks={columns.review}
          status="review"
          onAddTask={handleAddNewTask}
        >
          {columns.review.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </Column>

        <Column
          title="Done"
          tasks={columns.done}
          status="done"
          onAddTask={handleAddNewTask}
        >
          {columns.done.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </Column>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </DragDropContext>
  );
};

export default KanbanBoard; 

export default ProjectCard;

const ProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const { user } = useFirebase();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    team: [],
    projectManager: null,
    milestones: [],
    resources: []
  });

  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  const [availableResources, setAvailableResources] = useState({
    hardware: [],
    software: [],
    venue: []
  });
  const [milestone, setMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    overseer: ''
  });

  const [resource, setResource] = useState({
    id: '',
    name: '',
    type: 'hardware',
    quantity: 1,
    status: 'available'
  });

  // Fetch team members when modal opens
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        // Query the users collection for active members instead of from firebaseDb
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('status', 'in', ['active', 'onLeave']));
        const snapshot = await getDocs(q);
        
        const members = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          role: doc.data().role,
          email: doc.data().email
        }));
        
        setAvailableTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
        toast.error('Failed to load team members');
      }
    };

    if (isOpen && user) {
      loadTeamMembers();
    }
  }, [isOpen, user]);

  // Fetch resources when modal opens
  useEffect(() => {
    const loadResources = async () => {
      try {
        const resourcesRef = collection(db, 'resources');
        const snapshot = await getDocs(resourcesRef);
        
        const resources = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group resources by type
        setAvailableResources({
          hardware: resources.filter(r => r.type === 'hardware' && r.status === 'available'),
          software: resources.filter(r => r.type === 'software' && r.status === 'available'),
          venue: resources.filter(r => r.type === 'venue' && r.status === 'available')
        });
      } catch (error) {
        console.error('Error loading resources:', error);
        toast.error('Failed to load resources');
      }
    };

    if (isOpen) {
      loadResources();
    }
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        startDate: '',
        endDate: '',
        team: [],
        milestones: [],
        resources: []
      });
    }
  }, [project]);

  const addMilestone = () => {
    if (milestone.title && milestone.dueDate && milestone.overseer) {
      // Find the overseer details to include name
      const overseerDetails = formData.team.find(member => member.id === milestone.overseer);
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { 
          ...milestone, 
          id: Date.now().toString(),
          overseerName: overseerDetails?.name || 'Unknown' // Add overseer name
        }]
      }));
      setMilestone({ title: '', description: '', dueDate: '', overseer: '' });
    } else {
      toast.error('Please fill in all required milestone fields');
    }
  };

  const addResource = () => {
    if (resource.id && resource.quantity) {
      // Find the selected resource details
      const selectedResource = availableResources[resource.type].find(r => r.id === resource.id);
      
      if (!selectedResource) {
        toast.error('Please select a valid resource');
        return;
      }

      // Check if quantity is available
      if (selectedResource.availableQuantity < resource.quantity) {
        toast.error(`Only ${selectedResource.availableQuantity} units available`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, {
          ...resource,
          name: selectedResource.name,
          uniqueId: Date.now().toString() // For list key purposes
        }]
      }));

      setResource({
        id: '',
        name: '',
        type: 'hardware',
        quantity: 1,
        status: 'available'
      });
    } else {
      toast.error('Please select a resource and specify quantity');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to create a project');
      return;
    }

    try {
      await onSave({
        ...formData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Error saving project:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="inProgress">In Progress</option>
                <option value="onHold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Team Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Members
            </label>
            <TeamMemberSelect
              members={availableTeamMembers}
              selectedMembers={formData.team}
              onChange={(team) => setFormData({ ...formData, team })}
            />
          </div>

          {/* Project Manager Selection  */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Project Manager
  </label>
  <select
    value={formData.projectManager || ''}
    onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Project Manager</option>
    {formData.team.map((member) => (
      <option key={member.id} value={member.id}>
        {member.name}
      </option>
    ))}
  </select>
  <p className="mt-1 text-sm text-gray-500">
    Designate a team member as the project manager
  </p>
</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Milestones Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Milestones</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={milestone.title}
                  onChange={(e) => setMilestone({ ...milestone, title: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={milestone.dueDate}
                  onChange={(e) => setMilestone({ ...milestone, dueDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <textarea
                placeholder="Milestone description"
                value={milestone.description}
                onChange={(e) => setMilestone({ ...milestone, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Overseer
                </label>
                <select
                  value={milestone.overseer}
                  onChange={(e) => setMilestone({ ...milestone, overseer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select person in charge</option>
                  {formData.team.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add Milestone
              </button>

              {/* Milestones List */}
              <div className="space-y-2">
                {formData.milestones.map((m, index) => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{m.title}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Overseer: {m.overseerName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        milestones: prev.milestones.filter((_, i) => i !== index)
                      }))}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <select
                    value={resource.type}
                    onChange={(e) => setResource({ ...resource, type: e.target.value, id: '' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="venue">Venue</option>
                  </select>
                </div>
                <div>
                  <select
                    value={resource.id}
                    onChange={(e) => {
                      const selectedResource = availableResources[resource.type].find(r => r.id === e.target.value);
                      setResource({
                        ...resource,
                        id: e.target.value,
                        name: selectedResource ? selectedResource.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select {resource.type}</option>
                    {availableResources[resource.type].map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.availableQuantity} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={resource.quantity}
                    onChange={(e) => setResource({ ...resource, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max={resource.id ? availableResources[resource.type].find(r => r.id === resource.id)?.availableQuantity : 1}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addResource}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add Resource
              </button>

              {/* Resources List */}
              <div className="space-y-2">
                {formData.resources.map((r) => (
                  <div key={r.uniqueId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{r.name}</h4>
                      <p className="text-sm text-gray-500">
                        {r.type} - Quantity: {r.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        resources: prev.resources.filter(res => res.uniqueId !== r.uniqueId)
                      }))}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
```


### File: components\projects\ProjectStatus.jsx
```
const ProjectStatus = ({ project }) => {
    const milestoneStatus = useMemo(() => {
      const total = project.milestones.length;
      const completed = project.milestones.filter(m => m.status === 'completed').length;
      return {
        percentage: (completed / total) * 100,
        completed,
        total
      };
    }, [project.milestones]);
  
    return (
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <Badge
            variant={project.status === 'active' ? 'success' : 'warning'}
          >
            {project.status}
          </Badge>
        </div>
  
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Overall Progress</span>
              <span>{milestoneStatus.percentage.toFixed(0)}%</span>
            </div>
            <Progress value={milestoneStatus.percentage} className="h-2" />
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Start Date</span>
              <p className="font-medium">{formatDate(project.timeline.start)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">End Date</span>
              <p className="font-medium">{formatDate(project.timeline.end)}</p>
            </div>
          </div>
  
          <div>
            <h4 className="font-medium mb-2">Team Members</h4>
            <div className="flex -space-x-2">
              {project.team.map(member => (
                <Avatar
                  key={member}
                  className="border-2 border-white"
                  // Add member image or initials
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };
```


### File: components\projects\ProjectTimeline.jsx
```
// src/components/projects/ProjectTimeline.jsx
import React from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Circle } from 'lucide-react';

const ProjectTimeline = ({ project }) => {
  const sortedMilestones = [...project.milestones].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Project Timeline</h3>
      <div className="relative">
        {sortedMilestones.map((milestone, index) => (
          <div key={milestone.id} className="flex mb-8 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              {milestone.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
              {index < sortedMilestones.length - 1 && (
                <div className="w-px h-full bg-gray-200 my-2" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{milestone.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  milestone.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : milestone.status === 'inProgress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                Overseer: {project.team?.find(m => m.id === milestone.overseer)?.name || 'Not assigned'}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar size={14} />
                {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;
```


## Directory: components\reports


### File: components\reports\ExportMenu.jsx
```
// src/components/reports/ExportMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, File } from 'lucide-react';

const ExportMenu = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportOptions = [
    { label: 'PDF Report', icon: FileText, format: 'pdf' },
    { label: 'Excel Spreadsheet', icon: Table, format: 'excel' },
    { label: 'CSV File', icon: File, format: 'csv' }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Download size={20} />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50">
          <div className="py-2">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => {
                  onExport(option.format);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100"
              >
                <option.icon size={18} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
```


### File: components\reports\ProjectProgressChart.jsx
```
// src/components/reports/ProjectProgressChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProjectProgressChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Project Progress Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed Tasks" />
            <Line type="monotone" dataKey="inProgress" stroke="#3B82F6" name="In Progress" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectProgressChart;
```


### File: components\reports\ReportCard.jsx
```
// src/components/reports/ReportCard.jsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ReportCard = ({ title, value, change, changeType, icon: Icon }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className={`flex items-center mt-2 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span className="text-sm ml-1">{change}%</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${
          isPositive ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            isPositive ? 'text-green-600' : 'text-blue-600'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
```


### File: components\reports\ReportsGenerator.jsx
```
const ReportsGenerator = () => {
    const reportTypes = [
      { id: 'progress', name: 'Progress Report', icon: BarChart },
      { id: 'resources', name: 'Resource Utilization', icon: Database },
      { id: 'team', name: 'Team Performance', icon: Users }
    ];
  
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map(type => (
            <button
              key={type.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <type.icon className="w-8 h-8 mb-2 text-blue-600" />
              <span className="font-medium">{type.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
```


### File: components\reports\ResourceUtilizationChart.jsx
```
// src/components/reports/ResourceUtilizationChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ResourceUtilizationChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="resource" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="used" fill="#3B82F6" name="Used" />
            <Bar dataKey="available" fill="#10B981" name="Available" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResourceUtilizationChart;
```


## Directory: components\resources


### File: components\resources\EditQuantityModal.jsx
```
// src/components/resources/EditQuantityModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditQuantityModal = ({ isOpen, onClose, resource, onSave }) => {
  const [quantity, setQuantity] = useState(resource?.quantity || 0);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(resource.id, quantity);
      toast.success('Quantity updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Quantity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {resource.name} - Current Quantity: {resource.quantity}
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuantityModal;
```


### File: components\resources\HardwareSection.jsx
```
import React, { useState, useEffect } from 'react';
import { Plus, Search, Upload, X, Edit2, Trash2, Filter } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';

const HardwareSection = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [hardware, setHardware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    company: '',
    description: '',
    status: {
      available: 0,
      inUse: 0,
      maintenance: 0
    },
    serialNumber: '',
    condition: 'good',
    images: []
  });

  useEffect(() => {
    loadHardware();
  }, []);

  const loadHardware = async () => {
    try {
      setLoading(true);
      const items = await resourceService.getResources('hardware');
      setHardware(items);
    } catch (error) {
      console.error('Error loading hardware:', error);
      toast.error('Failed to load hardware items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalQuantity = Object.values(formData.status).reduce((a, b) => a + b, 0);
      if (totalQuantity === 0) {
        toast.error('Total quantity must be greater than 0');
        return;
      }

      const imageUrls = await Promise.all(
        images.map(img => resourceService.uploadImage(img.file, 'hardware', formData.category, formData.name))
      );

      const hardwareData = {
        ...formData,
        images: imageUrls,
        totalQuantity,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };

      if (selectedHardware) {
        await resourceService.updateResource('hardware', selectedHardware.id, hardwareData);
        toast.success('Hardware updated successfully');
      } else {
        await resourceService.addResource('hardware', hardwareData);
        toast.success('Hardware added successfully');
      }

      setIsModalOpen(false);
      setSelectedHardware(null);
      setImages([]);
      loadHardware();
    } catch (error) {
      console.error('Error saving hardware:', error);
      toast.error('Failed to save hardware');
    }
  };

  const HardwareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            {selectedHardware ? 'Edit Hardware' : 'Add Hardware'}
          </h2>
          <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Available Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.status.available}
                onChange={(e) => setFormData({
                  ...formData,
                  status: { ...formData.status, available: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">In Use Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.status.inUse}
                onChange={(e) => setFormData({
                  ...formData,
                  status: { ...formData.status, inUse: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maintenance Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.status.maintenance}
                onChange={(e) => setFormData({
                  ...formData,
                  status: { ...formData.status, maintenance: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <div className="mt-2 grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {selectedHardware ? 'Update Hardware' : 'Add Hardware'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const filteredHardware = hardware.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Hardware Inventory</h2>
        {hasPermission('canManageResources') && (
          <button
            onClick={() => {
              setSelectedHardware(null);
              setFormData({
                name: '',
                category: '',
                company: '',
                description: '',
                status: {
                  available: 0,
                  inUse: 0,
                  maintenance: 0
                },
                serialNumber: '',
                condition: 'good',
                images: []
              });
              setImages([]);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Hardware
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search hardware..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="inUse">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHardware.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            {item.images?.length > 0 && (
              <div className="relative h-48 mb-4">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                {item.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                    +{item.images.length - 1} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-sm text-gray-500">Made by: {item.company}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 p-2 rounded-lg text-center">
                  <div className="text-sm text-green-600">Available</div>
                  <div className="font-medium">{item.status.available}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                  <div className="text-sm text-blue-600">In Use</div>
                  <div className="font-medium">{item.status.inUse}</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded-lg text-center">
                  <div className="text-sm text-yellow-600">Maintenance</div>
                  <div className="font-medium">{item.status.maintenance}</div>
                </div>
              </div>

              {item.serialNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Serial Number:</span>
                  <span className="font-medium">{item.serialNumber}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium">{item.condition}</span>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              )}
            </div>

            {hasPermission('canManageResources') && (
              <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedHardware(item);
                    setFormData({
                      ...item,
                      status: item.status || {
                        available: 0,
                        inUse: 0,
                        maintenance: 0
                      }
                    });
                    setImages(item.images?.map(url => ({ preview: url })) || []);
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this item?')) {
                      try {
                        await resourceService.deleteResource('hardware', item.id);
                        toast.success('Hardware deleted successfully');
                        loadHardware();
                      } catch (error) {
                        console.error('Error deleting hardware:', error);
                        toast.error('Failed to delete hardware');
                      }
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && <HardwareModal />}
    </div>
  );
};

export default HardwareSection;
```


## Directory: components\resources\modals


### File: components\resources\modals\AddResourceModal.jsx
```
import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { storageService } from '../../../firebase/storageConfig';
import { toast } from 'react-hot-toast';

export const AddResourceModal = ({ isOpen, onClose, type = 'hardware' }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    condition: 'good',
    status: 'available',
    description: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        const path = `hardware/${formData.category}/${formData.name}_${Date.now()}`;
      }

      toast.success('Hardware added successfully');
      onClose();
      
    } catch (error) {
      console.error('Error adding hardware:', error);
      toast.error('Failed to add hardware');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Hardware</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="mx-auto h-32 w-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Hardware'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```


### File: components\resources\modals\DeleteBookingModal.jsx
```
//src/components/resources/modals/DeleteBookingModal.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DeleteBookingModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-red-100 p-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold">Cancel Booking</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};
```


### File: components\resources\modals\index.js
```
export { AddResourceModal } from './AddResourceModal';
export { VenueBookingModal } from './VenueBookingModal';
```


### File: components\resources\modals\VenueBookingModal copy.jsx
```
import React, { useState, useEffect } from 'react';  // Add useEffect import
import { Calendar as CalendarIcon, Clock, Users, X } from 'lucide-react';
import { format, parse, startOfWeek, endOfWeek, eachDayOfInterval, addMinutes } from 'date-fns';
import { parseISO } from 'date-fns';

const VENUES = {
  D24: {
    name: 'D24 3D HUB',
    capacity: 20,
    equipment: ['3D Printer', 'Computer Workstation', 'Design Software']
  },
  D18: {
    name: 'D18',
    capacity: 50,
    equipment: ['Projector', 'Whiteboard', 'Conference System']
  }
};


export const VenueBookingModal = ({ isOpen, onClose, onSave, selectedTimeSlot }) => {
  const [booking, setBooking] = useState({
    date: selectedTimeSlot?.date || format(new Date(), 'yyyy-MM-dd'),
    timeSlot: selectedTimeSlot?.timeSlot || '07:00-08:00',
    venue: selectedTimeSlot?.venue || 'D24',
    duration: 60,
    attendees: 1,
    purpose: '',
    equipment: []
  });

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return format(endDate, 'HH:mm');
  };

  // Get start time from time slot
  const getStartTime = (timeSlot) => {
    return timeSlot.split('-')[0];
  };

  const startTime = getStartTime(booking.timeSlot);
  const endTime = calculateEndTime(startTime, booking.duration);

  const timeSlots = [];
  let currentTime = parse('07:00', 'HH:mm', new Date());
  // const endTime = parse('20:00', 'HH:mm', new Date());

  while (currentTime <= endTime) {
    timeSlots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, 30);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(booking);
    onClose();
  };

  const selectedVenueName = VENUES[booking.venue]?.name || '';
  const selectedVenueCapacity = VENUES[booking.venue]?.capacity || 0;

  useEffect(() => {
    if (selectedTimeSlot) {
      setBooking(prev => ({
        ...prev,
        date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot.timeSlot,
        venue: selectedTimeSlot.venue
      }));
    }
  }, [selectedTimeSlot]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Book {selectedVenueName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={booking.startTime}
                  onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={booking.duration}
                  onChange={(e) => setBooking({ ...booking, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Start</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      {startTime}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">End</label>
                    <div className="px-3 py-2 border rounded-lg bg-gray-50">
                      {endTime}
                    </div>
                  </div>
                </div>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Attendees
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    min="1"
                    max={selectedVenueCapacity}
                    value={booking.attendees}
                    onChange={(e) => setBooking({ ...booking, attendees: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <textarea
                value={booking.purpose}
                onChange={(e) => setBooking({ ...booking, purpose: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            {VENUES[booking.venue]?.equipment?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Equipment
                </label>
                <div className="space-y-2">
                  {VENUES[booking.venue].equipment.map((item, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={booking.equipment.includes(item)}
                        onChange={(e) => {
                          const newEquipment = e.target.checked
                            ? [...booking.equipment, item]
                            : booking.equipment.filter(eq => eq !== item);
                          setBooking({ ...booking, equipment: newEquipment });
                        }}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book Venue
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};
```


### File: components\resources\modals\VenueBookingModal.jsx
```
// src/components/resources/modals/VenueBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, X } from 'lucide-react';
import { format } from 'date-fns';

const VENUES = {
  D24: { name: 'D24 3D HUB', capacity: 20 },
  D18: { name: 'D18', capacity: 50 }
};

export const VenueBookingModal = ({ isOpen, onClose, onSave, selectedTimeSlot }) => {
  const [booking, setBooking] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    timeSlot: '07:00-08:00',
    venue: 'D24',
    duration: 60,
    attendees: 1,
    purpose: '',
  });

  useEffect(() => {
    if (selectedTimeSlot) {
      setBooking(prev => ({
        ...prev,
        date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot.timeSlot,
        venue: selectedTimeSlot.venue
      }));
    }
  }, [selectedTimeSlot]);

  const [startTime] = booking.timeSlot.split('-');

  // Calculate end time based on duration
  const calculateEndTime = () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + booking.duration * 60000);
    return format(endDate, 'HH:mm');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(booking);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Book {VENUES[booking.venue]?.name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Date (non-editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="px-3 py-2 border rounded-lg bg-gray-50 flex items-center">
                <CalendarIcon className="text-gray-400 mr-2" size={20} />
                {format(new Date(booking.date), 'MMMM d, yyyy')}
              </div>
            </div>

            {/* Time Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-2 border rounded-lg bg-gray-50 flex-1">
                  <Clock className="text-gray-400 mr-2 inline" size={16} />
                  {startTime}
                </div>
                <span className="text-gray-500">to</span>
                <div className="px-3 py-2 border rounded-lg bg-gray-50 flex-1">
                  {calculateEndTime()}
                </div>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={booking.duration}
              onChange={(e) => setBooking({ ...booking, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Attendees
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                min="1"
                max={VENUES[booking.venue]?.capacity}
                value={booking.attendees}
                onChange={(e) => setBooking({ ...booking, attendees: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Maximum capacity: {VENUES[booking.venue]?.capacity} people
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              value={booking.purpose}
              onChange={(e) => setBooking({ ...booking, purpose: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Please describe the purpose of your booking..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```


### File: components\resources\ResourceActionControls.jsx
```
import React, { useState } from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';

const ResourceActionControls = ({ 
  resource, 
  type, 
  onDelete, 
  onUpdate,
  userRole 
}) => {
  const [showEditQuantity, setShowEditQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState(resource.quantity);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowQuantity, setBorrowQuantity] = useState(1);
  const [returnDate, setReturnDate] = useState('');
  const { user } = useAuth();

  // Role-based permissions
  const canBorrow = ['admin', 'supervisor', 'community_member', 'project_member', 'instructor', 'resource_manager'].includes(userRole);
  const canEdit = ['admin', 'resource_manager'].includes(userRole);
  const canDelete = ['admin', 'resource_manager'].includes(userRole);

  const handleQuantityUpdate = async () => {
    try {
      if (!canEdit) {
        toast.error('You do not have permission to edit quantities');
        return;
      }

      if (newQuantity < 0) {
        toast.error('Quantity cannot be negative');
        return;
      }

      await resourceService.updateQuantity(type, resource.id, newQuantity, user.uid);
      onUpdate({ ...resource, quantity: newQuantity });
      setShowEditQuantity(false);
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleBorrow = async () => {
    try {
      if (!canBorrow) {
        toast.error('You do not have permission to borrow resources');
        return;
      }

      if (borrowQuantity > resource.quantity) {
        toast.error('Cannot borrow more than available quantity');
        return;
      }

      if (!returnDate) {
        toast.error('Please select a return date');
        return;
      }

      await resourceService.borrowResource(type, resource.id, user.uid, {
        quantity: borrowQuantity,
        returnDate: returnDate
      });

      onUpdate({ 
        ...resource, 
        quantity: resource.quantity - borrowQuantity 
      });
      
      setShowBorrowForm(false);
      toast.success('Resource borrowed successfully');
    } catch (error) {
      console.error('Error borrowing resource:', error);
      toast.error('Failed to borrow resource');
    }
  };

  const handleDelete = async () => {
    try {
      if (!canDelete) {
        toast.error('You do not have permission to delete resources');
        return;
      }

      if (window.confirm('Are you sure you want to delete this resource?')) {
        await onDelete(resource.id);
        toast.success('Resource deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Action Buttons */}
      <div className="flex gap-2">
        {canBorrow && (
          <button
            onClick={() => setShowBorrowForm(true)}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
          >
            <Package size={16} />
            Borrow
          </button>
        )}
        
        {canEdit && (
          <button
            onClick={() => setShowEditQuantity(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Edit2 size={16} />
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Edit Quantity Form */}
      {showEditQuantity && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium mb-1">New Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value))}
              className="flex-1 px-3 py-1.5 border rounded-lg"
            />
            <button
              onClick={handleQuantityUpdate}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
            <button
              onClick={() => setShowEditQuantity(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Borrow Form */}
      {showBorrowForm && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity to Borrow</label>
              <input
                type="number"
                min="1"
                max={resource.quantity}
                value={borrowQuantity}
                onChange={(e) => setBorrowQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBorrow}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBorrowForm(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceActionControls;
```


### File: components\resources\ResourceCalendar.jsx
```
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Info } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    parseISO,
    isPast,
    startOfDay
} from 'date-fns';
import { toast } from 'react-hot-toast';

const VENUES = {
    D24: { name: 'D24 3D HUB', capacity: 20 },
    D18: { name: 'D18', capacity: 50 }
};

// Fixed time slots from 7:00 to 20:00
export const TIME_SLOTS = [
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00'
];

const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
};

const ResourceCalendar = ({ bookings = [], onSelectTimeSlot }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedVenue, setSelectedVenue] = useState('D24');
    const [normalizedBookings, setNormalizedBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const getWeekDays = (date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(start, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };
    const [hoveredDate, setHoveredDate] = useState(null);

    useEffect(() => {
        const normalized = bookings.map(booking => ({
            ...booking,
            date: booking.date instanceof Date
                ? booking.date
                : booking.date?.toDate?.()
                    ? booking.date.toDate()
                    : typeof booking.date === 'string'
                        ? parseISO(booking.date)
                        : new Date(booking.date),
        }));
        setNormalizedBookings(normalized);
    }, [bookings]);

    const handleDateClick = (date) => {
        if (isPast(startOfDay(date))) {
            toast.error("Cannot view past dates");
            return;
        }
        setSelectedWeek(startOfWeek(date, { weekStartsOn: 1 }));
    };

    const BookingDetailsDialog = ({ booking, onClose }) => {
        if (!booking) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">Booking Details</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p>{format(booking.date, 'MMMM d, yyyy')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time Slots</p>
                            <p>{booking.affectedTimeSlots?.join(', ')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Purpose</p>
                            <p>{booking.purpose}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Attendees</p>
                            <p>{booking.attendees} people</p>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    onSelectTimeSlot({ ...booking, action: 'edit' });
                                    onClose();
                                }}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    onSelectTimeSlot({ ...booking, action: 'delete' });
                                    onClose();
                                }}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const WeeklyView = () => {
        if (!selectedWeek) return null;

        const weekDays = eachDayOfInterval({
            start: selectedWeek,
            end: endOfWeek(selectedWeek, { weekStartsOn: 1 })
        });

        const handleTimeSlotClick = (day, timeSlot, booking = null) => {
            if (isPast(startOfDay(day))) {
                toast.error("Cannot book past dates");
                return;
            }
            
            if (booking) {
                setSelectedBooking(booking);
            } else {
                onSelectTimeSlot({
                    date: day,
                    timeSlot,
                    venue: selectedVenue
                });
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 m-4 max-h-[90vh] w-full max-w-7xl overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                            {format(selectedWeek, 'MMMM d')} - {format(endOfWeek(selectedWeek), 'MMMM d, yyyy')}
                        </h3>
                        <div className="flex gap-4 items-center">
                            <select
                                value={selectedVenue}
                                onChange={(e) => setSelectedVenue(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            >
                                {Object.entries(VENUES).map(([id, venue]) => (
                                    <option key={id} value={id}>{venue.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setSelectedWeek(null)}
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <div className="grid grid-cols-[100px_repeat(7,1fr)] divide-y">
                            {/* Header */}
                            <div className="col-span-full grid grid-cols-[100px_repeat(7,1fr)] bg-gray-50">
                                <div className="p-2 font-medium border-r">Time</div>
                                {weekDays.map(day => (
                                    <div key={day.toString()} className="p-2 font-medium text-center border-r last:border-r-0">
                                        <div>{format(day, 'EEE')}</div>
                                        <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Time slots */}
                            {TIME_SLOTS.map((currentTimeSlot, rowIndex) => (
                                <div key={currentTimeSlot} 
                                     className="col-span-full grid grid-cols-[100px_repeat(7,1fr)] hover:bg-gray-50/50">
                                    <div className="p-2 font-medium text-sm border-r">
                                        {currentTimeSlot}
                                    </div>
                                    {weekDays.map(day => {
                                        const booking = normalizedBookings.find(b => {
                                            const sameDay = isSameDay(b.date, day);
                                            const hasTimeSlot = b.affectedTimeSlots?.includes(currentTimeSlot);
                                            const correctVenue = b.venue === selectedVenue;
                                            return sameDay && hasTimeSlot && correctVenue;
                                        });

                                        const isFirstSlot = booking?.affectedTimeSlots?.[0] === currentTimeSlot;

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                    p-2 border-r last:border-r-0 relative min-h-[4rem]
                                                    ${booking ? 'bg-blue-100' : ''}
                                                    ${isPast(startOfDay(day)) ? 'bg-gray-50' : 'cursor-pointer'}
                                                `}
                                                onClick={() => handleTimeSlotClick(day, currentTimeSlot, booking)}
                                            >
                                                {booking ? (
                                                    <>
                                                        {isFirstSlot && (
                                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 
                                                                          bg-white px-2 py-1 rounded-full text-xs shadow-sm 
                                                                          whitespace-nowrap">
                                                                {booking.purpose}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button
                                                                className="p-1 bg-blue-600 text-white rounded-full opacity-0 
                                                                           hover:bg-blue-700 group-hover:opacity-100 
                                                                           transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedBooking(booking);
                                                                }}
                                                            >
                                                                <Info size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : !isPast(startOfDay(day)) && (
                                                    <div className="absolute inset-0 flex items-center justify-center 
                                                                  opacity-0 hover:opacity-100 transition-opacity">
                                                        <Plus size={20} className="text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Monthly calendar view renderer
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
    });

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center font-medium text-sm py-2">
                            {day}
                        </div>
                    ))}

                    {calendarDays.map(day => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const hasBookings = normalizedBookings.some(booking =>
                            isSameDay(booking.date, day) && booking.venue === selectedVenue
                        );
                        
                        // Get the week days for the hovered date
                        const hoveredWeekDays = hoveredDate ? 
                            getWeekDays(hoveredDate).map(d => d.getTime()) : [];
                        
                        // Check if this day is in the hovered week
                        const isInHoveredWeek = hoveredWeekDays.includes(day.getTime());

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDateClick(day)}
                                onMouseEnter={() => setHoveredDate(day)}
                                onMouseLeave={() => setHoveredDate(null)}
                                disabled={isPast(startOfDay(day))}
                                className={`
                                    p-2 rounded-lg relative
                                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                                    ${isToday(day) ? 'bg-blue-100' : ''} 
                                    ${hasBookings ? 'bg-blue-50' : ''}
                                    ${isInHoveredWeek ? 'bg-gray-100' : ''}
                                    ${isPast(startOfDay(day)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                                    transition-colors duration-150
                                `}
                            >
                                <span className="text-sm">{format(day, 'd')}</span>
                                {hasBookings && (
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedWeek && <WeeklyView />}
            {selectedBooking && (
                <BookingDetailsDialog
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
};

export default ResourceCalendar;
```


### File: components\resources\ResourceHistory.jsx
```
// src/components/resources/ResourceHistory.jsx
import React, { useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { format } from 'date-fns';

const ResourceHistory = ({ resourceId }) => {
  const [history] = useState([]);
  const [loading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');


  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || entry.action === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Actions</option>
          <option value="checkout">Checkouts</option>
          <option value="checkin">Check-ins</option>
          <option value="maintenance">Maintenance</option>
          <option value="booking">Bookings</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    entry.action === 'checkout' ? 'bg-yellow-100 text-yellow-800' :
                    entry.action === 'checkin' ? 'bg-green-100 text-green-800' :
                    entry.action === 'maintenance' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.action}
                  </span>
                  <p className="mt-2">{entry.details}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-1" />
                  {format(new Date(entry.timestamp.seconds * 1000), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceHistory;
```


### File: components\resources\ResourcesAllocation.jsx
```
const ResourceAllocation = () => {
    const resources = [
      { name: '3D Printer', status: 'available', nextAvailable: 'Now' },
      { name: 'Workshop Space', status: 'in-use', nextAvailable: '2 hours' },
      { name: 'Testing Equipment', status: 'maintenance', nextAvailable: 'Tomorrow' }
    ];
  
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Resource Allocation</h3>
          <button className="text-blue-600 hover:underline">Manage Resources</button>
        </div>
        <div className="space-y-4">
          {resources.map(resource => (
            <div key={resource.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{resource.name}</p>
                <p className="text-sm text-gray-500">Next Available: {resource.nextAvailable}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                resource.status === 'available' ? 'bg-green-100 text-green-800' :
                resource.status === 'in-use' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
```


### File: components\resources\SoftwareSection.jsx
```
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { resourceService } from '../../services/resourceService';
import ResourceActionControls from './ResourceActionControls';

const SoftwareSection = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSoftware();
  }, []);

  const loadSoftware = async () => {
    try {
      setLoading(true);
      const items = await resourceService.getResources('software');
      setSoftware(items);
    } catch (error) {
      console.error('Error loading software:', error);
      toast.error('Failed to load software items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSoftware = async (softwareId) => {
    try {
      await resourceService.deleteResource('software', softwareId);
      setSoftware(prev => prev.filter(item => item.id !== softwareId));
    } catch (error) {
      console.error('Error deleting software:', error);
      throw error;
    }
  };

  const handleUpdateSoftware = (updatedItem) => {
    setSoftware(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const filteredSoftware = software.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Software Licenses</h2>
        {hasPermission('canManageResources') && (
          <button
            onClick={() => {/* Open add software modal */}}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Software
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Software Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSoftware.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                item.status === 'available' ? 'bg-green-100 text-green-800' :
                item.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.status}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Available Licenses:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">License Type:</span>
                <span className="font-medium">{item.licenseType}</span>
              </div>
              {item.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <ResourceActionControls
                resource={item}
                type="software"
                onDelete={handleDeleteSoftware}
                onUpdate={handleUpdateSoftware}
                userRole={user?.role}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftwareSection;
```


## Directory: components\shared


### File: components\shared\Button.jsx
```
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseStyles = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```


### File: components\shared\Card.jsx
```
import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
```


### File: components\shared\Modal.jsx
```
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
```


## Directory: components\team


### File: components\team\DeleteConfirmationModal.jsx
```
// Path: src/components/team/DeleteConfirmationModal.jsx
import React from 'react';
import { AlertCircle, User } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, memberName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold">Make Account Dormant</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to make <span className="font-semibold">{memberName}</span>'s account dormant? 
          They will no longer appear in the team listing, but their data will be preserved.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <User size={16} />
            Make Dormant
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
```


### File: components\team\TeamManagement.jsx
```
const TeamManagement = () => {
    const teamMembers = [
      { name: 'John Doe', role: 'Technical Lead', projects: ['Voice Training', 'EnergyOpt'] },
      { name: 'Jane Smith', role: 'Developer', projects: ['Eco-Points'] },
      { name: 'Mike Johnson', role: 'Business Analyst', projects: ['Voice Training'] }
    ];
  
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Add Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map(member => (
                <tr key={member.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {member.projects.map(project => (
                        <span key={project} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {project}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
```


### File: components\team\TeamMemberCard.jsx
```
import React from 'react';
import { Mail, Phone, User, Briefcase, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeamMemberCard = ({ member, onDelete, onAssignTask }) => {
  const { hasPermission } = useAuth();
  const canManageUsers = hasPermission('canManageUsers');
  const canAssignTasks = hasPermission('canManageContent') || hasPermission('canManageUsers');
  
  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = typeof timestamp === 'string' 
        ? new Date(timestamp) 
        : timestamp?.toDate ? timestamp.toDate() : new Date();
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get first letters for avatar
  const getInitials = (name) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Style based on role
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-orange-100 text-orange-800';
      case 'project_member': return 'bg-green-100 text-green-800';
      case 'resource_manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format role for display
  const formatRole = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            {getInitials(member.name)}
          </div>
          <div>
            <h3 className="font-semibold">{member.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getRoleColor(member.role)}`}>
              {formatRole(member.role)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAssignTasks && (
            <button
              onClick={() => onAssignTask(member)}
              className="p-2 hover:bg-blue-100 rounded-full text-blue-600"
              title="Assign Task"
            >
              <Briefcase className="w-4 h-4" />
            </button>
          )}
          {canManageUsers && (
            <button
              onClick={() => onDelete(member)}
              className="p-2 hover:bg-orange-100 rounded-full text-orange-600"
              title="Make Account Dormant"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {member.email}
        </div>
        {member.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {member.phone}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          {member.projects?.length || 0} Active Projects
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Joined: {formatDate(member.createdAt || member.approvedAt)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          Last active: {formatDate(member.lastActivityAt || member.lastLoginAt || member.updatedAt)}
        </div>
        {member.activity && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            Activity: {member.activity}
          </div>
        )}
      </div>

      {member.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {member.skills.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {member.status === 'onLeave' && (
        <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
          Currently on leave
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
```


### File: components\team\TeamMemberModal.jsx
```
import React, { useState, useEffect } from 'react';
import { X, Plus, X as XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeamMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const { hasPermission } = useAuth();
  const canManageUsers = hasPermission('canManageUsers');
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'active',
    skills: []
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        // If editing as admin, allow role change, otherwise use current role
        role: member.role || '',
        email: member.email || '',
        phone: member.phone || '',
        status: member.status || 'active',
        skills: member.skills || []
      });
    } else {
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'active',
        skills: []
      });
    }
  }, [member, canManageUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!isOpen) return null;

  // List of available roles (only shown to admins)
  const availableRoles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'instructor', name: 'Instructor' },
    { id: 'supervisor', name: 'Supervisor' },
    { id: 'project_member', name: 'Project Member' },
    { id: 'resource_manager', name: 'Resource Manager' },
    { id: 'community_member', name: 'Community Member' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {member ? 'Edit Team Member Profile' : 'Add Team Member'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              {canManageUsers ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${!canManageUsers ? 'bg-gray-50' : 'focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                required
                disabled={!canManageUsers} // Only admins can change emails
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="onLeave">On Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-blue-100 rounded-full p-1"
                  >
                    <XIcon size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {member ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberModal;
```


## Directory: components\tracking


### File: components\tracking\KPIDisplay.jsx
```
import React from 'react';
import { LineChart } from 'recharts';

export default function KPIDisplay({ projectId }) {
  const project = useProjectStore(state => 
    state.projects.find(p => p.id === projectId)
  );

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Project KPIs</h3>
      <div className="space-y-4">
        {/* KPI Charts */}
        <LineChart width={600} height={300} data={project.kpis}>
          {/* Chart configuration */}
        </LineChart>
      </div>
    </div>
  );
}
```


### File: components\tracking\KPITracking.jsx
```
const KPITracking = ({ projectId }) => {
    const kpiData = [
      {
        category: 'Technical',
        metrics: [
          { name: 'Completion Rate', value: 85, target: 90 },
          { name: 'Code Quality', value: 92, target: 95 },
          { name: 'Bug Resolution', value: 88, target: 85 }
        ]
      },
      {
        category: 'Business',
        metrics: [
          { name: 'User Growth', value: 78, target: 80 },
          { name: 'Revenue', value: 65, target: 75 },
          { name: 'Customer Satisfaction', value: 90, target: 85 }
        ]
      }
    ];
  
    return (
      <div className="space-y-6">
        {kpiData.map(category => (
          <div key={category.category} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">{category.category} KPIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.metrics.map(metric => (
                <div key={metric.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{metric.name}</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      metric.value >= metric.target 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2" 
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Target: {metric.target}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
```


### File: components\tracking\ProgressCharts.jsx
```
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '../shared/Card';

const ProgressCharts = ({ data }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
      <div className="h-64">
        <LineChart width={600} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="progress" stroke="#2563eb" />
          <Line type="monotone" dataKey="target" stroke="#16a34a" />
        </LineChart>
      </div>
    </Card>
  );
};

export default ProgressCharts;
```


### File: components\tracking\Timeline.jsx
```
const Timeline = ({ project }) => {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="relative">
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start mb-4">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-4 h-4 rounded-full ${
                  milestone.status === 'completed' 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`} />
                {index < project.milestones.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300" />
                )}
              </div>
              <div>
                <h4 className="font-medium">{milestone.name}</h4>
                <p className="text-sm text-gray-500">{milestone.dueDate}</p>
                <p className="text-sm mt-1">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
```


## Directory: components\training


### File: components\training\GroupSelection.jsx
```
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Users, 
  Plus,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Book 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GroupSelection = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingMembers, setPendingMembers] = useState({});
  const [approvedMembers, setApprovedMembers] = useState({});
  const [selectedTab, setSelectedTab] = useState('groups');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsRef = collection(db, 'trainingGroups');
      const snapshot = await getDocs(groupsRef);
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load members for each group
      const membersData = {};
      const approvedData = {};

      for (const group of groupsData) {
        const [pending, approved] = await Promise.all([
          loadPendingMembers(group.id),
          loadApprovedMembers(group.id)
        ]);
        membersData[group.id] = pending;
        approvedData[group.id] = approved;
      }

      setGroups(groupsData);
      setPendingMembers(membersData);
      setApprovedMembers(approvedData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load groups and members');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingMembers = async (groupId) => {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('assignedGroup', '==', groupId),
      where('groupStatus', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const loadApprovedMembers = async (groupId) => {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('assignedGroup', '==', groupId),
      where('groupStatus', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const handleApproveMember = async (groupId, userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        groupStatus: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid
      });

      toast.success('Member approved successfully');
      loadData(); // Reload data to update UI
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    }
  };

  const handleRejectMember = async (groupId, userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        assignedGroup: null,
        groupStatus: null
      });

      toast.success('Member rejected');
      loadData(); // Reload data to update UI
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Training Management</h2>
          <p className="text-gray-500 mt-1">Manage training groups and members</p>
        </div>
        {hasPermission('canManageContent') && (
          <button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Group
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      {hasPermission('canManageContent') && (
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setSelectedTab('groups')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              selectedTab === 'groups' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <Users size={20} />
            Groups
          </button>
          <button
            onClick={() => setSelectedTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              selectedTab === 'approvals' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <UserCheck size={20} />
            Pending Approvals
            {Object.values(pendingMembers).flat().length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                {Object.values(pendingMembers).flat().length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main content area */}
      {selectedTab === 'groups' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <p className="text-gray-600 mt-1">{group.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      {approvedMembers[group.id]?.length || 0} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Book size={16} />
                      {group.tasks?.length || 0} tasks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => {
            const pending = pendingMembers[group.id] || [];
            if (pending.length === 0) return null;

            return (
              <div key={group.id} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-gray-500">
                    {pending.length} pending approval{pending.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  {pending.map(member => (
                    <div 
                      key={member.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-sm text-gray-500">
                          Requested: {new Date(member.requestedAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveMember(group.id, member.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                        >
                          <UserCheck size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMember(group.id, member.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <UserX size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.values(pendingMembers).flat().length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <AlertCircle size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600">No pending approvals</p>
            </div>
          )}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const groupsRef = collection(db, 'trainingGroups');
                await addDoc(groupsRef, {
                  ...newGroup,
                  createdBy: user.uid,
                  createdAt: serverTimestamp()
                });
                toast.success('Group created successfully');
                setShowAddGroup(false);
                setNewGroup({ name: '', description: '' });
                loadData();
              } catch (error) {
                console.error('Error creating group:', error);
                toast.error('Failed to create group');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGroup(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSelection;
```


### File: components\training\TaskCreationForm copy.jsx
```
// components/training/TaskCreationForm.jsx
import React, { useState } from 'react';
import { Plus, X, Link as LinkIcon, FileText, Youtube, MessageSquare, Calendar } from 'lucide-react';

const ReadingSection = ({ content, onUpdate, onDelete }) => {
  const addResource = (e) => {
    e.preventDefault(); // Prevent form submission
    const newResources = [...(content.resources || []), { type: 'video', url: '' }];
    onUpdate({ ...content, resources: newResources });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">Reading Section</h4>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded-full text-red-600"
        >
          <X size={16} />
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onUpdate({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Section title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Details</label>
        <textarea
          value={content.details || ''}
          onChange={(e) => onUpdate({ ...content, details: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          placeholder="Enter reading material content"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Resources</label>
        {content.resources?.map((resource, index) => (
          <div key={index} className="flex gap-2 items-start">
            <select
              value={resource.type}
              onChange={(e) => {
                const newResources = [...(content.resources || [])];
                newResources[index] = { ...resource, type: e.target.value };
                onUpdate({ ...content, resources: newResources });
              }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="link">External Link</option>
            </select>
            <input
              type="text"
              value={resource.url}
              onChange={(e) => {
                const newResources = [...(content.resources || [])];
                newResources[index] = { ...resource, url: e.target.value };
                onUpdate({ ...content, resources: newResources });
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder={`Enter ${resource.type} URL`}
            />
            <button
              onClick={() => {
                const newResources = content.resources.filter((_, i) => i !== index);
                onUpdate({ ...content, resources: newResources });
              }}
              className="p-2 hover:bg-red-100 rounded-full text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <button
          type="button" // Explicitly set button type to prevent form submission
          onClick={addResource}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>
    </div>
  );
};

const SubmissionField = ({ field, onUpdate, onDelete }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium">Submission Field</h4>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded-full text-red-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Field Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter field label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Field Type</label>
          <select
            value={field.type}
            onChange={(e) => onUpdate({ ...field, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="text">Text Input</option>
            <option value="textarea">Long Text</option>
            <option value="link">Link/URL</option>
            <option value="file">File Upload</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={field.description}
            onChange={(e) => onUpdate({ ...field, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
            placeholder="Enter field description or instructions"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor={`required-${field.id}`} className="text-sm">
            Required field
          </label>
        </div>
      </div>
    </div>
  );
};

const TaskCreationForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [taskData, setTaskData] = useState(initialData || {
    title: '',
    description: '',
    type: 'reading',
    dueDate: '',
    content: [],
    submissionFields: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate due date
    const dueDate = new Date(formData.dueDate);
    if (isNaN(dueDate.getTime())) {
      toast.error('Please enter a valid due date');
      return;
    }
  
    onSubmit({
      ...formData,
      dueDate
    });
  };

  const addReadingSection = () => {
    setTaskData(prev => ({
      ...prev,
      content: [...(prev.content || []), {
        title: '',
        details: '',
        resources: []
      }]
    }));
  };

  const addSubmissionField = () => {
    setTaskData(prev => ({
      ...prev,
      submissionFields: [...(prev.submissionFields || []), {
        id: Date.now(),
        label: '',
        type: 'text',
        description: '',
        required: false
      }]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={taskData.dueDate}
            onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Task Type</label>
        <select
          value={taskData.type}
          onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="reading">Give Reading Material</option>
          <option value="submission">Request Team Submission</option>
        </select>
      </div>

      {taskData.type === 'reading' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Reading Materials</h3>
            <button
              type="button"
              onClick={addReadingSection}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>

          <div className="space-y-4">
            {taskData.content?.map((section, index) => (
              <ReadingSection
                key={index}
                content={section}
                onUpdate={(updatedSection) => {
                  const newContent = [...taskData.content];
                  newContent[index] = updatedSection;
                  setTaskData({ ...taskData, content: newContent });
                }}
                onDelete={() => {
                  const newContent = taskData.content.filter((_, i) => i !== index);
                  setTaskData({ ...taskData, content: newContent });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {taskData.type === 'submission' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Submission Fields</h3>
            <button
              type="button"
              onClick={addSubmissionField}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Field
            </button>
          </div>

          <div className="space-y-4">
            {taskData.submissionFields?.map((field, index) => (
              <SubmissionField
                key={field.id}
                field={field}
                onUpdate={(updatedField) => {
                  const newFields = [...taskData.submissionFields];
                  newFields[index] = updatedField;
                  setTaskData({ ...taskData, submissionFields: newFields });
                }}
                onDelete={() => {
                  const newFields = taskData.submissionFields.filter((_, i) => i !== index);
                  setTaskData({ ...taskData, submissionFields: newFields });
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskCreationForm;
```


### File: components\training\TaskCreationForm.jsx
```
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TaskCreationForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reading',
    dueDate: '',
    content: [],
    submissionFields: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate due date
    const dueDate = new Date(formData.dueDate);
    if (isNaN(dueDate.getTime())) {
      toast.error('Please enter a valid due date');
      return;
    }

    onSubmit({
      ...formData,
      dueDate
    });
  };

  const addContent = () => {
    setFormData(prev => ({
      ...prev,
      content: [
        ...prev.content,
        {
          title: '',
          details: '',
          resources: []
        }
      ]
    }));
  };

  const updateContent = (index, updatedContent) => {
    const newContent = [...formData.content];
    newContent[index] = updatedContent;
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const removeContent = (index) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const addSubmissionField = () => {
    setFormData(prev => ({
      ...prev,
      submissionFields: [
        ...prev.submissionFields,
        {
          id: Date.now().toString(),
          label: '',
          type: 'text',
          required: false,
          description: ''
        }
      ]
    }));
  };

  const updateSubmissionField = (index, updates) => {
    const newFields = [...formData.submissionFields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData(prev => ({ ...prev, submissionFields: newFields }));
  };

  const removeSubmissionField = (index) => {
    setFormData(prev => ({
      ...prev,
      submissionFields: prev.submissionFields.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Task Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="reading">Reading Material</option>
            <option value="submission">Team Submission</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Reading Material Content */}
      {formData.type === 'reading' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Content Sections</h3>
            <button
              type="button"
              onClick={addContent}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>
          {formData.content.map((section, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-4">
                <h4 className="font-medium">Section {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeContent(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => updateContent(index, { ...section, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Section Content"
                  value={section.details}
                  onChange={(e) => updateContent(index, { ...section, details: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Fields */}
      {formData.type === 'submission' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Submission Fields</h3>
            <button
              type="button"
              onClick={addSubmissionField}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Field
            </button>
          </div>
          {formData.submissionFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-4">
                <h4 className="font-medium">Field {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeSubmissionField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Field Label"
                  value={field.label}
                  onChange={(e) => updateSubmissionField(index, { label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateSubmissionField(index, { type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Long Text</option>
                  <option value="link">Link/URL</option>
                  <option value="file">File Upload</option>
                  <option value="date">Date</option>
                </select>
                <textarea
                  placeholder="Field Description"
                  value={field.description}
                  onChange={(e) => updateSubmissionField(index, { description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateSubmissionField(index, { required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Required field</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskCreationForm;
```


### File: components\training\TaskSubmission.jsx
```
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TaskSubmission = ({ task, submissions, onSubmit }) => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userProject, setUserProject] = useState(null);

  useEffect(() => {
    // Check if user has already submitted
    const userSubmission = submissions?.find(s => s.userId === user?.uid);
    setHasSubmitted(!!userSubmission);

    // Get user's project assignment
    const loadUserProject = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserProject(userDoc.data()?.assignedProject || null);
      } catch (error) {
        console.error('Error loading user project:', error);
      }
    };

    if (user) {
      loadUserProject();
    }
  }, [user, submissions]);

  // Check if user is admin or instructor
  const isAdminOrInstructor = hasPermission('canManageContent');
  
  // Check if user is a project member and belongs to the correct project
  const canSubmit = !isAdminOrInstructor && 
  user?.role === 'project_member' && 
  userProject === task.projectId &&
  user?.groupStatus === 'approved';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
      setHasSubmitted(true);
      toast.success('Response submitted successfully');
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  // Render submission status for admin/instructor
  if (isAdminOrInstructor) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Submission Status</h3>
        {submissions?.length > 0 ? (
          <div className="space-y-2">
            {submissions.map((submission, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <span className="font-medium">{submission.submitter?.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle size={20} />
            <span>No submissions yet</span>
          </div>
        )}
      </div>
    );
  }

  // Render submission form for project members
  if (!canSubmit) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle size={20} />
          <span>You don't have permission to submit responses for this task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {hasSubmitted ? (
        <div className="p-4 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          <span>Response submitted successfully</span>
        </div>
      ) : (
        <div className="space-y-4">
          {task.submissionFields?.map((field) => (
            <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">{field.label}</span>
                {field.required && (
                  <span className="text-red-500 text-sm">*Required</span>
                )}
              </div>
              {field.description && (
                <p className="text-sm text-gray-600 mt-1">{field.description}</p>
              )}
              <div className="mt-2">
                {field.type === 'link' ? (
                  <input
                    type="url"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    placeholder="Enter URL"
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white opacity-50 cursor-not-allowed"
                    placeholder="This field type is not available"
                    disabled
                  />
                )}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit Response
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskSubmission;
```


## Directory: contexts


### File: contexts\AuthContext.jsx
```
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRoleId = userData.role;
            
            // Set the user role
            setUserRole(userRoleId);
            
            // Get role permissions
            if (userRoleId) {
              const roleDoc = await getDoc(doc(db, 'roles', userRoleId));
              
              if (roleDoc.exists()) {
                const roleData = roleDoc.data();
                setRolePermissions(roleData.permissions || {});
                
                // Set user with role data
                setUser({
                  ...user,
                  name: userData.name,
                  role: userRoleId,
                  status: userData.status,
                  isAdmin: userRoleId === 'admin'
                });
              } else {
                console.warn(`Role document ${userRoleId} not found`);
                setRolePermissions({});
              }
            }
          } else {
            console.warn('User document not found in Firestore');
            setUser(user);
            setUserRole(null);
            setRolePermissions({});
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(user);
          setUserRole(null);
          setRolePermissions({});
        }
      } else {
        setUser(null);
        setUserRole(null);
        setRolePermissions({});
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      
      // Check account status
      if (userData.status === 'pending') {
        throw new Error('Your account is pending approval');
      } else if (userData.status === 'dormant' || userData.status === 'suspended') {
        throw new Error('Your account has been deactivated');
      }

      setUserRole(userData.role);
      
      // Get role permissions
      if (userData.role) {
        const roleDoc = await getDoc(doc(db, 'roles', userData.role));
        
        if (roleDoc.exists()) {
          setRolePermissions(roleDoc.data().permissions || {});
        }
      }
      
      toast.success('Logged in successfully');
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setRolePermissions({});
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  };

  // Check if user has specific permission
  const hasPermission = (permissionId) => {
    // Admins always have all permissions
    if (userRole === 'admin') return true;
    
    // Check the loaded role permissions
    return rolePermissions[permissionId] === true;
  };

  // Get all available roles
  const getRoles = async () => {
    try {
      const rolesRef = collection(db, 'roles');
      const snapshot = await getDocs(rolesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRoleId) => {
    try {
      // Verify the role exists
      const roleDoc = await getDoc(doc(db, 'roles', newRoleId));
      
      if (!roleDoc.exists()) {
        throw new Error(`Role ${newRoleId} does not exist`);
      }
      
      // Update user document
      await setDoc(doc(db, 'users', userId), {
        role: newRoleId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success('User role updated successfully');
      
      // If updating current user, refresh role permissions
      if (user && user.uid === userId) {
        setUserRole(newRoleId);
        setRolePermissions(roleDoc.data().permissions || {});
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    login,
    logout,
    hasPermission,
    getRoles,
    updateUserRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```


### File: contexts\FirebaseContext.js
```
// src/contexts/FirebaseContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';

// Initialize Context
const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser({
              ...user,
              ...userDoc.data()
            });
          } else {
            console.warn('User document not found in Firestore');
            setUser(user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up new user
  const signup = async (email, password, userData) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Determine initial role based on email domain
      let role = 'community_member';
      const emailDomain = email.split('@')[1];
      
      if (emailDomain === 'instructor.edu') {
        role = 'instructor';
      } else if (emailDomain === 'supervisor.org') {
        role = 'supervisor';
      } else if (emailDomain === 'project.com') {
        role = 'project_member';
      }

      // Create user profile
      const userProfile = {
        ...userData,
        uid: userCredential.user.uid,
        email,
        role,
        status: role === 'instructor' ? 'pending' : 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save profile to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      // Create notification for instructor approval
      if (role === 'instructor') {
        await addDoc(collection(db, 'notifications'), {
          type: 'new_instructor',
          userId: userCredential.user.uid,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        toast.success('Account created! Awaiting admin approval.');
      } else {
        toast.success('Account created successfully!');
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      
      // Check account status
      if (userData.status === 'pending') {
        throw new Error('Your account is pending approval');
      } else if (userData.status === 'suspended') {
        throw new Error('Your account has been suspended');
      }

      setUser({
        ...userCredential.user,
        ...userData
      });

      // Update last login timestamp
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date().toISOString()
      });

      toast.success('Logged in successfully');
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Sign out user
  const logout = async () => {
    try {
      // Update last activity timestamp before logging out
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          lastActivityAt: new Date().toISOString()
        });
      }

      await signOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Update email if provided
      if (updates.email && user?.email !== updates.email) {
        await updateEmail(auth.currentUser, updates.email);
      }

      // Update password if provided
      if (updates.newPassword) {
        await updatePassword(auth.currentUser, updates.newPassword);
        delete updates.newPassword; // Don't store password in Firestore
      }

      // Update Firestore profile
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Update local user state if it's the current user
      if (user?.uid === userId) {
        setUser(prev => ({
          ...prev,
          ...updates
        }));
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Get user by ID
  const getUserById = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete auth user
      await user.delete();
      
      setUser(null);
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    getUserById,
    deleteAccount
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};

// Custom hook for using Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export default FirebaseProvider;
```


### File: contexts\ProjectContext.jsx
```
import React, { createContext, useContext } from 'react';
import { useProjectStore } from '../stores/projectsSlice';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const projectStore = useProjectStore();

  return (
    <ProjectContext.Provider value={projectStore}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
```


## Directory: firebase


### File: firebase\config.js
```
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```


### File: firebase\initializeDatabase.js
```
// src/firebase/initializeDatabase.js
import { setupRoles } from './setupRoles';

// Function to initialize your database
const initializeDatabase = async () => {
  console.log('Starting database initialization...');
  
  // Set up roles
  await setupRoles();
  
  console.log('Database initialization complete!');
};

export default initializeDatabase;
```


### File: firebase\setupRoles.js
```
// src/firebase/setupRoles.js
// Use this script to set up the initial roles in your Firebase database

import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Default roles with descriptions and initial permissions
const defaultRoles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: {
      // All permissions set to true by default for admin
    }
  },
  {
    id: 'instructor',
    name: 'Instructor',
    description: 'Creates and manages training content and mentors team members',
    isSystem: true,
    permissions: {
      // Dashboard permissions
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      
      // Projects permissions
      'projects.view': true,
      
      // Team permissions
      'team.view': true,
      'team.assignTasks': true,
      
      // Resources permissions
      'resources.view': true,
      'resources.book': true,
      
      // Training permissions
      'training.view': true,
      'training.createMaterial': true,
      'training.createTask': true,
      'training.viewSubmissions': true,
      
      // Reports permissions
      'reports.view': true,
      
      // Tasks permissions
      'tasks.view': true,
      'tasks.create': true,
      'tasks.viewAll': true,
      
      // Admin permissions
      'admin.approveMembers': false,
      'admin.managePermissions': false,
      'admin.viewSystemLogs': false
    }
  },
  {
    id: 'project_member',
    name: 'Project Member',
    description: 'Works on projects and completes assigned tasks',
    isSystem: true,
    permissions: {
      // Dashboard permissions
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      
      // Projects permissions
      'projects.view': true,
      
      // Team permissions
      'team.view': true,
      
      // Resources permissions
      'resources.view': true,
      'resources.book': true,
      
      // Training permissions
      'training.view': true,
      'training.submitResponse': true,
      
      // Tasks permissions
      'tasks.view': true,
      'tasks.complete': true
    }
  },
  {
    id: 'resource_manager',
    name: 'Resource Manager',
    description: 'Manages hardware, software and venue resources',
    isSystem: true,
    permissions: {
      // Dashboard permissions
      'dashboard.view': true,
      
      // Resources permissions
      'resources.view': true,
      'resources.addHardware': true,
      'resources.addSoftware': true,
      'resources.book': true,
      'resources.editQuantity': true,
      
      // Reports permissions
      'reports.view': true
    }
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Oversees projects and manages team activities',
    isSystem: true,
    permissions: {
      // Dashboard permissions
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      
      // Projects permissions
      'projects.view': true,
      'projects.create': true,
      'projects.edit': true,
      
      // Team permissions
      'team.view': true,
      'team.addMember': true,
      'team.editMember': true,
      'team.assignTasks': true,
      
      // Resources permissions
      'resources.view': true,
      'resources.book': true,
      
      // Training permissions
      'training.view': true,
      'training.viewSubmissions': true,
      
      // Reports permissions
      'reports.view': true,
      'reports.export': true,
      
      // Tasks permissions
      'tasks.view': true,
      'tasks.create': true,
      'tasks.viewAll': true,
      
      // Admin permissions
      'admin.approveMembers': true
    }
  },
  {
    id: 'community_member',
    name: 'Community Member',
    description: 'Basic access to view resources and participate in training',
    isSystem: true,
    permissions: {
      // Dashboard permissions
      'dashboard.view': true,
      
      // Resources permissions
      'resources.view': true,
      'resources.book': true,
      
      // Training permissions
      'training.view': true,
      'training.submitResponse': true,
      
      // Tasks permissions
      'tasks.view': true,
      'tasks.complete': true
    }
  }
];

// Set up all roles in Firestore
export const setupRoles = async () => {
  try {
    const rolesCollection = collection(db, 'roles');
    
    for (const role of defaultRoles) {
      const roleRef = doc(rolesCollection, role.id);
      
      // Check if role already exists
      const existingRole = await getDoc(roleRef);
      
      if (!existingRole.exists()) {
        // Add timestamp
        const roleData = {
          ...role,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(roleRef, roleData);
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }
    
    console.log('Role setup complete!');
  } catch (error) {
    console.error('Error setting up roles:', error);
  }
};

// Function to update existing user's role in the system
export const updateUserRole = async (userId, roleId) => {
  try {
    // Validate the role exists
    const roleRef = doc(db, 'roles', roleId);
    const roleDoc = await getDoc(roleRef);
    
    if (!roleDoc.exists()) {
      throw new Error(`Role ${roleId} does not exist`);
    }
    
    // Update user's role
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role: roleId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Updated user ${userId} to role: ${roleId}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};
```


### File: firebase\storageConfig.js
```
// src/firebase/storageConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const storageConfig = {
  apiKey: "AIzaSyD2ae7jW_1RF6m6225QsiYtgXfwW0W_rJI",
  authDomain: "back-7250a.firebaseapp.com",
  databaseURL: "https://back-7250a-default-rtdb.firebaseio.com",
  projectId: "back-7250a",
  storageBucket: "back-7250a.appspot.com",
  messagingSenderId: "132243534371",
  appId: "1:132243534371:web:ddba0a7de32e4f5ccd7796",
  measurementId: "G-6W7J5TGRKL"
};

const storageApp = initializeApp(storageConfig, 'storage');
export const storage = getStorage(storageApp);

export const storageService = {
  uploadFile: async (file, path) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },
  
  deleteFile: async (path) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },
  
  getDownloadUrl: async (path) => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }
};
```


## Directory: hooks


### File: hooks\useFirebaseAuth.js
```
// src/hooks/useFirebaseAuth.js
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email, password) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout
  };
};
```


### File: hooks\useProjects.js
```

```


### File: hooks\useTracking.js
```

```


### File: index.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-100;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

```


### File: index.js
```
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```


## Directory: pages


### File: pages\Dashboard.jsx
```
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';
import { collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Users,
  Folder,
  CheckCircle,
  Activity,
  Clock,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, change, onClick }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {change && (
          <div className={`flex items-center mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activitiesRef = collection(db, 'activities');
        const snapshot = await getDocs(activitiesRef);

        const activitiesData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            return {
              id: doc.id,
              ...data,
              user: userDoc.exists() ? {
                name: userDoc.data().name,
                role: userDoc.data().role
              } : null
            };
          })
        );

        setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow">
          <div className="p-2 bg-gray-100 rounded-full">
            <Clock size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(activity.timestamp?.toDate()), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      ))}
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const [stats, setStats] = useState({
    activeProjects: 0,
    teamMembers: 0,
    taskCompletion: 0,
    resourceUtilization: 0
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load pending approvals count for admin
        if (isAdmin) {
          const pendingSnapshot = await getDocs(collection(db, 'usersWaitingApproval'));
          setPendingCount(pendingSnapshot.size);
        }

        // Load other dashboard data
        const projectsRef = collection(db, 'projects');
        const teamRef = collection(db, 'team');
        
        const [projectsSnapshot, teamSnapshot] = await Promise.all([
          getDocs(projectsRef),
          getDocs(teamRef)
        ]);

        setStats({
          activeProjects: projectsSnapshot.size,
          teamMembers: teamSnapshot.size,
          taskCompletion: 75,
          resourceUtilization: 80
        });
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
  }, [user, isAdmin]);

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
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={Folder}
          color="bg-blue-500"
          change={12}
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          icon={Users}
          color="bg-green-500"
          change={5}
          onClick={() => navigate('/team')}
        />
        <StatCard
          title="Task Completion"
          value={`${stats.taskCompletion}%`}
          icon={CheckCircle}
          color="bg-purple-500"
          change={8}
        />
        <StatCard
          title="Resource Utilization"
          value={`${stats.resourceUtilization}%`}
          icon={Activity}
          color="bg-yellow-500"
          change={-3}
          onClick={() => navigate('/resources')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Project Progress</h2>
            <select className="px-3 py-1 border rounded-lg text-sm">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', completed: 65, planned: 60 },
                { name: 'Tue', completed: 68, planned: 65 },
                { name: 'Wed', completed: 75, planned: 70 },
                { name: 'Thu', completed: 78, planned: 75 },
                { name: 'Fri', completed: 82, planned: 80 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#3B82F6" name="Completed Tasks" />
                <Line type="monotone" dataKey="planned" stroke="#10B981" name="Planned" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```


### File: pages\DatabaseSetup.jsx
```
// src/pages/DatabaseSetup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setupRoles, updateUserRole } from '../firebase/setupRoles';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { Shield, AlertTriangle, Database, RefreshCw, Users } from 'lucide-react';

const DatabaseSetup = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [roleCount, setRoleCount] = useState(0);
  
  useEffect(() => {
    if (!user || !hasPermission('admin.managePermissions')) {
      navigate('/');
      return;
    }
    
    // Get stats
    const loadStats = async () => {
      try {
        const [usersSnapshot, rolesSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'roles'))
        ]);
        
        setUserCount(usersSnapshot.size);
        setRoleCount(rolesSnapshot.size);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, [user, hasPermission, navigate]);
  
  const handleSetupRoles = async () => {
    try {
      setLoading(true);
      await setupRoles();
      toast.success('Roles set up successfully');
      
      // Refresh stats
      const rolesSnapshot = await getDocs(collection(db, 'roles'));
      setRoleCount(rolesSnapshot.size);
    } catch (error) {
      console.error('Error setting up roles:', error);
      toast.error('Failed to set up roles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetAdminRole = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await updateUserRole(user.uid, 'admin');
      toast.success('Your account has been set as Admin');
    } catch (error) {
      console.error('Error setting admin role:', error);
      toast.error('Failed to set admin role');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          Database Setup
        </h1>
        <p className="text-gray-500 mt-1">
          Initialize and configure your system database
        </p>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-800">Warning: Setup Operations</h3>
            <p className="text-sm text-yellow-700 mt-1">
              These operations will modify your database structure and may overwrite existing data.
              Only run these operations during initial setup or when you understand the implications.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Role System
          </h2>
          <p className="text-gray-600 mb-4">
            Initialize the role-based permission system with default roles.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Existing roles:</span>
              <span className="font-medium">{roleCount}</span>
            </div>
          </div>
          
          <button
            onClick={handleSetupRoles}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                {roleCount > 0 ? 'Rebuild Roles' : 'Setup Roles'}
              </>
            )}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Admin Access
          </h2>
          <p className="text-gray-600 mb-4">
            Assign yourself the Administrator role to manage the system.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Current role:</span>
              <span className="font-medium">{user?.role || 'None'}</span>
            </div>
          </div>
          
          <button
            onClick={handleSetAdminRole}
            disabled={loading || user?.role === 'admin'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Setting role...
              </>
            ) : user?.role === 'admin' ? (
              'You are already an Admin'
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Make Me Admin
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Total users:</span>
            <span className="font-medium">{userCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Total roles:</span>
            <span className="font-medium">{roleCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Current user:</span>
            <span className="font-medium">{user?.email || 'Not logged in'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">User role:</span>
            <span className="font-medium">{user?.role || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
```


### File: pages\KanbanBoard.jsx
```
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Users, CheckCircle, Trash2, Edit, AlertCircle, 
         LayoutDashboard, ListTodo, Info, Clock, MessageSquare, 
         FileText, Link2, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../services/firebaseDb';

const TaskCard = ({ task, index, onEdit }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
          snapshot.isDragging ? 'shadow-lg' : ''
        }`}
        onClick={() => onEdit(task)}
      >
        {task.priority && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full w-fit mb-2 ${
            task.priority === 'high' ? 'bg-red-100 text-red-700' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </div>
        )}

        <h4 className="font-medium mb-2">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.checklist?.length > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle size={14} />
                <span>
                  {task.checklist.filter(item => item.checked).length}/{task.checklist.length}
                </span>
              </div>
            )}
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-blue-700 font-medium">
                  {task.assignee.name.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </Draggable>
);

const Column = ({ title, tasks, status, onAddTask, children }) => (
  <Droppable droppableId={status}>
    {(provided, snapshot) => (
      <div
        className={`flex flex-col w-80 bg-gray-50 rounded-lg p-4 ${
          snapshot.isDraggingOver ? 'bg-gray-100' : ''
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(status)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Plus size={20} />
          </button>
        </div>
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex-1 space-y-4"
        >
          {children}
          {provided.placeholder}
        </div>
      </div>
    )}
  </Droppable>
);

const TaskModal = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignee: null,
    checklist: [],
    comments: []
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const KanbanBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const projectTasks = await firebaseDb.getProjectTasks(projectId);
        setTasks(projectTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Drop outside the list
    if (!destination) return;

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Reorder tasks array
    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    const updatedTask = { ...removed, status: destination.droppableId };
    newTasks.splice(destination.index, 0, updatedTask);

    // Optimistic update
    setTasks(newTasks);

    try {
      // Update task status in Firebase
      await firebaseDb.updateTask(projectId, draggableId, {
        status: destination.droppableId
      });

      // Add activity
      await firebaseDb.addProjectActivity(projectId, {
        type: 'task_moved',
        description: `Task "${updatedTask.title}" moved to ${destination.droppableId}`,
        timestamp: new Date().toISOString()
      });

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      // Revert optimistic update on error
      setTasks(tasks);
    }
  };

  const handleAddTask = (status) => {
    setSelectedStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        await firebaseDb.updateTask(projectId, selectedTask.id, taskData);
        setTasks(tasks.map(task =>
          task.id === selectedTask.id ? { ...task, ...taskData } : task
        ));
        toast.success('Task updated successfully');
      } else {
        const newTask = await firebaseDb.createTask(projectId, {
          ...taskData,
          status: selectedStatus,
          createdAt: new Date().toISOString()
        });
        setTasks([...tasks, newTask]);
        toast.success('Task created successfully');
      }
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'inProgress'),
    review: tasks.filter(task => task.status === 'review'),
    done: tasks.filter(task => task.status === 'done')
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        <Column
          title="To Do"
          tasks={columns.todo}
          status="todo"
          onAddTask={handleAddTask}
        >
          {columns.todo.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
            />
          ))}
        </Column>

        <Column
          title="In Progress"
          tasks={columns.inProgress}
          status="inProgress"
          onAddTask={handleAddTask}
        >
          {columns.inProgress.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
            />
          ))}
        </Column>

        <Column
          title="Review"
          tasks={columns.review}
          status="review"
          onAddTask={handleAddTask}
        >
          {columns.review.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
            />
          ))}
        </Column>

        <Column
          title="Done"
          tasks={columns.done}
          status="done"
          onAddTask={handleAddTask}
        >
          {columns.done.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={handleEditTask}
            />
          ))}
        </Column>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </DragDropContext>
  );
};

export default KanbanBoard;
```


### File: pages\Login.jsx
```
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const handleOkayClick = () => {
    setShowApprovalDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is admin first
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        // Admin users can proceed directly
        toast.success('Signed in successfully');
        navigate('/');
        return;
      }

      // For non-admin users, check approval status
      const waitingRef = collection(db, 'usersWaitingApproval');
      const q = query(waitingRef, where('uid', '==', userCredential.user.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // User is still pending approval
        setShowApprovalDialog(true);
        // Sign out the user
        await auth.signOut();
        return;
      }

      // If not in waiting approval, check if they're in approved users
      const approvedRef = doc(db, 'users', userCredential.user.uid);
      const approvedDoc = await getDoc(approvedRef);

      if (approvedDoc.exists()) {
        // User is approved, allow login
        toast.success('Signed in successfully');
        navigate('/');
      } else {
        // User not found in either collection
        toast.error('Account not found or access denied');
        await auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Approval Pending Dialog
  const ApprovalDialog = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold">Approval Required</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Your account is pending administrator approval. You'll be notified once your account has been approved.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Okay, I'll wait
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to HUB Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up now
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Approval Dialog */}
        {showApprovalDialog && (
          <ApprovalDialog onClose={handleOkayClick} />
        )}
      </div>
    </div>
  );
};

export default Login;
```


### File: pages\MemberApprovalManagement.jsx
```
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { UserCheck, UserX, AlertCircle } from 'lucide-react';

const MemberApprovalManagement = ({ compact = false }) => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();

   // Check if user can approve members
   if (!hasPermission('canApproveMembers')) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        You don't have permission to manage member approvals.
      </div>
    );
  }
  
  // Add supervisor approvals section for admin only
  const renderSupervisorApprovals = () => {
    if (!hasPermission('canApproveSupervisors')) return null;
    
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Pending Supervisor Approvals</h2>
        {/* Similar approval UI but for supervisors */}
      </div>
    );
  };

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending members...'); // Debug log
      
      const pendingRef = collection(db, 'usersWaitingApproval');
      const snapshot = await getDocs(pendingRef);
      
      console.log('Snapshot empty?', snapshot.empty); // Debug log
      console.log('Number of docs:', snapshot.docs.length); // Debug log
      
      const members = snapshot.docs.map(doc => {
        console.log('Document ID (UID):', doc.id); // Debug log
        console.log('Document data:', doc.data()); // Debug log
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      
      console.log('Processed members:', members); // Debug log
      setPendingMembers(members);
    } catch (error) {
      console.error('Error loading pending members:', error);
      toast.error('Failed to load pending members');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (member) => {
    try {
      // Move member data to users collection with active status
      await setDoc(doc(db, 'users', member.uid), {
        ...member,
        status: 'active',
        approvedAt: serverTimestamp()
      });

      // Delete from waiting approval collection
      await deleteDoc(doc(db, 'usersWaitingApproval', member.id));
      
      toast.success('Member approved successfully');
      loadPendingMembers(); // Reload the list
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    }
  };

  const handleReject = async (member) => {
    try {
      // Delete from waiting approval collection
      await deleteDoc(doc(db, 'usersWaitingApproval', member.id));
      toast.success('Member rejected');
      loadPendingMembers(); // Reload the list
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const displayMembers = compact ? pendingMembers.slice(0, 3) : pendingMembers;

  return (
    <div className="space-y-4">
      {displayMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No pending approvals</p>
        </div>
      ) : (
        displayMembers.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {member.role}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Requested: {new Date(member.createdAt?.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(member)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                >
                  <UserCheck size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(member)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <UserX size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      {renderSupervisorApprovals()}
    </div>
  );
};

export default MemberApprovalManagement;
```


### File: pages\MemberApprovals.jsx
```
import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { UserCheck, UserX, Search, AlertCircle, User } from 'lucide-react';

const MemberApprovals = () => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      const pendingRef = collection(db, 'usersWaitingApproval');
      const snapshot = await getDocs(pendingRef);
      
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingMembers(members);
    } catch (error) {
      console.error('Error loading pending members:', error);
      toast.error('Failed to load pending members');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (member) => {
    try {
      // Move to users collection with active status
      await setDoc(doc(db, 'users', member.id), {
        ...member,
        status: 'active',
        approvedAt: serverTimestamp()
      });

      // Delete from waiting approval
      await deleteDoc(doc(db, 'usersWaitingApproval', member.id));
      
      toast.success('Member approved successfully');
      loadPendingMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    }
  };

  const handleReject = async (member) => {
    try {
      await deleteDoc(doc(db, 'usersWaitingApproval', member.id));
      toast.success('Member rejected');
      loadPendingMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member');
    }
  };

  const filteredMembers = pendingMembers.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Member Approvals</h1>
        <p className="text-gray-500 mt-1">Review and approve new member requests</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              {filteredMembers.length} pending
            </span>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No pending approvals found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMembers.map(member => (
              <div key={member.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {member.role}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Requested: {new Date(member.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(member)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <UserCheck size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(member)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <UserX size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberApprovals;
```


### File: pages\PermissionsControl.jsx
```
// src/pages/PermissionsControl.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';
import { Shield, Search, AlertCircle, Check, X, Info, UserCheck, Lock, Save } from 'lucide-react';

const PermissionsControl = () => {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Permission definitions organized by page
  const permissionsByPage = [
    {
      page: 'Dashboard',
      permissions: [
        { id: 'dashboard.view', label: 'View Dashboard', description: 'Access the dashboard page' },
        { id: 'dashboard.viewMetrics', label: 'View Metrics', description: 'See dashboard metrics and statistics' }
      ]
    },
    {
      page: 'Projects',
      permissions: [
        { id: 'projects.view', label: 'View Projects', description: 'Access the projects page' },
        { id: 'projects.create', label: 'Create Projects', description: 'Create new projects' },
        { id: 'projects.edit', label: 'Edit Projects', description: 'Edit existing projects' },
        { id: 'projects.delete', label: 'Delete Projects', description: 'Delete projects' }
      ]
    },
    {
      page: 'Team',
      permissions: [
        { id: 'team.view', label: 'View Team', description: 'Access the team page' },
        { id: 'team.addMember', label: 'Add Members', description: 'Add new team members' },
        { id: 'team.editMember', label: 'Edit Members', description: 'Edit team member details' },
        { id: 'team.removeMember', label: 'Remove Members', description: 'Remove team members' },
        { id: 'team.assignTasks', label: 'Assign Tasks', description: 'Assign tasks to team members' }
      ]
    },
    {
      page: 'Resources',
      permissions: [
        { id: 'resources.view', label: 'View Resources', description: 'Access the resources page' },
        { id: 'resources.addHardware', label: 'Add Hardware', description: 'Add new hardware resources' },
        { id: 'resources.addSoftware', label: 'Add Software', description: 'Add new software resources' },
        { id: 'resources.book', label: 'Book Resources', description: 'Book resources or venues' },
        { id: 'resources.editQuantity', label: 'Edit Quantities', description: 'Change resource quantities' }
      ]
    },
    {
      page: 'Training',
      permissions: [
        { id: 'training.view', label: 'View Training', description: 'Access the training page' },
        { id: 'training.createMaterial', label: 'Create Materials', description: 'Create training materials' },
        { id: 'training.createTask', label: 'Create Tasks', description: 'Create training tasks' },
        { id: 'training.submitResponse', label: 'Submit Responses', description: 'Submit task responses' },
        { id: 'training.viewSubmissions', label: 'View Submissions', description: 'View task submissions' }
      ]
    },
    {
      page: 'Reports',
      permissions: [
        { id: 'reports.view', label: 'View Reports', description: 'Access the reports page' },
        { id: 'reports.export', label: 'Export Reports', description: 'Export reports in various formats' }
      ]
    },
    {
      page: 'Tasks',
      permissions: [
        { id: 'tasks.view', label: 'View Tasks', description: 'Access the tasks page' },
        { id: 'tasks.create', label: 'Create Tasks', description: 'Create new tasks' },
        { id: 'tasks.complete', label: 'Complete Tasks', description: 'Mark tasks as complete' },
        { id: 'tasks.viewAll', label: 'View All Tasks', description: 'View tasks for all users' }
      ]
    },
    {
      page: 'Admin Functions',
      permissions: [
        { id: 'admin.approveMembers', label: 'Approve Members', description: 'Approve new member registrations' },
        { id: 'admin.managePermissions', label: 'Manage Permissions', description: 'Manage role permissions' },
        { id: 'admin.viewSystemLogs', label: 'View System Logs', description: 'Access system logs and activity' }
      ]
    }
  ];

  // Only allow admin access to this page
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!hasPermission('admin.managePermissions')) {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    loadRolesAndUsers();
  }, [user, hasPermission, navigate]);

  const loadRolesAndUsers = async () => {
    try {
      setLoading(true);
      
      // Load roles
      const rolesRef = collection(db, 'roles');
      const rolesSnapshot = await getDocs(rolesRef);
      const rolesData = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoles(rolesData);
      
      // Load users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading roles and users:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRolePermissions = (role) => {
    setSelectedRole(role);
    setEditedPermissions(role.permissions || {});
    setIsModalOpen(true);
  };

  const handlePermissionChange = (permissionId, value) => {
    setEditedPermissions(prev => ({
      ...prev,
      [permissionId]: value
    }));
  };

  const handleSavePermissions = async () => {
    try {
      if (!selectedRole) return;
      
      setLoading(true);
      const roleRef = doc(db, 'roles', selectedRole.id);
      
      await updateDoc(roleRef, {
        permissions: editedPermissions,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id 
          ? { ...role, permissions: editedPermissions } 
          : role
      ));
      
      toast.success(`Permissions updated for ${selectedRole.name} role`);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionCount = (role) => {
    return Object.entries(role.permissions || {}).filter(([_, value]) => value === true).length;
  };

  // Check if all page permissions are enabled
  const isPageFullyEnabled = (role, pagePermissions) => {
    if (!role.permissions) return false;
    return pagePermissions.every(permission => role.permissions[permission.id] === true);
  };

  // Check if some but not all page permissions are enabled
  const isPagePartiallyEnabled = (role, pagePermissions) => {
    if (!role.permissions) return false;
    const enabledCount = pagePermissions.filter(permission => role.permissions[permission.id] === true).length;
    return enabledCount > 0 && enabledCount < pagePermissions.length;
  };

  // Toggle all permissions for a page
  const togglePagePermissions = (pagePermissions, value) => {
    const updates = {};
    pagePermissions.forEach(permission => {
      updates[permission.id] = value;
    });
    setEditedPermissions(prev => ({
      ...prev,
      ...updates
    }));
  };

  if (loading && roles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Roles & Permissions
          </h1>
          <p className="text-gray-500 mt-1">
            Manage access control by role for all system features
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-800">Role-Based Permissions</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Changing role permissions will affect all users with that role. Changes take effect immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {role.name?.charAt(0).toUpperCase() || 'R'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        {role.isSystem && (
                          <span className="text-xs text-gray-500">System Role</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{role.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPermissionCount(role)} enabled
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {users.filter(u => u.role === role.id).length} users
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditRolePermissions(role)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No roles found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Edit Modal */}
      {isModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Edit Permissions for {selectedRole.name} Role
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">{selectedRole.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                {users.filter(u => u.role === selectedRole.id).length} users have this role
              </p>
            </div>

            {selectedRole.isSystem && selectedRole.id === 'admin' ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center mb-6">
                <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Admin role automatically has all system permissions.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {permissionsByPage.map(page => {
                    const isFullyEnabled = isPageFullyEnabled(selectedRole, page.permissions);
                    const isPartiallyEnabled = isPagePartiallyEnabled(selectedRole, page.permissions);
                    
                    return (
                      <div key={page.page} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-700">{page.page}</h3>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => togglePagePermissions(page.permissions, true)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Enable All
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePagePermissions(page.permissions, false)}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Disable All
                            </button>
                            <div className="h-6 w-6 rounded-full flex items-center justify-center">
                              {isFullyEnabled ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : isPartiallyEnabled ? (
                                <div className="h-3 w-3 bg-yellow-500 rounded-sm"></div>
                              ) : (
                                <X className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {page.permissions.map(permission => (
                            <div key={permission.id} className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={permission.id}
                                  type="checkbox"
                                  checked={editedPermissions[permission.id] === true}
                                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={permission.id} className="font-medium text-gray-700">
                                  {permission.label}
                                </label>
                                <p className="text-gray-500 mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <Save size={16} />
                        Save Permissions
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsControl;
```


### File: pages\ProjectDetailsModal.jsx
```
import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, CheckCircle, Trash2, Edit, AlertCircle, 
  LayoutDashboard, ListTodo, Info, Clock, MessageSquare, 
  FileText, Link2, Plus, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import KanbanBoard from './KanbanBoard';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseDb } from '../services/firebaseDb';

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent hover:border-gray-300'
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const ProjectDetailsModal = ({ project, isOpen, onClose, onEdit, onDelete }) => {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!project?.id) return;
      
      try {
        setLoading(true);
        const [projectTasks, projectDocs, projectActivities] = await Promise.all([
          firebaseDb.getProjectTasks(project.id),
          firebaseDb.getProjectDocuments(project.id),
          firebaseDb.getProjectActivities(project.id)
        ]);

        setTasks(projectTasks);
        setDocuments(projectDocs);
        setActivities(projectActivities);
      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadProjectData();
    }
  }, [project?.id, isOpen]);

  const handleAddTask = async (taskData) => {
    try {
      const newTask = await firebaseDb.createTask(project.id, {
        ...taskData,
        createdAt: new Date().toISOString()
      });
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await firebaseDb.updateTask(project.id, taskId, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, ...taskData } : task)
      );
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await firebaseDb.deleteTask(project.id, taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
      
      // Add activity
      await addActivity({
        type: 'task_deleted',
        description: 'Task was deleted'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (!isOpen || !project) return null;

  const calculateProgress = () => {
    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
    return totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  };

  const addActivity = async (activity) => {
    try {
      await firebaseDb.addProjectActivity(project.id, {
        type: activity.type,
        description: activity.description,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
      setActivities(prev => [activity, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'board', label: 'Board', icon: LayoutDashboard },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Clock }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                project.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(project)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="Edit Project"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
              title="Delete Project"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-4">
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
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Project Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar size={16} />
                        <span>Timeline</span>
                      </div>
                      <div className="text-sm">
                        <div>Start: {format(new Date(project.startDate), 'MMM d, yyyy')}</div>
                        <div>End: {format(new Date(project.endDate), 'MMM d, yyyy')}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users size={16} />
                        <span>Team</span>
                      </div>
                      <div className="text-sm">
                        {project.team?.length || 0} members assigned
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <CheckCircle size={16} />
                        <span>Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${calculateProgress()}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{calculateProgress()}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Milestones</h3>
                    <div className="space-y-4">
                      {project.milestones?.length ? (
                        project.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className={`p-2 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-100' :
                              milestone.status === 'inProgress' ? 'bg-blue-100' :
                              'bg-yellow-100'
                            }`}>
                              <CheckCircle className={`w-4 h-4 ${
                                milestone.status === 'completed' ? 'text-green-600' :
                                milestone.status === 'inProgress' ? 'text-blue-600' :
                                'text-yellow-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                              <p className="text-sm text-gray-500 mt-2">
                                Overseer: {project.team?.find(m => m.id === milestone.overseer)?.name || 'Not assigned'}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-4 rounded-lg">
                          <AlertCircle size={20} />
                          No milestones defined
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.team?.length ? (
                        project.team.map((member, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-600">{member.role}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-4 rounded-lg">
                          <AlertCircle size={20} />
                          No team members assigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Tasks</h3>
                    <button
                      onClick={() => handleAddTask({
                        title: 'New Task',
                        description: '',
                        status: 'todo',
                        priority: 'medium',
                        dueDate: new Date().toISOString()
                      })}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={20} />
                      Add Task
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg group">
                        <CheckCircle 
                          className={`cursor-pointer ${task.status === 'done' ? 'text-green-500' : 'text-gray-400'}`}
                          onClick={() => handleUpdateTask(task.id, { 
                            status: task.status === 'done' ? 'todo' : 'done' 
                          })}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500">
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'board' && (
                <KanbanBoard 
                  projectId={project.id} 
                  tasks={tasks}
                  onTasksChange={setTasks}
                  onUpdateTask={handleUpdateTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Project Files</h3>
                    <button
                      onClick={() => {/* Upload file handler */}}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={20} />
                      Upload File
                    </button>
                  </div>
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FileText className="text-gray-400" />
                        <div className="flex-1">
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-600">
                            Uploaded by {doc.uploadedBy} on {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <button
                          onClick={() => {/* Download handler */}}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Link2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Activity Timeline</h3>
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Clock size={16} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => addActivity({
                  type: 'comment',
                  description: 'Added a comment'
                })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <MessageSquare size={20} />
                Comment
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <FileText size={20} />
                Upload File
              </button>
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
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle size={20} />
                  Mark as Completed
                </button>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
```


### File: pages\Projects old.jsx
```
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
```


### File: pages\Projects.jsx
```
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import { useFirebase } from '../contexts/FirebaseContext';
import { useProjectStore } from '../stores/projectsSlice';
import { firebaseDb } from '../services/firebaseDb';

const Projects = () => {
  const { user } = useFirebase();
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

  // Convert projects object to array and filter by status
  const projectsArray = Object.values(projects).filter(project => 
    statusFilter === 'all' ? true : project.status === statusFilter
  );

  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'onHold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'onHold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const projectsData = await firebaseDb.getProjects(user.uid);
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
  }, [user, setProjects]);

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

      {/* Status Filter */}
      <div className="flex items-center gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsArray.map(project => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project)}
            className="cursor-pointer"
          >
            <ProjectCard project={project} />
          </div>
        ))}
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
```


### File: pages\Reports.jsx
```
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseDb } from '../services/firebaseDb';
import { Users, Target, TrendingUp, Activity } from 'lucide-react';
import ReportCard from '../components/reports/ReportCard';
import ProjectProgressChart from '../components/reports/ProjectProgressChart';
import ResourceUtilizationChart from '../components/reports/ResourceUtilizationChart';
import ExportMenu from '../components/reports/ExportMenu';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const { user } = useFirebase();
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    projects: [],
    teamMembers: [],
    resources: [],
    bookings: []
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
               
        const [projectsData, teamData, resourcesData, bookingsData] = await Promise.all([
          firebaseDb.getProjects(user.uid),
          firebaseDb.getTeamMembers(user.uid),
          // Add your resource and booking fetch functions here
          [], // Placeholder for resources
          []  // Placeholder for bookings
        ]);

        setData({
          projects: projectsData,
          teamMembers: teamData,
          resources: resourcesData,
          bookings: bookingsData
        });
      } catch (error) {
        console.error('Error loading report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, dateRange]);

  // Calculate summary metrics
  const calculateMetrics = () => {
    const activeProjects = data.projects.filter(p => p.status === 'inProgress');
    const completedProjects = data.projects.filter(p => p.status === 'completed');
    const activeTeamMembers = data.teamMembers.filter(m => m.status === 'active');

    const calculateProjectProgress = () => {
      const totalMilestones = data.projects.reduce((acc, project) => 
        acc + (project.milestones?.length || 0), 0);
      const completedMilestones = data.projects.reduce((acc, project) => 
        acc + (project.milestones?.filter(m => m.status === 'completed').length || 0), 0);
      return totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    };

    return {
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      teamMembers: activeTeamMembers.length,
      progress: calculateProjectProgress()
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const progressData = data.projects.map(project => {
    const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
    const totalMilestones = project.milestones?.length || 0;
    return {
      name: project.name,
      progress: totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
      total: 100
    };
  });

  const resourceData = [
    { resource: 'Equipment', used: 75, available: 25 },
    { resource: 'Software Licenses', used: 60, available: 40 },
    { resource: 'Meeting Rooms', used: 85, available: 15 }
  ];

  const handleExport = async (format) => {
    try {
      // Implement export logic based on format (PDF, Excel, CSV)
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">View project metrics and performance insights</p>
        </div>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <ExportMenu onExport={handleExport} />
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Active Projects"
          value={metrics.activeProjects}
          change={12}
          changeType="positive"
          icon={Target}
        />
        <ReportCard
          title="Team Members"
          value={metrics.teamMembers}
          change={5}
          changeType="positive"
          icon={Users}
        />
        <ReportCard
          title="Project Progress"
          value={`${metrics.progress}%`}
          change={8}
          changeType="positive"
          icon={Activity}
        />
        <ReportCard
          title="Completed Projects"
          value={metrics.completedProjects}
          change={15}
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectProgressChart data={progressData} />
        <ResourceUtilizationChart data={resourceData} />
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Project Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.projects.map(project => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${metrics.progress}%` }}
                        ></div>
                      </div>
                      <span>{metrics.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.team?.length || 0} members
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.resources?.length || 0} resources
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
```


### File: pages\ResourceManagement.jsx
```
import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { Calendar, Package, Monitor, Home, History, PlusCircle, Search, Filter, CheckSquare, XSquare } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import HardwareSection from '../components/resources/HardwareSection';
import SoftwareSection from '../components/resources/SoftwareSection';

// Simple Card component to replace @/components/ui/card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState('hardware');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with Firebase data
  const venues = [
    { id: 1, name: 'Main Lab', capacity: 30, equipment: ['Projector', 'Whiteboards'] },
    { id: 2, name: 'Workshop', capacity: 15, equipment: ['3D Printer', 'Tools'] }
  ];

  // Weekly calendar data
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  });

  const navigationTabs = [
    { id: 'hardware', label: 'Hardware', icon: Package },
    { id: 'software', label: 'Software', icon: Monitor },
    { id: 'venues', label: 'Venues', icon: Home },
    { id: 'history', label: 'Usage History', icon: History }
  ];

  const WeeklyCalendar = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          Previous
        </button>
        <h3 className="text-lg font-semibold">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        <button
          onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.toString()} className="border rounded-lg p-2">
            <div className="text-sm font-medium mb-1">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
            <div className="mt-2 space-y-1">
              {/* Sample events */}
              <div className="text-xs bg-blue-100 text-blue-800 rounded p-1">
                Lab Meeting (9:00)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ResourceCard = ({ resource, type }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{resource.name}</h3>
          {type === 'hardware' ? (
            <div className="space-y-2 mt-2">
              <p className="text-sm text-gray-600">Quantity: {resource.quantity}</p>
              <p className="text-sm text-gray-600">Condition: {resource.condition}</p>
              <span className={`px-2 py-1 rounded-full text-sm ${resource.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}>
                {resource.status}
              </span>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              <p className="text-sm text-gray-600">
                Licenses: {resource.used}/{resource.licenses}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${(resource.used / resource.licenses) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {type === 'hardware' && (
            <>
              <button className="p-2 hover:bg-green-100 rounded-full text-green-600">
                <CheckSquare size={20} />
              </button>
              <button className="p-2 hover:bg-red-100 rounded-full text-red-600">
                <XSquare size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all resources</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <PlusCircle size={20} />
          Add Resource
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 border-b">
        {navigationTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:border-gray-300'
              }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {activeTab === 'hardware' && <HardwareSection />}

        {activeTab === 'software' && <SoftwareSection />}

        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map(venue => (
                <Card key={venue.id} className="p-4">
                  <h3 className="font-semibold">{venue.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Capacity: {venue.capacity}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Equipment:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {venue.equipment.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <WeeklyCalendar />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Resource Usage History</h3>
            </div>
            <div className="p-4">
              {/* Add history table or list here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagement;
```


### File: pages\Resources copy.jsx
```
// src/pages/Resources.jsx
import { startOfMonth, endOfMonth } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';
import { Package, Monitor, Home, History, PlusCircle } from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { AddResourceModal, VenueBookingModal } from '../components/resources/modals';
import ResourceCalendar from '../components/resources/ResourceCalendar';
import ResourceHistory from '../components/resources/ResourceHistory';
import { DeleteBookingModal } from '../components/resources/modals/DeleteBookingModal';

const Resources = () => {
    const { user } = useFirebase();
    const [activeTab, setActiveTab] = useState('venues');
    const [resources, setResources] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedResource] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [bookingToDelete, setBookingToDelete] = useState(null);

    useEffect(() => {
        loadData();
    }, [user]);

    // When loading bookings
const loadData = async () => {
    try {
      setLoading(true);
      const bookingsData = await resourceService.getBookings(
        startOfMonth(new Date()),
        endOfMonth(new Date())
      );
      console.log('Loaded bookings:', bookingsData); // Debug log
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

      const handleDeleteBooking = async () => {
        try {
          await resourceService.removeBooking(bookingToDelete.id);
          await loadData(); // Reload bookings
          toast.success('Booking cancelled successfully');
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        } catch (error) {
          console.error('Error cancelling booking:', error);
          toast.error('Failed to cancel booking');
        }
      };

      

    const handleAddResource = async (resourceData) => {
        try {
            const newResource = await resourceService.addResource(resourceData);
            setResources(prev => [...prev, newResource]);
            toast.success('Resource added successfully');
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding resource:', error);
            toast.error('Failed to add resource');
        }
    };

    const handleBookVenue = async (bookingData) => {
        try {
          setLoading(true);
          console.log('Booking data:', bookingData); // Debug log
      
          // If it's a delete action
          if (bookingData.action === 'delete') {
            await resourceService.removeBooking(bookingData.id);
            toast.success('Booking cancelled successfully');
            await loadData(); // Reload the bookings
            return;
          }
      
          // If it's a new booking
          await resourceService.addBooking({
            ...bookingData,
            duration: 60, // Default duration
            userId: user.uid
          });
      
          toast.success('Venue booked successfully');
          await loadData(); // Reload the bookings
          setIsBookingModalOpen(false);
        } catch (error) {
          console.error('Error handling booking:', error);
          toast.error(error.message || 'Failed to process booking');
        } finally {
          setLoading(false);
        }
      };
      
      const handleTimeSlotSelect = (slotData) => {
        if (slotData.action === 'delete') {
          setBookingToDelete(slotData);
          setIsDeleteModalOpen(true);
          return;
        }
      
        setSelectedTimeSlot(slotData);
        setIsBookingModalOpen(true);
      };

    const HardwareSection = ({ resources }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
                .filter(resource => resource.type === 'hardware')
                .map(resource => (
                    <div key={resource.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-sm text-gray-500">{resource.category}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm ${resource.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {resource.status}
                            </span>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{resource.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Condition:</span>
                                <span className="font-medium">{resource.condition}</span>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );

    const SoftwareSection = ({ resources }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
                .filter(resource => resource.type === 'software')
                .map(resource => (
                    <div key={resource.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-sm text-gray-500">{resource.category}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Licenses:</span>
                                <span className="font-medium">{resource.licenses}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium">{resource.used || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 rounded-full h-2"
                                    style={{ width: `${((resource.used || 0) / resource.licenses) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Resource Management</h1>
                    <p className="text-gray-500 mt-1">Manage equipment, software, and venue bookings</p>
                </div>
                {activeTab !== 'venues' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <PlusCircle size={20} />
                        Add Resource
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('venues')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'venues'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <Home size={20} />
                    Venue Booking
                </button>
                <button
                    onClick={() => setActiveTab('hardware')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'hardware'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <Package size={20} />
                    Hardware
                </button>
                <button
                    onClick={() => setActiveTab('software')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'software'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <Monitor size={20} />
                    Software
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'history'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                >
                    <History size={20} />
                    History
                </button>
            </div>

            {/* Tab Content */}
            {!loading && (
                <div>
                    {activeTab === 'venues' && (
  <ResourceCalendar 
  bookings={bookings}
  onSelectTimeSlot={handleTimeSlotSelect}
/>
)}
                    {activeTab === 'hardware' && (
  <HardwareSection resources={resources.filter(r => r.type === 'hardware')} />
)}
                    {activeTab === 'software' && (
                        <SoftwareSection resources={resources} />
                    )}
                    {activeTab === 'history' && (
                        <ResourceHistory
                            resourceId={selectedResource?.id}
                        />
                    )}
                </div>
            )}

            {/* Modals */}
            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddResource}
                type={activeTab}
            />

            <VenueBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={handleBookVenue}
                selectedTimeSlot={selectedTimeSlot}
            />

            {/* DeleteBookingModal */}
        <DeleteBookingModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
                setIsDeleteModalOpen(false);
                setBookingToDelete(null);
            }}
            onConfirm={handleDeleteBooking}
        />
        </div>
    );
};

export default Resources;
```


### File: pages\Resources.jsx
```
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import HardwareSection from '../components/resources/HardwareSection';
import SoftwareSection from '../components/resources/SoftwareSection';
import ResourceCalendar from '../components/resources/ResourceCalendar';
import { DeleteBookingModal } from '../components/resources/modals/DeleteBookingModal';
import { VenueBookingModal } from '../components/resources/modals/VenueBookingModal';
import { toast } from 'react-hot-toast';
import { resourceService } from '../services/resourceService';

const Resources = () => {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState('venues');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(1); // Start of current month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0); // End of current month
      
      const bookingsData = await resourceService.getBookings(startDate, endDate);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookVenue = async (bookingData) => {
    try {
      setLoading(true);
      if (bookingData.action === 'delete') {
        await resourceService.removeBooking(bookingData.id);
        toast.success('Booking cancelled successfully');
      } else {
        await resourceService.addBooking({
          ...bookingData,
          userId: user.uid
        });
        toast.success('Venue booked successfully');
      }
      await loadData();
      setIsBookingModalOpen(false);
    } catch (error) {
      console.error('Error handling booking:', error);
      toast.error(error.message || 'Failed to process booking');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSelect = (slotData) => {
    if (slotData.action === 'delete') {
      setBookingToDelete(slotData);
      setIsDeleteModalOpen(true);
      return;
    }
    setSelectedTimeSlot(slotData);
    setIsBookingModalOpen(true);
  };

  const handleDeleteBooking = async () => {
    try {
      await resourceService.removeBooking(bookingToDelete.id);
      await loadData();
      toast.success('Booking cancelled successfully');
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <p className="text-gray-500 mt-1">Manage equipment, software, and venue bookings</p>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('venues')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'venues'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          Venue Booking
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'hardware'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          Hardware
        </button>
        <button
          onClick={() => setActiveTab('software')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'software'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          Software
        </button>
      </div>

      {!loading && (
        <div>
          {activeTab === 'venues' && (
            <ResourceCalendar
              bookings={bookings}
              onSelectTimeSlot={handleTimeSlotSelect}
            />
          )}
          {activeTab === 'hardware' && <HardwareSection />}
          {activeTab === 'software' && <SoftwareSection />}
        </div>
      )}

      <VenueBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleBookVenue}
        selectedTimeSlot={selectedTimeSlot}
      />

      <DeleteBookingModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        }}
        onConfirm={handleDeleteBooking}
      />
    </div>
  );
};

export default Resources;
```


### File: pages\Settings.jsx
```
import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { 
  User, 
  Bell, 
  Shield, 
  AlertCircle,
  Save,
  Edit2,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import initializeDatabase from '../firebase/initializeDatabase';

const SettingsPage = () => {
  const { user, updateUserProfile } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleInitializeDatabase = async () => {
    try {
      await initializeDatabase();
      toast.success('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Failed to initialize database');
    }
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    notificationPreferences: user?.notificationPreferences || {
      email: true,
      push: true,
      projectUpdates: true,
      taskReminders: true,
      resourceBookings: true
    }
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  });

  const [isEditing, setIsEditing] = useState(false);

  // Profile Section
  const ProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Profile Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          {isEditing ? (
            <>
              <X size={16} />
              Cancel Editing
            </>
          ) : (
            <>
              <Edit2 size={16} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
          {isEditing && (
            <button className="text-blue-600 hover:text-blue-700 text-sm">
              Change Profile Picture
            </button>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Security Section
  const SecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Security Settings</h3>

      <div className="space-y-4">
        {/* Change Password */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-4">Change Password</h4>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={securityData.currentPassword}
              onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="New Password"
              value={securityData.newPassword}
              onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityData.twoFactorEnabled}
                onChange={(e) => handleToggle2FA(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Notifications Section
  const NotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Notification Preferences</h3>

      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profileData.notificationPreferences.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Project Updates */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-medium">Project Updates</h4>
            <p className="text-sm text-gray-500">Get notified about project changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profileData.notificationPreferences.projectUpdates}
              onChange={(e) => handleNotificationChange('projectUpdates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Task Reminders */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-medium">Task Reminders</h4>
            <p className="text-sm text-gray-500">Receive task deadline reminders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profileData.notificationPreferences.taskReminders}
              onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  // Event Handlers
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile(user.uid, profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // Update password logic here
      toast.success('Password updated successfully');
      setSecurityData({
        ...securityData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled) => {
    try {
      setLoading(true);
      // Toggle 2FA logic here
      setSecurityData({ ...securityData, twoFactorEnabled: enabled });
      toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key, value) => {
    try {
      setLoading(true);
      const updatedPreferences = {
        ...profileData.notificationPreferences,
        [key]: value
      };
      
      await updateUserProfile(user.uid, {
        notificationPreferences: updatedPreferences
      });
      
      setProfileData(prev => ({
        ...prev,
        notificationPreferences: updatedPreferences
      }));
      
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow">
        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex gap-4 px-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'profile' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'security' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} />
                Security
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'notifications' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell size={16} />
                Notifications
              </div>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>

        {/* Danger Zone */}
        <div className="p-6 border-t bg-gray-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
            <div className="flex items-start space-x-4 bg-white p-4 rounded-lg border border-red-200">
              <AlertCircle className="text-red-500 mt-1" size={20} />
              <div className="flex-1">
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // Handle account deletion
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
```


### File: pages\SignUp.jsx
```
import React, { useState } from 'react';
import { getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'community_member',
    authCode: ''
  });

  const [showAuthCode, setShowAuthCode] = useState(false);

  const roles = [
    {
      id: 'community_member',
      name: 'Community Member',
      description: 'Access to general resources and community features'
    },
    {
      id: 'project_member',
      name: 'Project Member',
      description: 'Participate in specific projects and track progress'
    },
    {
      id: 'instructor',
      name: 'Instructor',
      description: 'Create and manage training content (requires approval)'
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Oversee projects and manage resources'
    },
    {
      id: 'resource_manager',
      name: 'Resource Manager',
      description: 'Manage hardware and software resources'
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access and management (requires authorization code)'
    }
  ];

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({ ...formData, role: newRole });
    setShowAuthCode(newRole === 'admin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userData = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp()
      };

      if (formData.role === 'admin' && formData.authCode) {
        // Verify auth code for admin role
        const authRef = doc(db, 'authorization', 'administrator');
        const authDoc = await getDoc(authRef);

        if (!authDoc.exists() || authDoc.data().code !== formData.authCode) {
          await userCredential.user.delete();
          toast.error('Invalid authorization code');
          return;
        }

        // For admin users, create user document immediately with active status
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userData,
          status: 'active'
        });
        toast.success('Admin account created successfully!');
      } else if (formData.role === 'supervisor') {
        // Add to supervisor approval collection
        await setDoc(doc(db, 'supervisorsWaitingApproval', userCredential.user.uid), {
          ...userData,
          status: 'pending'
        });
        toast.success('Account created! Waiting for admin approval');
        
      } else {
        // For non-admin users, add to waiting approval collection with uid as doc ID
        await setDoc(doc(db, 'usersWaitingApproval', userCredential.user.uid), {
          ...userData,
          status: 'pending'
        });
        toast.success('Account created! Waiting for admin approval');
      }

      // Sign out the user
      await auth.signOut();
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Your Role
              </label>
              <select
                value={formData.role}
                onChange={handleRoleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-lg"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {roles.find(r => r.id === formData.role)?.description}
              </p>
            </div>

            {showAuthCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Authorization Code
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={formData.authCode}
                    onChange={(e) => setFormData({ ...formData, authCode: e.target.value })}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border"
                    placeholder="Enter authorization code"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
```


### File: pages\TaskAssign.jsx
```
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { collection, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

const TaskAssign = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    taskType: 'general'
  });
  
  // Permission check
  const canAssignTasks = hasPermission('canManageContent') || hasPermission('canManageUsers');
  
  useEffect(() => {
    const loadMemberData = async () => {
      try {
        setLoading(true);
        
        if (!memberId) {
          toast.error('No team member specified');
          navigate('/team');
          return;
        }
        
        // Get member data
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        
        if (!memberDoc.exists()) {
          toast.error('Team member not found');
          navigate('/team');
          return;
        }
        
        setMemberData({
          id: memberDoc.id,
          ...memberDoc.data()
        });
        
      } catch (error) {
        console.error('Error loading member data:', error);
        toast.error('Failed to load team member data');
        navigate('/team');
      } finally {
        setLoading(false);
      }
    };
    
    if (!canAssignTasks) {
      toast.error('You do not have permission to assign tasks');
      navigate('/team');
      return;
    }
    
    loadMemberData();
  }, [memberId, navigate, canAssignTasks]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate due date
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        toast.error('Please enter a valid due date');
        return;
      }
      
      // Create task document
      const taskData = {
        title: formData.title,
        description: formData.description,
        dueDate,
        priority: formData.priority,
        taskType: formData.taskType,
        status: 'pending',
        assignedTo: memberId,
        assignedBy: user.uid,
        assignedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'tasks'), taskData);
      
      // Show success message
      toast.success(`Task assigned to ${memberData.name}`);
      
      // Redirect back to team page
      navigate('/tasks');
      
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    }
  };
  
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      return date.toISOString().split('T')[0]; // Format for date input: YYYY-MM-DD
    } catch (error) {
      return '';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (!memberData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600">Team member not found</p>
        <button
          onClick={() => navigate('/team')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Team
        </button>
      </div>
    );
  }
  
  // Helper to format role for display
  const formatRole = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/team')}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Assign Task to Team Member</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            {memberData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{memberData.name}</h3>
            <p className="text-gray-600">{formatRole(memberData.role)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Task Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="project">Project Related</option>
                <option value="training">Training</option>
                <option value="administrative">Administrative</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <User size={16} />
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskAssign;
```


### File: pages\TaskModal.jsx
```
import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Clock } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSave, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status || 'todo'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'todo'
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: task?.id || Date.now().toString(),
      createdAt: task?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
```


### File: pages\Tasks.jsx
```
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, AlertCircle, Search, Filter, Calendar } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
};

const Tasks = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const isAdmin = hasPermission('canManageUsers');
  const isSupervisor = hasPermission('canManageContent');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        
        let tasksQuery;
        const tasksRef = collection(db, 'tasks');
        
        if (isAdmin || isSupervisor) {
          // Admins and supervisors can see all tasks
          tasksQuery = query(tasksRef);
        } else {
          // Regular users only see their assigned tasks
          tasksQuery = query(tasksRef, where('assignedTo', '==', user.uid));
        }
        
        const snapshot = await getDocs(tasksQuery);
        
        // Process tasks and get related user info
        const tasksWithDetails = await Promise.all(snapshot.docs.map(async (doc) => {
          const taskData = doc.data();
          
          // Get assignee info
          let assigneeData = null;
          if (taskData.assignedTo) {
            const assigneeDoc = await getDoc(doc(db, 'users', taskData.assignedTo));
            if (assigneeDoc.exists()) {
              assigneeData = assigneeDoc.data();
            }
          }
          
          // Get assigner info
          let assignerData = null;
          if (taskData.assignedBy) {
            const assignerDoc = await getDoc(doc(db, 'users', taskData.assignedBy));
            if (assignerDoc.exists()) {
              assignerData = assignerDoc.data();
            }
          }
          
          // Calculate status based on due date and completion
          let status = taskData.status || TaskStatus.PENDING;
          if (status !== TaskStatus.COMPLETED) {
            const dueDate = taskData.dueDate?.toDate ? taskData.dueDate.toDate() : new Date(taskData.dueDate);
            if (dueDate < new Date()) {
              status = TaskStatus.OVERDUE;
            }
          }
          
          return {
            id: doc.id,
            ...taskData,
            status,
            assignee: assigneeData ? {
              id: taskData.assignedTo,
              name: assigneeData.name,
              role: assigneeData.role
            } : null,
            assigner: assignerData ? {
              id: taskData.assignedBy,
              name: assignerData.name,
              role: assignerData.role
            } : null
          };
        }));
        
        setTasks(tasksWithDetails);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadTasks();
    }
  }, [user, isAdmin, isSupervisor]);
  
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };
  
  // Filter tasks based on search and status filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });
  
  // Helper to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get task status style
  const getStatusStyle = (status) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle size={16} />;
      case TaskStatus.OVERDUE:
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-gray-500 mt-1">
            {filteredTasks.length} {filterStatus !== 'all' ? filterStatus : ''} tasks
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.OVERDUE}>Overdue</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusStyle(task.status)}`}>
                      {getStatusIcon(task.status)}
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
                
                {task.status !== TaskStatus.COMPLETED && (
                  <button
                    onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.COMPLETED)}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                  >
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Due: {formatDate(task.dueDate)}
                </div>
                
                {task.assignee && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Assigned to:</span>
                    {task.assignee.name}
                  </div>
                )}
                
                {task.assigner && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Assigned by:</span>
                    {task.assigner.name}
                  </div>
                )}
                
                {task.assignedAt && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Assigned on:</span>
                    {formatDate(task.assignedAt)}
                  </div>
                )}
              </div>
              
              {task.priority && (
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <AlertCircle size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600">No tasks found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
```


### File: pages\Team.jsx
```
import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseDb } from '../services/firebaseDb';
import TeamMemberCard from '../components/team/TeamMemberCard';
import DeleteConfirmationModal from '../components/team/DeleteConfirmationModal';
import SignIn from '../components/auth/SignIn';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dormantModalOpen, setDormantModalOpen] = useState(false);
  const [memberToMakeDormant, setMemberToMakeDormant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadApprovedMembers = async () => {
      try {
        setLoading(true);
        
        // Check user role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // Get only approved team members from users collection
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('status', 'in', ['active', 'onLeave']));
        const snapshot = await getDocs(q);
        
        // Transform into team members format
        const members = snapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || '',
            phone: userData.phone || '',
            skills: userData.skills || [],
            status: userData.status || 'active',
            createdAt: userData.createdAt,
            approvedAt: userData.approvedAt,
            lastLoginAt: userData.lastLoginAt,
            lastActivityAt: userData.lastActivityAt,
            updatedAt: userData.updatedAt,
            // Track activity data
            activity: getUserActivity(userData),
            projects: [] // Will be populated with project assignments
          };
        });

        // Load projects to check team assignments
        const projects = await firebaseDb.getProjects(user.uid);
        
        // Get activities collection data for further context
        const activitiesRef = collection(db, 'activities');
        const activitySnapshot = await getDocs(activitiesRef);
        const activities = activitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Enhance members with project count and recent activity data
        const enhancedMembers = members.map(member => {
          // Get assigned projects
          const assignedProjects = projects.filter(project =>
            project.team?.some(teamMember => teamMember.id === member.id)
          );
          
          // Get most recent activity
          const recentActivities = activities
            .filter(activity => activity.userId === member.id)
            .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
          
          const recentActivity = recentActivities.length > 0 
            ? recentActivities[0].description 
            : null;
            
          return {
            ...member,
            projects: assignedProjects,
            activity: recentActivity || member.activity
          };
        });

        setTeamMembers(enhancedMembers);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to determine user activity based on available data
    const getUserActivity = (userData) => {
      // If we have explicit activity data
      if (userData.currentActivity) return userData.currentActivity;
      
      // Try to determine from recent actions
      if (userData.lastLoginAt && userData.lastActivityAt) {
        const loginTime = userData.lastLoginAt.toDate ? userData.lastLoginAt.toDate() : new Date(userData.lastLoginAt);
        const activityTime = userData.lastActivityAt.toDate ? userData.lastActivityAt.toDate() : new Date(userData.lastActivityAt);
        
        // If activity is very recent
        const now = new Date();
        const hoursSinceActivity = (now - activityTime) / (1000 * 60 * 60);
        
        if (hoursSinceActivity < 1) return "Recently active";
        if (hoursSinceActivity < 24) return "Active today";
        if (hoursSinceActivity < 72) return "Active in the last 3 days";
      }
      
      return null;
    };

    if (user) {
      loadApprovedMembers();
    }
  }, [user]);

  const handleMakeDormantClick = async (member) => {
    try {
      // Check if member is assigned to any active projects
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef);
      const snapshot = await getDocs(q);
      
      const assignedProjects = snapshot.docs.filter(doc => {
        const projectData = doc.data();
        return projectData.team && projectData.team.some(m => m.id === member.id);
      });
      
      if (assignedProjects.length > 0) {
        toast.error(`Cannot make member dormant while assigned to ${assignedProjects.length} active projects`);
        return;
      }
      
      setMemberToMakeDormant(member);
      setDormantModalOpen(true);
    } catch (error) {
      console.error('Error checking project assignments:', error);
      toast.error('Failed to check project assignments');
    }
  };

  const handleDormantConfirm = async () => {
    if (!memberToMakeDormant) return;

    try {
      // Set status to dormant instead of inactive
      const userRef = doc(db, 'users', memberToMakeDormant.id);
      await updateDoc(userRef, {
        status: 'dormant',
        updatedAt: new Date().toISOString()
      });
      
      // Update local state to remove the member
      setTeamMembers(prev => prev.filter(m => m.id !== memberToMakeDormant.id));
      toast.success('Team member account set to dormant');
      setDormantModalOpen(false);
      setMemberToMakeDormant(null);
    } catch (error) {
      console.error('Error updating team member status:', error);
      toast.error('Failed to update team member status');
    }
  };
  
  // Function to handle task assignment from team member card
  const handleAssignTask = (member) => {
    if (!hasPermission('canManageContent') && !hasPermission('canManageUsers')) {
      toast.error('You do not have permission to assign tasks');
      return;
    }
    
    // Navigate to task assignment page with member ID
    navigate(`/tasks/assign/${member.id}`);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-gray-500 mt-1">
            {teamMembers.length} approved team members
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="onLeave">On Leave</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onDelete={() => handleMakeDormantClick(member)}
              onAssignTask={() => handleAssignTask(member)}
            />
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full flex justify-center items-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No approved team members found</p>
            </div>
          )}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={dormantModalOpen}
        onClose={() => {
          setDormantModalOpen(false);
          setMemberToMakeDormant(null);
        }}
        onConfirm={handleDormantConfirm}
        memberName={memberToMakeDormant?.name}
      />
    </div>
  );
};

export default Team;
```


### File: pages\TrainingProgress copy.jsx
```
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { X } from 'lucide-react';
import TaskCreationForm from '../components/training/TaskCreationForm';
import TaskSubmission from '../components/training/TaskSubmission';

import {
  Book,
  Users,
  FileText,
  Link as LinkIcon,
  Plus,
  Edit,
  Trash2,
  Youtube,
  Calendar,
  Clock,
  ChevronLeft,
  MessageSquare,
  // X 
  CheckCircle
} from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Group Selection Component
const GroupSelection = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    try {
      const groupsRef = collection(db, 'trainingGroups');
      const snapshot = await getDocs(groupsRef);
      setGroups(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'trainingGroups'), {
        ...newGroup,
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      });
      toast.success('Group created successfully');
      setShowAddGroup(false);
      setNewGroup({ name: '', description: '' });
      loadGroups();
    } catch (error) {
      console.error('Error adding group:', error);
      toast.error('Failed to create group');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Training Groups</h2>
        {hasPermission('canManageContent') && (
          <button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Group
          </button>
        )}
      </div>

      {showAddGroup && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
          <form onSubmit={handleAddGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddGroup(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-gray-600 mt-1">{group.description}</p>
              </div>
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Task Management Component
const TaskManagement = ({ group }) => {
  const [tasks, setTasks] = useState([]);
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [submissionData, setSubmissionData] = useState({});
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'reading', // reading, submission, or feedback
    dueDate: '',
    content: '',
    feedbackUrl: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading data for group:', group.id); // Debug log

        // Load tasks
        const tasksRef = collection(db, 'trainingTasks');
        const q = query(tasksRef, where('groupId', '==', group.id));
        const snapshot = await getDocs(q);

        // Debug logs
        console.log('Tasks query:', q);
        console.log('Tasks snapshot:', snapshot.docs.length);

        const tasksData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const taskData = doc.data();
            // Get creator information
            try {
              const creatorDoc = await getDoc(doc(db, 'users', taskData.createdBy));
              return {
                id: doc.id,
                ...taskData,
                creator: creatorDoc.exists() ? {
                  name: creatorDoc.data().name,
                  role: creatorDoc.data().role
                } : null
              };
            } catch (error) {
              console.error('Error fetching creator info:', error);
              return {
                id: doc.id,
                ...taskData,
                creator: null
              };
            }
          })
        );

        console.log('Processed tasks:', tasksData); // Debug log
        setTasks(tasksData);

        // Only fetch submissions if there are tasks
        if (tasksData.length > 0) {
          const submissionsRef = collection(db, 'taskSubmissions');
          const submissionsQuery = query(
            submissionsRef,
            where('taskId', 'in', tasksData.map(t => t.id))
          );
          const submissionsSnapshot = await getDocs(submissionsQuery);

          const submissionsData = {};
          submissionsSnapshot.docs.forEach(doc => {
            const submission = doc.data();
            const taskId = submission.taskId;
            if (!submissionsData[taskId]) {
              submissionsData[taskId] = [];
            }
            submissionsData[taskId].push({
              id: doc.id,
              ...submission
            });
          });

          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      } finally {
        setTaskLoading(false);
      }
    };

    if (group?.id) {
      loadData();
    }
  }, [group]);

  if (taskLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

    // Add error display
    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>Error loading content: {error}</p>
          <button
            onClick={loadData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    const loadTasks = async () => {
      try {
        const tasksRef = collection(db, 'trainingTasks');
        const q = query(tasksRef, where('groupId', '==', group.id));
        const snapshot = await getDocs(q);

        // Get creator information for each task
        const tasksWithCreator = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const taskData = doc.data();
            const creatorDoc = await getDoc(doc(db, 'users', taskData.createdBy));
            return {
              id: doc.id,
              ...taskData,
              creator: creatorDoc.exists() ? {
                name: creatorDoc.data().name,
                role: creatorDoc.data().role
              } : null
            };
          })
        );

        setTasks(tasksWithCreator);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      }
    };

    const handleEditTask = async (task) => {
      setSelectedTask(task);
      setShowAddTask(true);
    };

    const handleSubmit = async (taskId) => {
      try {
        const submissionDoc = await addDoc(collection(db, 'taskSubmissions'), {
          taskId,
          userId: user.uid,
          responses: submissionData,
          submittedAt: new Date().toISOString()
        });

        // Refresh submissions after new submission
        await loadSubmissions();
        setSubmissionData({});
        toast.success('Response submitted successfully');
      } catch (error) {
        console.error('Error submitting response:', error);
        toast.error('Failed to submit response');
      }
    };

    const handleSubmitResponse = async (taskId, response) => {
      try {
        const responseData = {
          taskId,
          userId: user.uid,
          response,
          submittedAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'taskResponses'), responseData);
        toast.success('Response submitted successfully');
      } catch (error) {
        console.error('Error submitting response:', error);
        toast.error('Failed to submit response');
      }
    };

    const handleAddTask = async (taskData) => {
      try {
        const finalTaskData = {
          ...taskData,
          groupId: group.id,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          status: 'active'
        };

        await addDoc(collection(db, 'trainingTasks'), finalTaskData);
        toast.success('Task created successfully');
        setShowAddTask(false);
        loadTasks();
      } catch (error) {
        console.error('Error adding task:', error);
        toast.error('Failed to create task');
      }
    };

    const handleDeleteTask = async (taskId) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        try {
          await deleteDoc(doc(db, 'trainingTasks', taskId));
          toast.success('Task deleted successfully');
          loadTasks();
        } catch (error) {
          console.error('Error deleting task:', error);
          toast.error('Failed to delete task');
        }
      }
    };

    // Check if user is a project member
    const isProjectMember = () => {
      return user?.role === 'project_member';
    };

    // Check if user has already submitted
    const hasSubmitted = (taskId) => {
      return submissions[taskId]?.some(sub => sub.userId === user.uid);
    };

    const loadSubmissions = async () => {
      try {
        const submissionsRef = collection(db, 'taskSubmissions');
        const q = query(submissionsRef);
        const snapshot = await getDocs(q);

        // Create a map of taskId -> submissions
        const submissionsData = {};
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const submission = doc.data();
            const submitterDoc = await getDoc(doc(db, 'users', submission.userId));

            if (!submissionsData[submission.taskId]) {
              submissionsData[submission.taskId] = [];
            }

            submissionsData[submission.taskId].push({
              id: doc.id,
              ...submission,
              submitter: submitterDoc.exists() ? {
                name: submitterDoc.data().name,
                role: submitterDoc.data().role
              } : null
            });
          })
        );

        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading submissions:', error);
        toast.error('Failed to load submissions');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <p className="text-gray-600">{group.description}</p>
          </div>
          {hasPermission('canManageContent') && (
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Task
            </button>
          )}
        </div>

        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Create New Task</h3>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <TaskCreationForm
                onSubmit={handleAddTask}
                onCancel={() => setShowAddTask(false)}
              />
            </div>
          </div>
        )}

        {/* Update the task display to handle both types */}
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm ${task.type === 'reading' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                      {task.type === 'reading' ? 'Reading Material' : 'Team Submission'}
                    </span>
                  </div>


                  {/* Show creator information */}
                  <p className="text-sm text-gray-600 mt-1">
                    Created by: {task.creator?.name} ({task.creator?.role})
                  </p>

                  <p className="text-gray-600 mt-2">{task.description}</p>



                  {task.type === 'reading' && task.content?.map((section, index) => (
                    <div key={index} className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="mt-2 text-gray-600">{section.details}</p>
                      {section.resources?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {section.resources.map((resource, rIndex) => (
                            <a
                              key={rIndex}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              {resource.type === 'video' && <Youtube size={16} />}
                              {resource.type === 'document' && <FileText size={16} />}
                              {resource.type === 'link' && <LinkIcon size={16} />}
                              {resource.type === 'video' ? 'Watch Video' :
                                resource.type === 'document' ? 'View Document' : 'Visit Link'}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {task.type === 'submission' && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {task.submissionFields?.map((field) => (
                          <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{field.label}</span>
                              {field.required && (
                                <span className="text-red-500 text-sm">*Required</span>
                              )}
                            </div>
                            {field.description && (
                              <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                            )}
                            <div className="mt-2">
                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  value={submissionData[field.id] || ''}
                                  onChange={(e) => setSubmissionData(prev => ({
                                    ...prev,
                                    [field.id]: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  disabled={!isProjectMember() || hasSubmitted(task.id)}
                                />
                              )}
                              {field.type === 'textarea' && (
                                <textarea
                                  value={submissionData[field.id] || ''}
                                  onChange={(e) => setSubmissionData(prev => ({
                                    ...prev,
                                    [field.id]: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                  rows={3}
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                />
                              )}
                              {field.type === 'link' && (
                                <input
                                  type="url"
                                  value={submissionData[field.id] || ''}
                                  onChange={(e) => setSubmissionData(prev => ({
                                    ...prev,
                                    [field.id]: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                  placeholder="Enter URL"
                                />
                              )}
                              {field.type === 'date' && (
                                <input
                                  type="date"
                                  value={submissionData[field.id] || ''}
                                  onChange={(e) => setSubmissionData(prev => ({
                                    ...prev,
                                    [field.id]: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                />
                              )}
                              {/* File upload can be implemented with additional firebase storage functionality */}
                              {field.type === 'file' && (
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    // Handle file upload
                                    const file = e.target.files[0];
                                    if (file) {
                                      setSubmissionData(prev => ({
                                        ...prev,
                                        [field.id]: file.name // For now just store filename
                                      }));
                                    }
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Show submission history */}
                      {submissions[task.id]?.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Submissions</h4>
                          <div className="space-y-2">
                            {submissions[task.id].map((submission) => (
                              <div key={submission.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{submission.submitter?.name}</p>
                                    <p className="text-sm text-gray-600">
                                      Submitted on {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                  </div>
                                  {submission.userId === user.uid && (
                                    <span className="text-sm text-blue-600">Your submission</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={async () => {
                          try {
                            // Create submission document
                            await addDoc(collection(db, 'taskSubmissions'), {
                              taskId: task.id,
                              userId: user.uid,
                              submittedAt: new Date().toISOString(),
                              responses: submissionData
                            });

                            toast.success('Response submitted successfully');
                            setSubmissionData({}); // Clear form after submission
                          } catch (error) {
                            console.error('Error submitting response:', error);
                            toast.error('Failed to submit response');
                          }
                        }}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        Submit Response
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                {hasPermission('canManageContent') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main Training Progress Component
  const TrainingProgress = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useFirebase();

    useEffect(() => {
      const loadUserGroup = async () => {
        try {
          setLoading(true);
          if (user) {
            // Get user's profile to check assigned group
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            if (userData?.assignedGroup) {
              // Get group details
              const groupDoc = await getDoc(doc(db, 'trainingGroups', userData.assignedGroup));
              if (groupDoc.exists()) {
                setSelectedGroup({
                  id: groupDoc.id,
                  ...groupDoc.data()
                });
              }
            }
          }
        } catch (error) {
          console.error('Error loading user group:', error);
          toast.error('Failed to load assigned group');
        } finally {
          setLoading(false);
        }
      };

      loadUserGroup();
    }, [user]);

    return (
      <div className="space-y-6">
        {!selectedGroup ? (
          <GroupSelection onSelectGroup={setSelectedGroup} />
        ) : (
          <>
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
            >
              <ChevronLeft size={20} />
              Back to Groups
            </button>
            <TaskManagement group={selectedGroup} />
          </>
        )}
      </div>
    );
  };

  // Progress Tracking Component for submission status
  const ProgressTracking = ({ task, userId }) => {
    const [submission, setSubmission] = useState(null);

    useEffect(() => {
      loadSubmissionStatus();
    }, [task, userId]);

    const loadSubmissionStatus = async () => {
      try {
        const submissionsRef = collection(db, 'taskSubmissions');
        const q = query(
          submissionsRef,
          where('taskId', '==', task.id),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setSubmission(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error loading submission status:', error);
      }
    };

    const markAsCompleted = async () => {
      try {
        const submissionsRef = collection(db, 'taskSubmissions');
        await addDoc(submissionsRef, {
          taskId: task.id,
          userId,
          status: 'completed',
          completedAt: new Date().toISOString()
        });
        toast.success('Task marked as completed');
        loadSubmissionStatus();
      } catch (error) {
        console.error('Error marking task as completed:', error);
        toast.error('Failed to update task status');
      }
    };

    return (
      <div className="mt-4 flex items-center gap-4">
        {submission ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span>Completed on {format(new Date(submission.completedAt), 'MMM d, yyyy')}</span>
          </div>
        ) : (
          <button
            onClick={markAsCompleted}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle size={20} />
            Mark as Completed
          </button>
        )}
      </div>
    );
  };

  // Submission Status Component for instructors
  const SubmissionStatus = ({ task }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadSubmissions();
    }, [task]);

    const loadSubmissions = async () => {
      try {
        const submissionsRef = collection(db, 'taskSubmissions');
        const snapshot = await getDocs(submissionsRef);

        // Get submitter information for each submission
        const submissionsData = {};
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const submission = doc.data();
            const submitterDoc = await getDoc(doc(db, 'users', submission.userId));

            if (!submissionsData[submission.taskId]) {
              submissionsData[submission.taskId] = [];
            }

            submissionsData[submission.taskId].push({
              id: doc.id,
              ...submission,
              submitter: submitterDoc.exists() ? {
                name: submitterDoc.data().name,
                role: submitterDoc.data().role
              } : null
            });
          })
        );

        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading submissions:', error);
        toast.error('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    // For other roles (admin, instructor), show the group selection
    return (
      <div className="space-y-6">
        {!selectedGroup ? (
          <GroupSelection onSelectGroup={setSelectedGroup} />
        ) : (
          <>
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
            >
              <ChevronLeft size={20} />
              Back to Groups
            </button>
            <TaskManagement group={selectedGroup} />
          </>
        )}
      </div>
    );
  };

  export default TrainingProgress;
```


### File: pages\TrainingProgress.jsx
```
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';

import {
  Users,
  FileText,
  Link as LinkIcon,
  Plus,
  Edit,
  Trash2,
  Youtube,
  Calendar,
  Clock,
  ChevronLeft,
  MessageSquare,
  X,
  Search,
  AlertCircle
} from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import TaskCreationForm from '../components/training/TaskCreationForm';
import TaskSubmission from '../components/training/TaskSubmission';


// Group Selection Component
const GroupSelection = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsRef = collection(db, 'trainingGroups');
      const snapshot = await getDocs(groupsRef);
      setGroups(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error loading groups:', error);
      setError('Failed to load groups');
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      toast.success('Group created successfully');
      setShowAddGroup(false);
      setNewGroup({ name: '', description: '' });
      loadGroups();
    } catch (error) {
      console.error('Error adding group:', error);
      toast.error('Failed to create group');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button
          onClick={loadGroups}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Training Groups</h2>
        {hasPermission('canManageContent') && (
          <button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Group
          </button>
        )}
      </div>

      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGroup(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-gray-600 mt-1">{group.description}</p>
                {group.createdBy === user.uid && (
                  <span className="text-sm text-blue-600 mt-2">Group Admin</span>
                )}
              </div>
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600">No training groups available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Task Management Component
const TaskManagement = ({ group }) => {
  const [tasks, setTasks] = useState([]);
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tasks
      const tasksRef = collection(db, 'trainingTasks');
      const q = query(tasksRef, where('groupId', '==', group.id));
      const snapshot = await getDocs(q);

      const tasksData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const taskData = doc.data();
          try {
            const creatorDoc = await getDoc(doc(db, 'users', taskData.createdBy));
            return {
              id: doc.id,
              ...taskData,
              // Ensure dates are properly handled
              createdAt: taskData.createdAt?.toDate() || new Date(),
              dueDate: taskData.dueDate?.toDate() || taskData.dueDate || new Date(),
              creator: creatorDoc.exists() ? {
                name: creatorDoc.data().name,
                role: creatorDoc.data().role
              } : null
            };
          } catch (error) {
            console.error('Error fetching creator info:', error);
            return {
              id: doc.id,
              ...taskData,
              creator: null
            };
          }
        })
      );

      setTasks(tasksData);

      // Load submissions if there are tasks
      if (tasksData.length > 0) {
        const submissionsRef = collection(db, 'taskSubmissions');
        const submissionsQuery = query(
          submissionsRef,
          where('taskId', 'in', tasksData.map(t => t.id))
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);

        const submissionsData = {};
        for (const doc of submissionsSnapshot.docs) {
          const submission = doc.data();
          if (!submissionsData[submission.taskId]) {
            submissionsData[submission.taskId] = [];
          }
          // Get submitter info
          const submitterDoc = await getDoc(doc(db, 'users', submission.userId));
          submissionsData[submission.taskId].push({
            id: doc.id,
            ...submission,
            submitter: submitterDoc.exists() ? {
              name: submitterDoc.data().name,
              role: submitterDoc.data().role
            } : null
          });
        }
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';

    try {
      // Handle Firestore Timestamp
      if (dateValue?.toDate) {
        return format(dateValue.toDate(), 'MMM d, yyyy');
      }

      // Handle string dates and Date objects
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

      // Validate if date is valid before formatting
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return 'Invalid date';
      }

      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    if (group?.id) {
      loadData();
    }
  });

  const handleAddTask = async (taskData) => {
    try {
      // Ensure dates are properly formatted before saving
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date');
      }

      toast.success('Task created successfully');
      setShowAddTask(false);
      loadData();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleEditTask = async (task) => {
    setSelectedTask(task);
    setShowAddTask(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteDoc(doc(db, 'trainingTasks', taskId));
      toast.success('Task deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || task.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{group.name}</h2>
          <p className="text-gray-600">{group.description}</p>
        </div>
        {hasPermission('canManageContent') && (
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Task
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="reading">Reading Material</option>
          <option value="submission">Team Submission</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${task.type === 'reading'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                    }`}>
                    {task.type === 'reading' ? 'Reading Material' : 'Team Submission'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  Created by: {task.creator?.name} ({task.creator?.role})
                </p>

                <p className="text-gray-600 mt-2">{task.description}</p>

                {task.type === 'reading' && task.content?.map((section, index) => (
                  <div key={index} className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{section.title}</h4>
                    <p className="mt-2 text-gray-600">{section.details}</p>
                    {section.resources?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {section.resources.map((resource, rIndex) => (
                          <a
                            key={rIndex}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            {resource.type === 'video' && <Youtube size={16} />}
                            {resource.type === 'document' && <FileText size={16} />}
                            {resource.type === 'link' && <LinkIcon size={16} />}
                            {resource.type === 'video' ? 'Watch Video' :
                              resource.type === 'document' ? 'View Document' : 'Visit Link'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {task.type === 'submission' && (
                  <TaskSubmission
                    task={task}
                    submissions={submissions[task.id] || []}
                    onSubmit={async (response) => {
                      try {
                        await addDoc(collection(db, 'taskSubmissions'), {
                          taskId: task.id,
                          userId: user.uid,
                          response,
                          submittedAt: serverTimestamp()
                        });
                        toast.success('Response submitted successfully');
                        loadData(); // Reload data to show new submission
                      } catch (error) {
                        console.error('Error submitting response:', error);
                        toast.error('Failed to submit response');
                      }
                    }}
                  />
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    Due: {formatDate(task.dueDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    Created: {formatDate(task.createdAt)}
                  </div>
                  {submissions[task.id]?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      {submissions[task.id].length} submissions
                    </div>
                  )}
                </div>
              </div>

              {hasPermission('canManageContent') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600">No tasks found</p>
          </div>
        )}
      </div>

      {/* Task Creation/Edit Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {selectedTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <TaskCreationForm
              initialData={selectedTask}
              onSubmit={handleAddTask}
              onCancel={() => {
                setShowAddTask(false);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Main Training Progress Component
const TrainingProgress = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();

  useEffect(() => {
    const loadUserGroup = async () => {
      try {
        setLoading(true);
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          if (userData?.assignedGroup) {
            const groupDoc = await getDoc(doc(db, 'trainingGroups', userData.assignedGroup));
            if (groupDoc.exists()) {
              setSelectedGroup({
                id: groupDoc.id,
                ...groupDoc.data()
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading user group:', error);
        toast.error('Failed to load assigned group');
      } finally {
        setLoading(false);
      }
    };

    loadUserGroup();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedGroup ? (
        <GroupSelection onSelectGroup={setSelectedGroup} />
      ) : (
        <>
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <ChevronLeft size={20} />
            Back to Groups
          </button>
          <TaskManagement group={selectedGroup} />
        </>
      )}
    </div>
  );
};

export default TrainingProgress;
```


### File: reportWebVitals.js
```
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

```


## Directory: routes


### File: routes\AdminRoute.jsx
```
// src/routes/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// This is a protected route component that requires specific permission to access
const AdminRoute = ({ children, requiredPermission = 'admin.managePermissions' }) => {
  const { user, loading, hasPermission } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Check if user has the required permission
  if (!user || !hasPermission(requiredPermission)) {
    toast.error(`Access denied: You need ${requiredPermission} permission`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
```


### File: routes\index.jsx
```
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'projects',
        element: <Projects />,
        children: [
          {
            path: ':projectId',
            element: <ProjectDetails />
          }
        ]
      },
      {
        path: 'team',
        element: <TeamManagement />
      },
      {
        path: 'resources',
        element: <Resources />
      },
      {
        path: 'analytics',
        element: <AnalyticsDashboard />
      }
    ]
  }
]);
```


### File: routes\ProtectedRoute.jsx
```
// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Basic authentication check
  if (!user) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Permission check if a specific permission is required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    toast.error(`Access denied: You need ${requiredPermission} permission`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```


## Directory: services


### File: services\firebaseDb copy.js
```
// src/services/firebaseDb.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

async function deleteProjectAndRelatedData(projectId) {
  const batch = writeBatch(db);

  // Delete the project document
  const projectRef = doc(db, 'projects', projectId);
  batch.delete(projectRef);

  // Delete related milestones
  const milestonesRef = collection(db, 'milestones');
  const milestonesQuery = query(milestonesRef, where('projectId', '==', projectId));
  const milestonesDocs = await getDocs(milestonesQuery);
  milestonesDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete related KPIs
  const kpisRef = collection(db, 'kpis');
  const kpisQuery = query(kpisRef, where('projectId', '==', projectId));
  const kpisDocs = await getDocs(kpisQuery);
  kpisDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete related documents references
  const documentsRef = collection(db, 'documents');
  const documentsQuery = query(documentsRef, where('projectId', '==', projectId));
  const documentsDocs = await getDocs(documentsQuery);
  documentsDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Execute the batch
  await batch.commit();
}

async function getProjectTasks(projectId) {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting project tasks:', error);
    throw error;
  }
}

export const firebaseDb = {
  // Projects
  async getProjects(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getProjects');
        return [];
      }

      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        milestones: doc.data().milestones || [], // Ensure milestones exist
        team: doc.data().team || [], // Ensure team exists
        resources: doc.data().resources || [] // Ensure resources exist
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to load projects');
    }
  },

  async getProject(projectId) {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  },

  async createProject(projectData) {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, projectData);
    return {
      id: docRef.id,
      ...projectData
    };
  },

  async updateProject(projectId, updates) {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, updates);
    return {
      id: projectId,
      ...updates
    };
  },

  async deleteProject(projectId) {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
    return projectId;
  },

  // Team Members
  async getTeamMembers(userId) {
    const teamRef = collection(db, 'team');
    const q = query(teamRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addTeamMember(memberData) {
    const teamRef = collection(db, 'team');
    const docRef = await addDoc(teamRef, memberData);
    return {
      id: docRef.id,
      ...memberData
    };
  },

  // Resources
  async getResources(userId) {
    const resourcesRef = collection(db, 'resources');
    const q = query(resourcesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // KPIs
  async getProjectKPIs(projectId) {
    const kpisRef = collection(db, 'kpis');
    const q = query(kpisRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addKPI(kpiData) {
    const kpisRef = collection(db, 'kpis');
    const docRef = await addDoc(kpisRef, kpiData);
    return {
      id: docRef.id,
      ...kpiData
    };
  },

  async deleteProject(projectId) {
    try {
      await deleteProjectAndRelatedData(projectId);
      return projectId;
    } catch (error) {
      console.error('Error deleting project and related data:', error);
      throw error;
    }
  },

  // Team Members
  async getTeamMembers(userId) {
    const teamRef = collection(db, 'team');
    const q = query(teamRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addTeamMember(memberData) {
    const teamRef = collection(db, 'team');
    const docRef = await addDoc(teamRef, memberData);
    return {
      id: docRef.id,
      ...memberData
    };
  },

  async updateTeamMember(memberId, updates) {
    const docRef = doc(db, 'team', memberId);
    await updateDoc(docRef, updates);
    return {
      id: memberId,
      ...updates
    };
  },

  async deleteTeamMember(memberId) {
    const docRef = doc(db, 'team', memberId);
    await deleteDoc(docRef);
    return memberId;
  },

  
};
```


### File: services\firebaseDb.js
```
// src/services/firebaseDb.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where, 
  updateDoc,
  addDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const firebaseDb = {
  async syncProjectTeamMembers(project) {
    if (!project.team || project.team.length === 0) return project;
    
    try {
      // Get current user statuses
      const teamIds = project.team.map(member => member.id);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', teamIds));
      const snapshot = await getDocs(q);
      
      const activeUserIds = new Set();
      snapshot.docs.forEach(doc => {
        if (['active', 'onLeave'].includes(doc.data().status)) {
          activeUserIds.add(doc.id);
        }
      });
      
      // Update team status
      const updatedTeam = project.team.map(member => ({
        ...member,
        status: activeUserIds.has(member.id) ? 'active' : 'inactive'
      }));
      
      // If the team has changed, update the project in the database
      if (JSON.stringify(project.team) !== JSON.stringify(updatedTeam)) {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, { team: updatedTeam });
      }
      
      return { ...project, team: updatedTeam };
    } catch (error) {
      console.error('Error syncing project team members:', error);
      return project;
    }
  },

  // Projects
  async getProjects(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getProjects');
        return [];
      }
  
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        milestones: doc.data().milestones || [],
        team: doc.data().team || [],
        resources: doc.data().resources || []
      }));
  
      // Sync team members for each project
      const syncedProjects = await Promise.all(
  projects.map(project => this.syncProjectTeamMembers(project))
);
      
      return syncedProjects;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to load projects');
    }
  },

  async createProject(projectData) {
    try {
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        ...projectData,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  },

  async updateProject(projectId, projectData) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: projectId,
        ...projectData,
        updatedAt: projectData.updatedAt
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  },

  async deleteProject(projectId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },

  // Team Members
  async getTeamMembers(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getTeamMembers');
        return [];
      }

      const teamRef = collection(db, 'team');
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', userId));
      const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';

      let teamQuery;
      if (isAdmin) {
        // Admin sees all team members
        teamQuery = query(teamRef);
      } else {
        // Regular users only see their team members
        teamQuery = query(teamRef, where('userId', '==', userId));
      }

      const snapshot = await getDocs(teamQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  },

  // Resources
  async getResources(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getResources');
        return [];
      }

      const resourcesRef = collection(db, 'resources');
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', userId));
      const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';

      let resourcesQuery;
      if (isAdmin) {
        // Admin sees all resources
        resourcesQuery = query(resourcesRef);
      } else {
        // Regular users only see their resources
        resourcesQuery = query(resourcesRef, where('userId', '==', userId));
      }

      const snapshot = await getDocs(resourcesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting resources:', error);
      throw error;
    }
  },

  // Helper function to check if user is admin
  async isUserAdmin(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Tasks
  async getProjectTasks(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectTasks');
        return [];
      }

      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting project tasks:', error);
      throw new Error('Failed to load tasks');
    }
  },

  async createTask(projectId, taskData) {
    try {
      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        createdAt: taskData.createdAt,
        updatedAt: taskData.updatedAt
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },

  async updateTask(projectId, taskId, taskData) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: taskId,
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        updatedAt: taskData.updatedAt
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  },

  async deleteTask(projectId, taskId) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },

  async updateTaskStatus(projectId, taskId, status) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  },

  // Project Activities
  async addProjectActivity(projectId, activityData) {
    try {
      const activitiesRef = collection(db, 'projects', projectId, 'activities');
      const docRef = await addDoc(activitiesRef, {
        ...activityData,
        createdAt: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        ...activityData,
        createdAt: activityData.createdAt
      };
    } catch (error) {
      console.error('Error adding project activity:', error);
      throw new Error('Failed to add project activity');
    }
  },

  async getProjectActivities(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectActivities');
        return [];
      }

      const activitiesRef = collection(db, 'projects', projectId, 'activities');
      const q = query(activitiesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting project activities:', error);
      throw new Error('Failed to load project activities');
    }
  },

  // Milestones
  async getProjectMilestones(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectMilestones');
        return [];
      }

      const milestonesRef = collection(db, 'projects', projectId, 'milestones');
      const q = query(milestonesRef, orderBy('dueDate', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting project milestones:', error);
      throw new Error('Failed to load milestones');
    }
  },

  async createMilestone(projectId, milestoneData) {
    try {
      const milestonesRef = collection(db, 'projects', projectId, 'milestones');
      const docRef = await addDoc(milestonesRef, {
        ...milestoneData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      return {
        id: docRef.id,
        ...milestoneData,
        createdAt: milestoneData.createdAt,
        updatedAt: milestoneData.updatedAt,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw new Error('Failed to create milestone');
    }
  },

  async updateMilestone(projectId, milestoneId, milestoneData) {
    try {
      const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
      await updateDoc(milestoneRef, {
        ...milestoneData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: milestoneId,
        ...milestoneData,
        updatedAt: milestoneData.updatedAt
      };
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw new Error('Failed to update milestone');
    }
  },

  async deleteMilestone(projectId, milestoneId) {
    try {
      const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
      await deleteDoc(milestoneRef);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw new Error('Failed to delete milestone');
    }
  },

  // Get tasks for a specific milestone
  async getMilestoneTasks(projectId, milestoneId) {
    try {
      if (!projectId || !milestoneId) {
        console.warn('Missing projectId or milestoneId for getMilestoneTasks');
        return [];
      }

      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const q = query(
        tasksRef,
        where('milestoneId', '==', milestoneId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting milestone tasks:', error);
      throw new Error('Failed to load milestone tasks');
    }
  },

  // Update milestone progress based on task completion
  async updateMilestoneProgress(projectId, milestoneId) {
    try {
      const tasks = await this.getMilestoneTasks(projectId, milestoneId);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
      await updateDoc(milestoneRef, {
        progress,
        updatedAt: new Date().toISOString()
      });

      return progress;
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      throw new Error('Failed to update milestone progress');
    }
  },
};
```


### File: services\hardwareService.js
```
// src/services/hardwareService.js
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    query, 
    where,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export const hardwareService = {
    // Get all hardware items
    async getHardwareItems(userId) {
      try {
        const hardwareRef = collection(db, 'hardware');
        const q = query(hardwareRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting hardware items:', error);
        throw error;
      }
    },
  
    // Add new hardware item
    async addHardwareItem(userId, itemData) {
      try {
        const hardwareRef = collection(db, 'hardware');
        const docRef = await addDoc(hardwareRef, {
          ...itemData,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'available',
          checkoutHistory: []
        });
        
        return {
          id: docRef.id,
          ...itemData
        };
      } catch (error) {
        console.error('Error adding hardware item:', error);
        throw error;
      }
    },
  
    // Update hardware item
    async updateHardwareItem(itemId, updates) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        
        return {
          id: itemId,
          ...updates
        };
      } catch (error) {
        console.error('Error updating hardware item:', error);
        throw error;
      }
    },
  
    // Delete hardware item
    async deleteHardwareItem(itemId) {
      try {
        await deleteDoc(doc(db, 'hardware', itemId));
        return itemId;
      } catch (error) {
        console.error('Error deleting hardware item:', error);
        throw error;
      }
    },
  
    // Check out hardware item
    async checkoutItem(itemId, userId, checkoutData) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Hardware item not found');
        }
  
        const currentData = docSnap.data();
        const checkoutHistory = currentData.checkoutHistory || [];
  
        await updateDoc(docRef, {
          status: 'in-use',
          currentCheckout: {
            userId,
            checkoutDate: serverTimestamp(),
            expectedReturnDate: checkoutData.expectedReturnDate,
            purpose: checkoutData.purpose
          },
          checkoutHistory: [...checkoutHistory, {
            userId,
            checkoutDate: new Date().toISOString(),
            expectedReturnDate: checkoutData.expectedReturnDate,
            purpose: checkoutData.purpose
          }],
          updatedAt: serverTimestamp()
        });
  
        return {
          id: itemId,
          status: 'in-use',
          ...checkoutData
        };
      } catch (error) {
        console.error('Error checking out hardware item:', error);
        throw error;
      }
    },
  
    // Check in hardware item
    async checkinItem(itemId, condition) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Hardware item not found');
        }
  
        const currentData = docSnap.data();
        const checkoutHistory = currentData.checkoutHistory || [];
        const lastCheckout = currentData.currentCheckout;
  
        if (lastCheckout) {
          checkoutHistory[checkoutHistory.length - 1] = {
            ...lastCheckout,
            returnDate: new Date().toISOString(),
            returnCondition: condition
          };
        }
  
        await updateDoc(docRef, {
          status: 'available',
          currentCheckout: null,
          checkoutHistory,
          condition,
          updatedAt: serverTimestamp()
        });
  
        return {
          id: itemId,
          status: 'available',
          condition
        };
      } catch (error) {
        console.error('Error checking in hardware item:', error);
        throw error;
      }
    },
  
    // Log maintenance
    async logMaintenance(itemId, maintenanceData) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Hardware item not found');
        }
  
        const currentData = docSnap.data();
        const maintenanceHistory = currentData.maintenanceHistory || [];
  
        await updateDoc(docRef, {
          status: 'maintenance',
          maintenanceHistory: [...maintenanceHistory, {
            ...maintenanceData,
            date: new Date().toISOString()
          }],
          updatedAt: serverTimestamp()
        });
  
        return {
          id: itemId,
          status: 'maintenance',
          ...maintenanceData
        };
      } catch (error) {
        console.error('Error logging maintenance:', error);
        throw error;
      }
    }
  };
```


### File: services\resourcePermissions.js
```
// src/services/resourcePermissions.js

export const RESOURCE_PERMISSIONS = {
    ADMIN: 'Administrator',
    SUPERVISOR: 'Supervisor',
    COMMUNITY_MEMBER: 'Community Member',
    PROJECT_MEMBER: 'Project Member',
    INSTRUCTOR: 'Instructor',
    RESOURCE_MANAGER: 'Resource Manager'
  };
  
  export const resourcePermissions = {
    canView: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.COMMUNITY_MEMBER,
        RESOURCE_PERMISSIONS.PROJECT_MEMBER,
        RESOURCE_PERMISSIONS.INSTRUCTOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canAddHardware: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canAddSoftware: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canBookVenue: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.COMMUNITY_MEMBER,
        RESOURCE_PERMISSIONS.PROJECT_MEMBER,
        RESOURCE_PERMISSIONS.INSTRUCTOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canViewHistory: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canBorrow: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.COMMUNITY_MEMBER,
        RESOURCE_PERMISSIONS.PROJECT_MEMBER,
        RESOURCE_PERMISSIONS.INSTRUCTOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canEditQuantity: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    }
  };
```


### File: services\resourceService copy.js
```
// src/services/resourceService.js
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    Timestamp,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export const resourceService = {
    // Get all resources
    async getResources() {
        try {
          console.log('Fetching resources...'); // Debug log
          const resourcesRef = collection(db, 'resources');
          const snapshot = await getDocs(resourcesRef);
          
          if (snapshot.empty) {
            console.log('No resources found in Firestore');
            return [];
          }
      
          const resources = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Resource data:', { id: doc.id, ...data }); // Debug log
            return {
              id: doc.id,
              ...data
            };
          });
      
          console.log('Fetched resources:', resources); // Debug log
          return resources;
        } catch (error) {
          console.error('Error fetching resources:', error);
          throw error;
        }
      },
  
      async removeBooking(bookingId) {
        try {
          const bookingRef = doc(db, 'bookings', bookingId);
          await deleteDoc(bookingRef);
          
          // Add to history
          await this.addHistoryEntry(bookingId, 'booking_cancelled', {
            timestamp: serverTimestamp(),
            action: 'cancelled'
          });
      
          return bookingId;
        } catch (error) {
          console.error('Error removing booking:', error);
          throw error;
        }
      },

    async addResource(resourceData) {
      const resourcesRef = collection(db, 'resources');
      const docRef = await addDoc(resourcesRef, {
        ...resourceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...resourceData
      };
    },
  
    async updateResource(id, updates) {
      const docRef = doc(db, 'resources', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return {
        id,
        ...updates
      };
    },
  
    async deleteResource(id) {
      await deleteDoc(doc(db, 'resources', id));
      return id;
    },
  
    // Venue Bookings
    async getBookings(startDate, endDate) {
        try {
          const bookingsRef = collection(db, 'bookings');
          const q = query(
            bookingsRef,
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate))
          );
          
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date.toDate() // Convert Timestamp to Date
            };
          });
        } catch (error) {
          console.error('Error getting bookings:', error);
          throw error;
        }
      },
  
      async addBooking(bookingData) {
        try {
          const startTime = bookingData.timeSlot.split('-')[0];
          const endTime = calculateEndTime(startTime, bookingData.duration);
          
          // Generate all time slots that should be booked
          const affectedTimeSlots = getAffectedTimeSlots(startTime, endTime);
          
          // Check for conflicts in all affected time slots
          const conflicts = await this.checkTimeSlotConflicts(
            bookingData.date,
            bookingData.venue,
            affectedTimeSlots
          );
      
          if (conflicts.length > 0) {
            throw new Error('One or more time slots are already booked');
          }
      
          // Create the booking with additional time slot information
          const bookingRef = await addDoc(collection(db, 'bookings'), {
            ...bookingData,
            startTime,
            endTime,
            affectedTimeSlots,
            createdAt: serverTimestamp()
          });
      
          return {
            id: bookingRef.id,
            ...bookingData
          };
        } catch (error) {
          console.error('Error adding booking:', error);
          throw error;
        }
      },

      
  
    async cancelBooking(id) {
      await deleteDoc(doc(db, 'bookings', id));
      return id;
    },
  
    // Resource History
    async addHistoryEntry(resourceId, action, details) {
      const historyRef = collection(db, 'resourceHistory');
      await addDoc(historyRef, {
        resourceId,
        action,
        details,
        timestamp: serverTimestamp()
      });
    },
  
    async getResourceHistory(resourceId) {
      const historyRef = collection(db, 'resourceHistory');
      const q = query(
        historyRef,
        where('resourceId', '==', resourceId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  };

  
```


### File: services\resourceService.js
```
// src/services/resourceService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  orderBy,
  query, 
  where, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase/config';
import { storage } from '../firebase/storageConfig';

export const resourceService = {
  // Upload multiple images and get their URLs
  async uploadImages(files, resourceType, category, resourceName) {
    try {
      const uploadPromises = files.map(async (file) => {
        const path = `resources/${resourceType}/${category}/${resourceName}_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { url, path };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  },

  // Delete multiple images by their storage paths
  async deleteImages(imagePaths) {
    try {
      const deletePromises = imagePaths.map(async (path) => {
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error('Failed to delete images');
    }
  },

  // Get all resources of a specific type
  async getResources(resourceType) {
    try {
      const resourcesRef = collection(db, resourceType);
      const snapshot = await getDocs(resourcesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure status object exists with default values
        status: {
          available: 0,
          inUse: 0,
          maintenance: 0,
          ...(doc.data().status || {})
        }
      }));
    } catch (error) {
      console.error('Error getting resources:', error);
      throw new Error('Failed to load resources');
    }
  },

  // Add new resource with multiple images
  async addResource(resourceType, resourceData) {
    try {
      const { imageFiles, ...data } = resourceData;
      
      // Upload images if provided
      let imageUrls = [];
      let imagePaths = [];
      if (imageFiles?.length) {
        const uploads = await this.uploadImages(
          imageFiles,
          resourceType,
          data.category,
          data.name
        );
        imageUrls = uploads.map(u => u.url);
        imagePaths = uploads.map(u => u.path);
      }

      // Add resource document
      const resourceRef = collection(db, resourceType);
      const docRef = await addDoc(resourceRef, {
        ...data,
        images: imageUrls,
        imagePaths, // Store paths for future deletion
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add to history
      await this.addToHistory(resourceType, docRef.id, {
        action: 'created',
        details: 'Resource created',
        timestamp: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...data,
        images: imageUrls,
        imagePaths
      };
    } catch (error) {
      console.error('Error adding resource:', error);
      throw new Error('Failed to add resource');
    }
  },

  // Update resource including images
  async updateResource(resourceType, resourceId, updates) {
    try {
      const resourceRef = doc(db, resourceType, resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Resource not found');
      }

      const currentData = resourceDoc.data();
      const { imageFiles, imagesToDelete, ...data } = updates;

      // Handle image updates
      let newImages = [...(currentData.images || [])];
      let newImagePaths = [...(currentData.imagePaths || [])];

      // Delete removed images
      if (imagesToDelete?.length) {
        const pathsToDelete = imagesToDelete.map(url => {
          const index = currentData.images.indexOf(url);
          return currentData.imagePaths[index];
        });
        await this.deleteImages(pathsToDelete);
        
        // Remove deleted images from arrays
        newImages = newImages.filter(url => !imagesToDelete.includes(url));
        newImagePaths = newImagePaths.filter(path => !pathsToDelete.includes(path));
      }

      // Upload new images
      if (imageFiles?.length) {
        const uploads = await this.uploadImages(
          imageFiles,
          resourceType,
          data.category || currentData.category,
          data.name || currentData.name
        );
        newImages = [...newImages, ...uploads.map(u => u.url)];
        newImagePaths = [...newImagePaths, ...uploads.map(u => u.path)];
      }

      // Update document
      const updateData = {
        ...data,
        images: newImages,
        imagePaths: newImagePaths,
        updatedAt: serverTimestamp()
      };

      await updateDoc(resourceRef, updateData);

      // Add to history
      await this.addToHistory(resourceType, resourceId, {
        action: 'updated',
        details: 'Resource updated',
        changes: Object.keys(data),
        timestamp: serverTimestamp()
      });

      return {
        id: resourceId,
        ...currentData,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating resource:', error);
      throw new Error('Failed to update resource');
    }
  },

  // Delete resource and its images
  async deleteResource(resourceType, resourceId) {
    try {
      const resourceRef = doc(db, resourceType, resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Resource not found');
      }

      const { imagePaths } = resourceDoc.data();

      // Delete images from storage
      if (imagePaths?.length) {
        await this.deleteImages(imagePaths);
      }

      // Delete resource document
      await deleteDoc(resourceRef);

      // Add to history
      await this.addToHistory(resourceType, resourceId, {
        action: 'deleted',
        details: 'Resource deleted',
        timestamp: serverTimestamp()
      });

      return resourceId;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw new Error('Failed to delete resource');
    }
  },

  // Update resource status quantities
  async updateStatus(resourceType, resourceId, newStatus) {
    try {
      const resourceRef = doc(db, resourceType, resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Resource not found');
      }

      const currentData = resourceDoc.data();

      // Validate total quantity remains the same
      const currentTotal = Object.values(currentData.status).reduce((a, b) => a + b, 0);
      const newTotal = Object.values(newStatus).reduce((a, b) => a + b, 0);

      if (currentTotal !== newTotal) {
        throw new Error('Total quantity must remain the same');
      }

      await updateDoc(resourceRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Add to history
      await this.addToHistory(resourceType, resourceId, {
        action: 'status_updated',
        details: 'Status quantities updated',
        previousStatus: currentData.status,
        newStatus,
        timestamp: serverTimestamp()
      });

      return {
        id: resourceId,
        ...currentData,
        status: newStatus
      };
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update status');
    }
  },

  // Add entry to resource history
  async addToHistory(resourceType, resourceId, historyData) {
    try {
      const historyRef = collection(db, `${resourceType}History`);
      await addDoc(historyRef, {
        resourceId,
        ...historyData
      });
    } catch (error) {
      console.error('Error adding to history:', error);
      // Don't throw error for history additions
    }
  },

  // Get resource history
  async getHistory(resourceType, resourceId) {
    try {
      const historyRef = collection(db, `${resourceType}History`);
      const q = query(
        historyRef,
        where('resourceId', '==', resourceId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting history:', error);
      throw new Error('Failed to load history');
    }
  }
};
```


### File: setupTests.js
```
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

```


## Directory: stores


### File: stores\projectsSlice.jsx
```
// src/stores/projectsSlice.js
import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  }))
}));
```


### File: stores\projectStore.js
```
import create from 'zustand';
import { firebaseDb } from '../services/firebaseDb';

const useProjectStore = create((set) => ({
  projects: [
    {
      id: '1',
      name: 'Voice Training',
      description: 'Swahili text to speech model training system',
      status: 'inProgress',
      milestones: [
        {
          name: 'Website Development',
          dueDate: '2024-11-30',
          status: 'pending'
        },
        {
          name: 'Portal Testing',
          dueDate: '2024-12-31',
          status: 'pending'
        }
      ]
    },
    {
      id: '2',
      name: 'EnergyOpt',
      description: 'Machine learning software for energy efficiency',
      status: 'inProgress',
      milestones: [
        {
          name: 'Data Analysis',
          dueDate: '2024-11-15',
          status: 'completed'
        },
        {
          name: 'Algorithm Implementation',
          dueDate: '2024-12-15',
          status: 'pending'
        }
      ]
    }
    // Add all other projects from the document
  ],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  }))
}));
```


## Directory: types


### File: types\index.ts
```
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    projects: string[];  // Array of project IDs
    skills: string[];
  }
  
  export interface Milestone {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'inProgress' | 'completed';
    assignedTo: string[];  // Array of team member IDs
  }
  
  export interface Resource {
    id: string;
    name: string;
    type: 'equipment' | 'space' | 'software' | 'other';
    status: 'available' | 'inUse' | 'maintenance';
    assignedTo?: string;  // Project ID if assigned
  }
  
  export interface KPI {
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    category: 'technical' | 'business' | 'team';
    date: Date;
  }
  
  export interface BusinessMetrics {
    targetMarket: string;
    revenueModel: string;
    marketSize: string;
    costEstimate: number;
    expectedRevenue: number;
    breakEvenPoint?: Date;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'inProgress' | 'completed';
    startDate: Date;
    endDate: Date;
    team: TeamMember[];
    milestones: Milestone[];
    resources: Resource[];
    kpis: KPI[];
    businessMetrics: BusinessMetrics;
  }
  
  // Additional useful types
  export interface ProjectUpdate {
    id: string;
    date: Date;
    content: string;
    author: string;
    type: 'milestone' | 'general' | 'issue';
  }
  
  export interface TaskStatus {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }
  
  export interface ProjectMetrics {
    progress: number;
    resourceUtilization: number;
    teamPerformance: number;
    kpiAchievement: number;
  }
```


### File: types\project.ts
```
import { TeamMember, Milestone,Resource,KPI,BusinessMetrics } from './index.ts';

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'inProgress' | 'completed';
    startDate: Date;
    endDate: Date;
    team: TeamMember[];
    milestones: Milestone[];
    resources: Resource[];
    kpis: KPI[];
    businessMetrics: BusinessMetrics;
  }
```


## Directory: utils


### File: utils\api.js
```
const API_BASE = process.env.REACT_APP_API_URL;

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};
```


### File: utils\exportUtils.js
```
// src/utils/exportUtils.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (data, title) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

  // Project data table
  const projectTableData = data.projects.map(project => [
    project.name,
    project.status,
    `${project.progress}%`,
    project.team.length,
    project.resources.length
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Project', 'Status', 'Progress', 'Team Size', 'Resources']],
    body: projectTableData,
  });

  // Resource utilization table
  const resourceTableData = data.resources.map(resource => [
    resource.resource,
    `${resource.used}%`,
    `${resource.available}%`
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Resource', 'Used', 'Available']],
    body: resourceTableData,
  });

  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (data, title) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Projects worksheet
  const projectsWS = XLSX.utils.json_to_sheet(data.projects.map(project => ({
    'Project Name': project.name,
    'Status': project.status,
    'Progress': `${project.progress}%`,
    'Team Size': project.team.length,
    'Resources': project.resources.length,
    'Start Date': new Date(project.startDate).toLocaleDateString(),
    'End Date': new Date(project.endDate).toLocaleDateString()
  })));

  // Resources worksheet
  const resourcesWS = XLSX.utils.json_to_sheet(data.resources.map(resource => ({
    'Resource': resource.resource,
    'Used (%)': resource.used,
    'Available (%)': resource.available
  })));

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, projectsWS, 'Projects');
  XLSX.utils.book_append_sheet(wb, resourcesWS, 'Resources');

  // Save the file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToCSV = (data, title) => {
  // Convert projects to CSV
  const projectsCSV = data.projects.map(project => ({
    'Project Name': project.name,
    'Status': project.status,
    'Progress': `${project.progress}%`,
    'Team Size': project.team.length,
    'Resources': project.resources.length,
    'Start Date': new Date(project.startDate).toLocaleDateString(),
    'End Date': new Date(project.endDate).toLocaleDateString()
  }));

  const csv = XLSX.utils.json_to_csv(projectsCSV);
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```


### File: utils\helpers.js
```

```


### File: utils\storage.jsx
```
export const storage = {
    get: (key) => JSON.parse(localStorage.getItem(key)),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    remove: (key) => localStorage.removeItem(key)
  };
```


# Directory: public


### File: index.html
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

```


### File: manifest.json
```
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```


### File: robots.txt
```
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```


# File: package.json
```
{
  "name": "hub-system",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@shadcn/ui": "^0.0.4",
    "@tanstack/react-query": "^5.61.3",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "date-fns": "^4.1.0",
    "firebase": "^10.8.0",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.4",
    "lucide-react": "^0.460.0",
    "react": "^18.3.1",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^18.3.1",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^7.0.1",
    "react-scripts": "^5.0.1",
    "recharts": "^2.13.3",
    "tailwinds": "^0.0.0",
    "tailwindscss": "^0.3.0",
    "web-vitals": "^2.1.4",
    "xlsx": "^0.18.5",
    "zustand": "^5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15"
  }
}

```


# File: .env
```
REACT_APP_API_URL=your_api_url
REACT_APP_STORAGE_KEY=hub_management_system

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyCVWx9pbz2dsKjxj9J73qYKcMiPCsqprFs
REACT_APP_FIREBASE_AUTH_DOMAIN=hub-management.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://hub-management-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=hub-management
REACT_APP_FIREBASE_STORAGE_BUCKET=hub-management.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=460632870489
REACT_APP_FIREBASE_APP_ID=1:460632870489:web:44e245f85dee94f8ea2b48
REACT_APP_FIREBASE_MEASUREMENT_ID=G-0JFXS5PVM7
```

