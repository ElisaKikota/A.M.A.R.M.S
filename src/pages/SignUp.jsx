import React, { useState, useEffect } from 'react';
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
      description: 'Basic access to view resources and participate in training'
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions (requires authorization code)'
    },
    {
      id: 'hod',
      name: 'Head of Department',
      description: 'Department-level oversight and management (requires approval)'
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Oversees projects and team activities (requires approval)'
    },
    {
      id: 'pr',
      name: 'PR',
      description: 'Manages public relations and communications'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Handles marketing strategies and campaigns'
    },
    {
      id: 'resource_manager',
      name: 'Resource Manager',
      description: 'Manages hardware, software and venue resources'
    },
    {
      id: 'graphics',
      name: 'Graphics',
      description: 'Handles design and visual content creation'
    },
    {
      id: 'leader',
      name: 'Leader',
      description: 'Team leader with project management responsibilities (requires approval)'
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'Handles system development and maintenance (requires approval)'
    }
  ];

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({ ...formData, role: newRole });
    // Show auth code for admin role only
    setShowAuthCode(newRole === 'admin');
  };

  // Initialize showAuthCode based on initial role
  useEffect(() => {
    setShowAuthCode(formData.role === 'admin');
  }, [formData.role]);

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

      // Handle different role types
      if (formData.role === 'admin') {
        // Verify auth code for admin role
        const authRef = doc(db, 'authorization', 'administrator');
        const authDoc = await getDoc(authRef);

        if (!authDoc.exists() || authDoc.data().code !== formData.authCode) {
          await userCredential.user.delete();
          toast.error('Invalid authorization code');
          return;
        }

        // Create admin user document with active status
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userData,
          status: 'active'
        });
        toast.success('Admin account created successfully!');
      } else if (['supervisor', 'leader', 'hod', 'developer'].includes(formData.role)) {
        // Add to approval collection for roles requiring approval
        await setDoc(doc(db, 'usersWaitingApproval', userCredential.user.uid), {
          ...userData,
          status: 'pending'
        });
        toast.success('Account created! Waiting for admin approval');
      } else {
        // For other roles, create user document with pending status
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
            Create your A.M.A.R.M.S account
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