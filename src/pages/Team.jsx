import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseDb } from '../services/firebaseDb';
import TeamMemberCard from '../components/team/TeamMemberCard';
import DeleteConfirmationModal from '../components/team/DeleteConfirmationModal';
import SignIn from '../components/auth/SignIn';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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
            profileImage: userData.photoURL || null,
            createdAt: userData.createdAt,
            approvedAt: userData.approvedAt,
            lastLoginAt: userData.lastLoginAt,
            lastActivityAt: userData.lastActivityAt,
            updatedAt: userData.updatedAt,
            // Track activity data
            activity: getUserActivity(userData),
            projects: [] // Will be populated with project assignments
          };
        })
        // Exclude users with the 'client' role
        .filter(member => member.role !== 'client');

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