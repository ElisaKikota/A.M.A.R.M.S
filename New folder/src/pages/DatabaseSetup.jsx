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