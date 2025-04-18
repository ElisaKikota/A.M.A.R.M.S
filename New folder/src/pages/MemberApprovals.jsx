import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { UserCheck, UserX, Search, AlertCircle, User } from 'lucide-react';

const MemberApprovals = () => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      const pendingRef = collection(db, 'usersWaitingApproval');
      const snapshot = await getDocs(pendingRef);
      
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      // Move to users collection with active status
      await setDoc(doc(db, 'users', member.id), {
        ...member,
        status: 'active',
        approvedAt: serverTimestamp()
      });

      // Delete from waiting approval
      await deleteDoc(doc(db, 'usersWaitingApproval', member.id));
      
      toast.success('Member approved successfully');
      loadPendingMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    }
  };

  const handleReject = async (member) => {
    try {
      await deleteDoc(doc(db, 'usersWaitingApproval', member.id));
      toast.success('Member rejected');
      loadPendingMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member');
    }
  };

  const filteredMembers = pendingMembers.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Member Approvals</h1>
        <p className="text-gray-500 mt-1">Review and approve new member requests</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              {filteredMembers.length} pending
            </span>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No pending approvals found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMembers.map(member => (
              <div key={member.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberApprovals;