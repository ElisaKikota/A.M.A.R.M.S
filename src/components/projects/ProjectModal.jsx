import React, { useState, useEffect } from 'react';
import { X, Users, Search } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ModalOverlay from '../ui/ModalOverlay';

const TeamMemberSelect = ({ members, selectedMembers, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter members by name, role, or skills
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.skills?.some(skill => 
      typeof skill === 'string' 
        ? skill.toLowerCase().includes(searchTerm.toLowerCase())
        : skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  // Format skill display based on whether it's a string or object
  const formatSkill = (skill) => {
    if (typeof skill === 'string') {
      return { name: skill, proficiency: null };
    }
    return skill;
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between"
      >
        <div className="flex flex-wrap gap-2">
          {selectedMembers.length === 0 ? (
            <span className="text-gray-500">Select team members</span>
          ) : (
            selectedMembers.map(member => (
              <span 
                key={member.id}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1"
              >
                {member.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(selectedMembers.filter(m => m.id !== member.id));
                  }}
                  className="hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>
        <Users size={20} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-1 border rounded-lg text-sm"
                placeholder="Search members or skills..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                  selectedMembers.some(m => m.id === member.id) ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  const isSelected = selectedMembers.some(m => m.id === member.id);
                  onChange(
                    isSelected
                      ? selectedMembers.filter(m => m.id !== member.id)
                      : [...selectedMembers, member]
                  );
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.role}</div>
                  </div>
                  
                  {/* Skills Section - Now displayed inline */}
                  {member.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                      {member.skills.slice(0, 3).map((skill, index) => {
                        const formattedSkill = formatSkill(skill);
                        return (
                          <span
                            key={index}
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              formattedSkill.proficiency 
                                ? getProficiencyColor(formattedSkill.proficiency)
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            title={formattedSkill.proficiency ? `Proficiency: ${formattedSkill.proficiency}` : ''}
                          >
                            {formattedSkill.name}
                            {formattedSkill.proficiency && (
                              <span className="ml-1 opacity-75">
                                • {formattedSkill.proficiency.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </span>
                        );
                      })}
                      {member.skills.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                          +{member.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="px-4 py-3 text-center text-gray-500">
                No members found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const { user } = useFirebase();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    team: [],
    projectManager: null,
    milestones: [],
    resources: []
  });
  const [dateError, setDateError] = useState('');

  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  const [availableResources, setAvailableResources] = useState({
    hardware: [],
    software: [],
    venue: []
  });
  const [milestone, setMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    overseer: ''
  });

  const [resource, setResource] = useState({
    id: '',
    name: '',
    type: 'hardware',
    quantity: 1,
    status: 'available'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch team members when modal opens
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        // Query the users collection for active members instead of from firebaseDb
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('status', 'in', ['active', 'onLeave']));
        const snapshot = await getDocs(q);
        
        const members = snapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.name,
            role: userData.role,
            email: userData.email,
            skills: userData.skills || [] // Include skills
          };
        });
        
        setAvailableTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
        toast.error('Failed to load team members');
      }
    };

    if (isOpen && user) {
      loadTeamMembers();
    }
  }, [isOpen, user]);

  // Fetch resources when modal opens
  useEffect(() => {
    const loadResources = async () => {
      try {
        const resourcesRef = collection(db, 'resources');
        const snapshot = await getDocs(resourcesRef);
        
        const resources = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group resources by type
        setAvailableResources({
          hardware: resources.filter(r => r.type === 'hardware' && r.status === 'available'),
          software: resources.filter(r => r.type === 'software' && r.status === 'available'),
          venue: resources.filter(r => r.type === 'venue' && r.status === 'available')
        });
      } catch (error) {
        console.error('Error loading resources:', error);
        toast.error('Failed to load resources');
      }
    };

    if (isOpen) {
      loadResources();
    }
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        startDate: '',
        endDate: '',
        team: [],
        milestones: [],
        resources: []
      });
    }
  }, [project]);

  const addMilestone = () => {
    if (milestone.title && milestone.dueDate && milestone.overseer) {
      // Find the overseer details to include name
      const overseerDetails = formData.team.find(member => member.id === milestone.overseer);
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { 
          ...milestone, 
          id: Date.now().toString(),
          overseerName: overseerDetails?.name || 'Unknown' // Add overseer name
        }]
      }));
      setMilestone({ title: '', description: '', dueDate: '', overseer: '' });
    } else {
      toast.error('Please fill in all required milestone fields');
    }
  };

  const addResource = () => {
    if (resource.id && resource.quantity) {
      // Find the selected resource details
      const selectedResource = availableResources[resource.type].find(r => r.id === resource.id);
      
      if (!selectedResource) {
        toast.error('Please select a valid resource');
        return;
      }

      // Check if quantity is available
      if (selectedResource.availableQuantity < resource.quantity) {
        toast.error(`Only ${selectedResource.availableQuantity} units available`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, {
          ...resource,
          name: selectedResource.name,
          uniqueId: Date.now().toString() // For list key purposes
        }]
      }));

      setResource({
        id: '',
        name: '',
        type: 'hardware',
        quantity: 1,
        status: 'available'
      });
    } else {
      toast.error('Please select a resource and specify quantity');
    }
  };

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setDateError('Both start date and end date are required');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setDateError('End date must be after start date');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newDates = {
      ...formData,
      [name]: value
    };
    
    // Validate dates whenever either date changes
    if (name === 'startDate' || name === 'endDate') {
      validateDates(newDates.startDate, newDates.endDate);
    }
    
    setFormData(newDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate milestone dates against project timeline
      const hasInvalidMilestones = formData.milestones?.some(milestone => {
        const milestoneDate = new Date(milestone.dueDate);
        const projectEndDate = new Date(formData.endDate);
        return milestoneDate > projectEndDate;
      });

      if (hasInvalidMilestones) {
        toast.error('Milestone dates cannot be after the project end date');
        setIsSubmitting(false);
        return;
      }

      // Format milestones data
      const formattedMilestones = formData.milestones?.map(milestone => ({
        title: milestone.title,
        description: milestone.description || '',
        dueDate: milestone.dueDate,
        status: 'pending',
        progress: 0
      })) || [];

      // Create project with formatted data
      const projectData = {
        ...formData,
        milestones: formattedMilestones,
        status: 'active'
      };

      if (project) {
        await onSave(projectData);
        toast.success('Project updated successfully');
      } else {
        await onSave(projectData);
        toast.success('Project created successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
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
                Project Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="inProgress">In Progress</option>
                <option value="onHold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Team Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Members
            </label>
            <TeamMemberSelect
              members={availableTeamMembers}
              selectedMembers={formData.team}
              onChange={(team) => setFormData({ ...formData, team })}
            />
          </div>

          {/* Project Manager Selection  */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Manager
            </label>
            <select
              value={formData.projectManager || ''}
              onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Project Manager</option>
              {formData.team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Designate a team member as the project manager
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleDateChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateError ? 'border-red-500' : ''
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleDateChange}
                min={formData.startDate || undefined}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateError ? 'border-red-500' : ''
                }`}
                required
              />
            </div>
          </div>
          {dateError && (
            <p className="text-red-500 text-sm mt-1">{dateError}</p>
          )}

          {/* Milestones Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Milestones</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={milestone.title}
                  onChange={(e) => setMilestone({ ...milestone, title: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <div>
                  <input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => setMilestone({ ...milestone, dueDate: e.target.value })}
                    min={formData.startDate || undefined}
                    max={formData.endDate || undefined}
                    className="w-full px-3 py-2 border rounded-lg [&::-webkit-calendar-picker-indicator]:opacity-100 
                             [&::-webkit-datetime-edit-day-field]:opacity-100 
                             [&::-webkit-datetime-edit-month-field]:opacity-100 
                             [&::-webkit-datetime-edit-year-field]:opacity-100
                             [&::-webkit-datetime-edit-fields-wrapper]:opacity-100
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {formData.startDate && formData.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Project timeline: {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <textarea
                placeholder="Milestone description"
                value={milestone.description}
                onChange={(e) => setMilestone({ ...milestone, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Overseer
                </label>
                <select
                  value={milestone.overseer}
                  onChange={(e) => setMilestone({ ...milestone, overseer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select person in charge</option>
                  {formData.team.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add Milestone
              </button>

              {/* Milestones List */}
              <div className="space-y-2">
                {formData.milestones.map((m, index) => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{m.title}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Overseer: {m.overseerName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        milestones: prev.milestones.filter((_, i) => i !== index)
                      }))}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <select
                    value={resource.type}
                    onChange={(e) => setResource({ ...resource, type: e.target.value, id: '' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="venue">Venue</option>
                  </select>
                </div>
                <div>
                  <select
                    value={resource.id}
                    onChange={(e) => {
                      const selectedResource = availableResources[resource.type].find(r => r.id === e.target.value);
                      setResource({
                        ...resource,
                        id: e.target.value,
                        name: selectedResource ? selectedResource.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select {resource.type}</option>
                    {availableResources[resource.type].map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.availableQuantity} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={resource.quantity}
                    onChange={(e) => setResource({ ...resource, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max={resource.id ? availableResources[resource.type].find(r => r.id === resource.id)?.availableQuantity : 1}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addResource}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add Resource
              </button>

              {/* Resources List */}
              <div className="space-y-2">
                {formData.resources.map((r) => (
                  <div key={r.uniqueId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{r.name}</h4>
                      <p className="text-sm text-gray-500">
                        {r.type} - Quantity: {r.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        resources: prev.resources.filter(res => res.uniqueId !== r.uniqueId)
                      }))}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {project ? 'Saving Changes...' : 'Creating Project...'}
                </div>
              ) : (
                project ? 'Save Changes' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

export default ProjectModal;