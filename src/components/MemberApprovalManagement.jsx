import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { UserCheck, UserX, AlertCircle } from 'lucide-react';

const MemberApprovalManagement = () => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      setPendingMembers(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error loading pending members:', error);
      toast.error('Failed to load pending members');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'active',
        approvedAt: new Date().toISOString()
      });
      
      toast.success('Member approved successfully');
      loadPendingMembers(); // Reload the list
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    }
  };

  const handleReject = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
      
      toast.success('Member rejected');
      loadPendingMembers(); // Reload the list
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member');
    }
  };

  if (!hasPermission('canManageUsers')) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        You don't have permission to manage member approvals.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pending Approvals</h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
          {pendingMembers.length} pending
        </span>
      </div>

      {pendingMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No pending approvals</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingMembers.map(member => (
            <div key={member.id} className="bg-white rounded-lg shadow p-4">
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
                    Requested: {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(member.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                  >
                    <UserCheck size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
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
  );
};

export default MemberApprovalManagement;