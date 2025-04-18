import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Home, 
  Folder, 
  Database, 
  Users, 
  BarChart, 
  Settings, 
  Bell, 
  LogOut, 
  UserCheck, 
  Shield,
  CheckSquare,
  Calendar as CalendarIcon,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext'; // Add useAuth import
import { useActivityLog } from '../../contexts/ActivityLogContext'; // Add ActivityLog import
import { toast } from 'react-hot-toast';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  
  const { hasPermission } = useAuth();
  
  // Define menu items with required permissions
  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/',
      permission: 'dashboard.view' 
    },
    { 
      icon: Folder, 
      label: 'Projects', 
      path: '/projects',
      permission: 'projects.view' 
    },
    { 
      icon: CheckSquare, 
      label: 'My Tasks', 
      path: '/tasks',
      permission: 'tasks.view' 
    },
    { 
      icon: Users, 
      label: 'Team', 
      path: '/team',
      permission: 'team.view' 
    },
    { 
      icon: Database, 
      label: 'Resources', 
      path: '/resources',
      permission: 'resources.view' 
    },
    { 
      icon: BarChart, 
      label: 'Marketing', 
      path: '/marketing',
      permission: 'marketing.view' 
    },
    { 
      icon: FileText, 
      label: 'PR', 
      path: '/pr',
      permission: 'pr.view' 
    },
    { 
      icon: ImageIcon, 
      label: 'Graphics', 
      path: '/graphics',
      permission: 'graphics.view' 
    },
    { 
      icon: CalendarIcon, 
      label: 'Calendar', 
      path: '/calendar',
      permission: 'calendar.view' 
    },
    { 
      icon: BarChart, 
      label: 'Reports', 
      path: '/reports',
      permission: 'reports.view' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      permission: null // Everyone can access settings
    },
    { 
      icon: UserCheck, 
      label: 'Member Approvals', 
      path: '/member-approvals',
      permission: 'admin.approveMembers' 
    },
    { 
      icon: Shield, 
      label: 'Permissions', 
      path: '/permissions',
      permission: 'admin.managePermissions' 
    },
  ];

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => {
    // If no permission is required, or user has the required permission
    return !item.permission || hasPermission(item.permission);
  });

  return (
    <div 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 text-white transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <nav className="space-y-2 px-2 py-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center h-12 gap-3 px-4 rounded-lg transition-colors whitespace-nowrap overflow-hidden
                ${location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <div className="flex-shrink-0 w-6 flex items-center justify-center">
                <Icon size={20} />
              </div>
              <span 
                className={`transform transition-all duration-300 ${
                  isCollapsed 
                    ? 'opacity-0 -translate-x-4' 
                    : 'opacity-100 translate-x-0'
                }`}
                style={{ width: isCollapsed ? 0 : 'auto' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const NotificationMenu = ({ pendingCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg relative"
      >
        <Bell size={20} />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {pendingCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-4">
          <h3 className="font-medium mb-2">Notifications</h3>
          {pendingCount > 0 ? (
            <Link 
              to="/member-approvals"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <UserCheck className="text-blue-600" size={16} />
              <div className="flex-1">
  <p className="text-sm">{pendingCount} member{pendingCount !== 1 ? 's' : ''} waiting for approval</p>
</div>
            </Link>
          ) : (
            <p className="text-sm text-gray-500">No new notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useFirebase();
  const [userData, setUserData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          // Load pending approvals count for admin
          if (isAdmin) {
            const pendingSnapshot = await getDocs(collection(db, 'usersWaitingApproval'));
            setPendingCount(pendingSnapshot.size);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user?.uid, isAdmin]);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/projects': return 'Projects';
      case '/tasks': return 'My Tasks';
      case '/team': return 'Team Management';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      case '/resources': return 'Resources';
      case '/member-approvals': return 'Member Approvals';
      case '/permissions': return 'Permissions';
      case '/marketing': return 'Marketing';
      default: return 'Dashboard';
    }
  };

  const handleLogout = async () => {
    try {
      // Navigate first with isLogout flag
      navigate('/login', { state: { isLogout: true }, replace: true });
      // Then perform logout
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b h-16 flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded">
            <Home className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">A.M.A.R.M.S</h1>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-4" />
        
        <h2 className="text-gray-500 font-medium">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationMenu pendingCount={pendingCount} />
        
        <div className="h-8 w-px bg-gray-200" />
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-medium">{userData?.name || 'User'}</div>
            <div className="text-sm text-gray-500">
              {userData?.role === 'admin' ? 'Administrator' : 
               userData?.role?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Member'}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { loading } = useFirebase();
  const location = useLocation();
  const { logPageVisit } = useActivityLog();
  
  // Log page visits when location changes
  useEffect(() => {
    logPageVisit(location.pathname);
  }, [location.pathname, logPageVisit]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={`pt-16 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;