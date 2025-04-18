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
        taskType: formData.taskType,
        status: 'pending',
        assignedTo: memberId,
        assignee: {
          id: memberId,
          name: memberData.name
        },
        assignedBy: {
          id: user.uid,
          name: user.displayName || user.email
        },
        assignedAt: new Date().toISOString(),
        projectId: formData.projectId || null
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Task Type</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="research">Research</option>
                <option value="documentation">Documentation</option>
                <option value="testing">Testing</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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