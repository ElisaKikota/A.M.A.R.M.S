import React from 'react';
import { Mail, Phone, User, Briefcase, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeamMemberCard = ({ member, onDelete, onAssignTask }) => {
  const { hasPermission } = useAuth();
  const canManageUsers = hasPermission('canManageUsers');
  const canAssignTasks = hasPermission('canManageContent') || hasPermission('canManageUsers');
  
  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = typeof timestamp === 'string' 
        ? new Date(timestamp) 
        : timestamp?.toDate ? timestamp.toDate() : new Date();
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get first letters for avatar
  const getInitials = (name) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Style based on role
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-orange-100 text-orange-800';
      case 'project_member': return 'bg-green-100 text-green-800';
      case 'resource_manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format role for display
  const formatRole = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Style based on proficiency
  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
            {member.profileImage ? (
              <img 
                src={member.profileImage} 
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(member.name)
            )}
          </div>
          <div>
            <h3 className="font-semibold">{member.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getRoleColor(member.role)}`}>
              {formatRole(member.role)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAssignTasks && (
            <button
              onClick={() => onAssignTask(member)}
              className="p-2 hover:bg-blue-100 rounded-full text-blue-600"
              title="Assign Task"
            >
              <Briefcase className="w-4 h-4" />
            </button>
          )}
          {canManageUsers && (
            <button
              onClick={() => onDelete(member)}
              className="p-2 hover:bg-orange-100 rounded-full text-orange-600"
              title="Make Account Dormant"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {member.email}
        </div>
        {member.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {member.phone}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          {member.projects?.length || 0} Active Projects
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Joined: {formatDate(member.createdAt || member.approvedAt)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          Last active: {formatDate(member.lastActivityAt || member.lastLoginAt || member.updatedAt)}
        </div>
        {member.activity && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            Activity: {member.activity}
          </div>
        )}
      </div>

      {member.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {member.skills.map((skill, index) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const proficiency = typeof skill === 'string' ? null : skill.proficiency;
            
            return (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${
                  proficiency ? getProficiencyColor(proficiency) : 'bg-blue-50 text-blue-700'
                }`}
              >
                {skillName}
                {proficiency && (
                  <span className="ml-1 opacity-75">• {proficiency}</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {member.status === 'onLeave' && (
        <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
          Currently on leave
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;