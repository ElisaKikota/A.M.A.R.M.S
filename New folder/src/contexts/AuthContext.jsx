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
  getDocs
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
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

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
  
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Account not found or access denied');
      }

      const userData = userDoc.data();
      
      // Check account status before setting any state or signing out
      if (userData.status === 'pending') {
        throw new Error('Your account is pending approval');
      } else if (userData.status === 'dormant' || userData.status === 'suspended') {
        throw new Error('Your account has been deactivated');
      }

      // If we get here, the user is valid, so set their role and permissions
      setUserRole(userData.role);
      
      // Get role permissions
      if (userData.role) {
        const roleDoc = await getDoc(doc(db, 'roles', userData.role));
        
        if (roleDoc.exists()) {
          setRolePermissions(roleDoc.data().permissions || {});
        }
      }
      
      // Set user data immediately
      setUser({
        ...userCredential.user,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        isAdmin: userData.role === 'admin'
      });

      toast.success('Logged in successfully');
      return userCredential.user;
    } catch (error) {
      // If there was an error, make sure to sign out and clear state
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setRolePermissions({});
      
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state first to prevent flashing
      setUser(null);
      setUserRole(null);
      setRolePermissions({});
      
      // Then sign out
      await signOut(auth);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Navigate to login with logout state
      return { from: '/logout' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to log out');
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