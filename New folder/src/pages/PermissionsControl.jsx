// src/pages/PermissionsControl.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';
import { Shield, Search, AlertCircle, Check, X, Info, Lock, Save, Upload } from 'lucide-react';
import { setupRoles } from '../firebase/setupRoles';

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
  const [editedUserRoles, setEditedUserRoles] = useState({});
  const [activeTab, setActiveTab] = useState('roles');

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

  const handleUploadChanges = async () => {
    try {
      setLoading(true);
      await setupRoles();
      await loadRolesAndUsers(); // Refresh the roles list
      toast.success('Role changes uploaded successfully');
    } catch (error) {
      console.error('Error uploading role changes:', error);
      toast.error('Failed to upload role changes');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = (userId, newRole) => {
    setEditedUserRoles(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleSaveUserRole = async (userId) => {
    try {
      if (!editedUserRoles[userId]) {
        toast.error('Please select a role');
        return;
      }

      setLoading(true);
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        role: editedUserRoles[userId],
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: editedUserRoles[userId] } 
          : user
      ));
      
      // Clear the edited role for this user
      setEditedUserRoles(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
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
        <button
          onClick={handleUploadChanges}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Upload size={16} />
          Upload Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Role Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            User Management
          </button>
        </nav>
      </div>

      {/* Role Management Tab */}
      {activeTab === 'roles' && (
        <>
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
        </>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.photoURL ? (
                            <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium text-sm">
                                {user.displayName?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={editedUserRoles[user.id] || user.role || ''}
                        onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSaveUserRole(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Save Changes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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