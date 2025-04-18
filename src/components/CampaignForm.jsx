import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Target, ChevronDown, UserPlus, Check } from 'react-feather';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

const MemberOption = ({ member, isAlreadyAdded, onSelect, isPriority }) => (
  <button
    type="button"
    disabled={isAlreadyAdded}
    onClick={() => !isAlreadyAdded && onSelect()}
    className={`w-full text-left px-4 py-2 flex items-center justify-between ${
      isAlreadyAdded ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:bg-gray-50'
    } ${isPriority ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
  >
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">{member.name}</span>
      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">{member.role}</span>
    </div>
    {isAlreadyAdded && <Check size={14} className="text-gray-400" />}
  </button>
);

const CampaignForm = ({ projects = [], onClose, onSave }) => {
  const { user } = useFirebase();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [isProjectLinked, setIsProjectLinked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    startDate: '',
    endDate: '',
    theme: '',
    targetAudience: '',
    channels: [],
    status: 'draft',
    isProjectLinked: false,
    projectId: null,
    projectName: null,
    createdBy: user ? {
      id: user.uid,
      name: user.displayName || user.email,
      role: user.role
    } : null,
    teamMembers: [],
    visibility: {
      roles: ['admin'], // Admin can always see
      teams: [],
      public: false
    }
  });
  const [availableMembers, setAvailableMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      setFormData(prev => ({
        ...prev,
        targetAudience: selectedProject.targetAudience,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        isProjectLinked: true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetAudience: '',
        projectId: null,
        projectName: null,
        isProjectLinked: false
      }));
    }
  }, [selectedProject]);

  // Fetch available members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Query the users collection for active members
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('status', 'in', ['active', 'onLeave']));
        const snapshot = await getDocs(q);
        
        const members = snapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.name || userData.email,
            role: userData.role,
            email: userData.email,
            skills: userData.skills || []
          };
        });
        setAvailableMembers(members);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load team members');
      }
    };
    fetchMembers();
  }, []);

  // Sort members with Marketing, PR, and Graphics roles first
  const sortedMembers = [...availableMembers].sort((a, b) => {
    const priorityRoles = ['marketing', 'pr', 'graphics'];
    const aIsPriority = priorityRoles.includes(a.role?.toLowerCase());
    const bIsPriority = priorityRoles.includes(b.role?.toLowerCase());
    
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleVisibilityChange = (type, value) => {
    if (type === 'public') {
      const allRoles = ['admin', 'hod', 'supervisor', 'pr', 'marketing', 'resource_manager', 'graphics', 'leader', 'developer'];
      setFormData(prev => ({
        ...prev,
        visibility: {
          ...prev.visibility,
          public: value,
          roles: value ? allRoles : []
        }
      }));
    } else if (type === 'roles') {
      setFormData(prev => ({
        ...prev,
        visibility: {
          ...prev.visibility,
          [type]: value,
          public: value.length === 9 // 9 is the total number of roles
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create New Campaign</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="linkToProject"
                  checked={isProjectLinked}
                  onChange={(e) => {
                    setIsProjectLinked(e.target.checked);
                    if (!e.target.checked) setSelectedProject(null);
                  }}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="linkToProject" className="text-sm font-medium text-gray-700">
                  Link to Project
                </label>
              </div>

              {isProjectLinked && (
                <div className="relative mb-4">
                  <button
                    type="button"
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <span className="text-gray-700">
                      {selectedProject ? selectedProject.name : 'Select a project'}
                    </span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  {showProjectDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowProjectDropdown(false);
                          }}
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedProject && selectedProject.specifications?.problem && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Problem Statement</p>
                    {selectedProject.specifications.problem.abstract ? (
                      <div 
                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedProject.specifications.problem.abstract 
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not filled</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Main Objective</p>
                    {selectedProject.specifications.problem.mainObjective ? (
                      <div 
                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedProject.specifications.problem.mainObjective 
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not filled</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Target Audience</p>
                    {selectedProject.specifications.problem.targetAudience ? (
                      <div 
                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedProject.specifications.problem.targetAudience 
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not filled</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme/Message</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Channels</label>
              <div className="flex flex-wrap gap-3">
                {['Social Media', 'Email', 'Ads', 'Blog'].map(channel => (
                  <label key={channel} className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, channels: [...prev.channels, channel] }));
                        } else {
                          setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Team</label>
              <div className="space-y-2">
                {/* Creator info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>Created by: {formData.createdBy?.name}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {formData.createdBy?.role || 'member'}
                  </span>
                </div>

                {/* Add team member input */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <UserPlus size={16} />
                    <span>Add Team Member</span>
                    <ChevronDown size={16} className="ml-auto" />
                  </button>
                  
                  {showMemberDropdown && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="py-1">
                        {/* Priority roles section */}
                        {sortedMembers
                          .filter(member => ['marketing', 'pr', 'graphics'].includes(member.role?.toLowerCase()))
                          .map((member) => (
                            <MemberOption
                              key={member.id}
                              member={member}
                              isAlreadyAdded={formData.teamMembers.some(m => m.id === member.id)}
                              onSelect={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  teamMembers: [...prev.teamMembers, {
                                    id: member.id,
                                    name: member.name,
                                    role: member.role
                                  }]
                                }));
                                setShowMemberDropdown(false);
                              }}
                              isPriority={true}
                            />
                          ))}
                        
                        {/* Divider if there are priority members */}
                        {sortedMembers.some(member => ['marketing', 'pr', 'graphics'].includes(member.role?.toLowerCase())) && (
                          <div className="border-t border-gray-200 my-1"></div>
                        )}
                        
                        {/* Other roles section */}
                        {sortedMembers
                          .filter(member => !['marketing', 'pr', 'graphics'].includes(member.role?.toLowerCase()))
                          .map((member) => (
                            <MemberOption
                              key={member.id}
                              member={member}
                              isAlreadyAdded={formData.teamMembers.some(m => m.id === member.id)}
                              onSelect={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  teamMembers: [...prev.teamMembers, {
                                    id: member.id,
                                    name: member.name,
                                    role: member.role
                                  }]
                                }));
                                setShowMemberDropdown(false);
                              }}
                              isPriority={false}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team members list */}
                <div className="space-y-2 mt-2">
                  {formData.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{member.name}</span>
                        <span className="text-xs text-gray-500">{member.role}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            teamMembers: prev.teamMembers.filter(m => m.id !== member.id)
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility Controls */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Visibility</label>
              <div className="space-y-3">
                {/* Role-based access */}
                <div>
                  <label className="text-sm text-gray-600">Visible to Roles:</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['admin', 'hod', 'supervisor', 'pr', 'marketing', 'resource_manager', 'graphics', 'leader', 'developer'].map(role => (
                      <label key={role} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.visibility.roles.includes(role)}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...formData.visibility.roles, role]
                              : formData.visibility.roles.filter(r => r !== role);
                            handleVisibilityChange('roles', newRoles);
                          }}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {/* Visibility message */}
                  {formData.visibility.roles.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      This campaign will be visible only to you
                    </p>
                  )}
                </div>

                {/* Public visibility toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="publicVisibility"
                    checked={formData.visibility.public}
                    onChange={(e) => handleVisibilityChange('public', e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="publicVisibility" className="text-sm text-gray-600">
                    Make campaign visible to all members
                  </label>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex justify-end space-x-3 mt-4 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center text-sm"
              >
                <Save size={16} className="mr-2" />
                Save Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm; 