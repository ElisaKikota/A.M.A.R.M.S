import React, { useState, useEffect } from 'react';
import { X, Plus, X as XIcon, Trash2, Save, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ModalOverlay from '../ui/ModalOverlay';

const TeamMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const { hasPermission } = useAuth();
  const canManageUsers = hasPermission('canManageUsers');
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'active',
    skills: []
  });

  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'beginner' });

  useEffect(() => {
    if (member) {
      // Convert old skills format (strings) to new format (objects with proficiency)
      let updatedSkills = member.skills || [];
      if (updatedSkills.length > 0 && typeof updatedSkills[0] === 'string') {
        updatedSkills = updatedSkills.map(skill => ({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          name: skill,
          proficiency: 'beginner'
        }));
      }
      
      setFormData({
        name: member.name || '',
        role: member.role || '',
        email: member.email || '',
        phone: member.phone || '',
        status: member.status || 'active',
        skills: updatedSkills
      });
    } else {
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'active',
        skills: []
      });
    }
  }, [member, canManageUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      return;
    }
    
    // Check if skill already exists
    if (formData.skills.some(skill => skill.name.toLowerCase() === newSkill.name.toLowerCase())) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: Date.now().toString(),
          name: newSkill.name.trim(),
          proficiency: newSkill.proficiency
        }
      ]
    }));
    
    setNewSkill({ name: '', proficiency: 'beginner' });
  };

  const removeSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== skillId)
    }));
  };
  
  const updateSkillProficiency = (skillId, newProficiency) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === skillId ? { ...skill, proficiency: newProficiency } : skill
      )
    }));
  };

  if (!isOpen) return null;

  // List of available roles (only shown to admins)
  const availableRoles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'instructor', name: 'Instructor' },
    { id: 'supervisor', name: 'Supervisor' },
    { id: 'project_member', name: 'Project Member' },
    { id: 'resource_manager', name: 'Resource Manager' },
    { id: 'community_member', name: 'Community Member' }
  ];

  // Get proficiency color based on level
  const getProficiencyColor = (proficiency) => {
    switch(proficiency) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              {canManageUsers ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${!canManageUsers ? 'bg-gray-50' : 'focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                required
                disabled={!canManageUsers} // Only admins can change emails
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="onLeave">On Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            
            {/* Skills List */}
            <div className="space-y-4">
              {formData.skills.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No skills added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.skills.map(skill => (
                    <div 
                      key={skill.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <select
                          value={skill.proficiency}
                          onChange={(e) => updateSkillProficiency(skill.id, e.target.value)}
                          className="mt-1 text-sm p-1 border rounded"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove skill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Skill Form */}
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium mb-3">Add New Skill</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="Enter skill name"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {member ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

export default TeamMemberModal;