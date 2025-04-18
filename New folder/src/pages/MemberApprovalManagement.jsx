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

  // Add developer approvals section
  const renderDeveloperApprovals = () => {
    if (!hasPermission('canApproveDevelopers')) return null;
    
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Pending Developer Approvals</h2>
        {/* Similar approval UI but for developers */}
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
      {renderDeveloperApprovals()}
    </div>
  );
};

export default MemberApprovalManagement;