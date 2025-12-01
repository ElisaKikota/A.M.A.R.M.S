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
  updateEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
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
import { storageService } from '../firebase/storageConfig';
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
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      // Use official deployed app URL so the link in the email is correct
      const actionCodeSettings = {
        url: 'https://amarms.netlify.app/login',
        handleCodeInApp: false
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);

      if (error.code === 'auth/user-not-found') {
        // Do not reveal that the email doesn't exist – generic message instead
        toast.success('Password reset email sent. Please check your inbox.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later');
      } else {
        toast.error(error.message || 'Failed to send password reset email');
      }

      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);

      // Handle password change with re-authentication
      if (updates.newPassword && updates.currentPassword) {
        // Need to reauthenticate before changing password
        if (!auth.currentUser) {
          throw new Error('You must be logged in to change your password');
        }

        // Create credential with current password
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          updates.currentPassword
        );

        // Reauthenticate user
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Now update password
        await updatePassword(auth.currentUser, updates.newPassword);
        
        // Remove password fields from updates object to not store in Firestore
        delete updates.newPassword;
        delete updates.currentPassword;
        
        toast.success('Password updated successfully');
      }
      
      // Update email if provided
      if (updates.email && user?.email !== updates.email) {
        await updateEmail(auth.currentUser, updates.email);
      }

      // Remove any empty fields to not overwrite existing data
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined || updates[key] === '') {
          delete updates[key];
        }
      });

      // Only update Firestore if there are remaining fields to update
      if (Object.keys(updates).length > 0) {
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
      }
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect current password');
      } else if (error.code === 'auth/weak-password') {
        toast.error('New password is too weak');
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
      throw error;
    }
  };

  // Update user profile picture
  const updateProfilePicture = async (file) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('Starting profile picture update in FirebaseContext:', file.name);

      // Create a unique path for the profile picture
      const path = `users/profile_pictures/profile_${user.uid}_${Date.now()}_${file.name}`;
      console.log('Using storage path:', path);
      
      // Use the storageService to upload the file
      console.log('Using storageService to upload the file');
      const photoURL = await storageService.uploadFile(file, path);
      
      console.log('File uploaded, download URL obtained:', photoURL);
      
      // Update the auth profile
      await updateProfile(auth.currentUser, { photoURL });
      
      console.log('Auth profile updated with new photo URL');
      
      // Update the Firestore document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        photoURL,
        updatedAt: new Date().toISOString() 
      });
      
      console.log('Firestore document updated');
      
      // Update the user state
      setUser(prev => ({
        ...prev,
        photoURL
      }));
      
      console.log('User state updated with new photo URL');
      // The success toast will be shown by the component that called this function
      return photoURL;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture: ' + (error.message || 'Unknown error'));
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
    updateProfilePicture,
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