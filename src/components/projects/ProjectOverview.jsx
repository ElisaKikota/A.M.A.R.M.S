import React, { useState } from 'react';
import { 
  Clock, 
  
  Plus,
  Flag,
  CheckCircle,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import MilestoneModal from './MilestoneModal';
import { firebaseDb } from '../../services/firebaseDb';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status || 'Not Set'}
    </span>
  );
};

const ProjectOverview = ({ project, tasks, team, milestones = [], onMarkCompleted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Calculate task completion with weighted progress
  const calculateTaskProgress = () => {
    if (!tasks?.length) return { percentage: 0, completed: 0, total: 0 };
    
    const nonTrashTasks = tasks.filter(task => task.status !== 'trash');
    if (nonTrashTasks.length === 0) return { percentage: 0, completed: 0, total: 0 };
    
    const completedTasks = nonTrashTasks.filter(task => task.status === 'done').length;
    const percentage = Math.round((completedTasks / nonTrashTasks.length) * 100);

    return {
      percentage,
      completed: completedTasks,
      total: nonTrashTasks.length
    };
  };

  const { percentage: completionPercentage, completed: completedTasks, total: totalTasks } = calculateTaskProgress();
  
  const daysRemaining = project?.endDate ? 
    differenceInDays(new Date(project.endDate), new Date()) : 
    null;

  // Task status distribution for detailed progress view
  const taskDistribution = tasks?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {}) || {};

  
  








  

  const getMilestoneStatus = (milestone) => {
    try {
      if (!milestone?.dueDate) return 'upcoming';
      const date = new Date(milestone.dueDate);
      if (isNaN(date.getTime())) return 'upcoming';
      
      if (milestone.status === 'completed') return 'completed';
      if (isPast(date) && !isToday(date)) return 'overdue';
      if (isToday(date)) return 'in progress';
      return 'upcoming';
    } catch (error) {
      console.error('Milestone status error:', error);
      return 'upcoming';
    }
  };

  // Sort milestones by date and take the next 5
  const upcomingMilestones = milestones
    ?.filter(milestone => milestone?.dueDate && !isNaN(new Date(milestone.dueDate).getTime()))
    ?.sort((a, b) => {
      try {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } catch (error) {
        return 0;
      }
    })
    ?.slice(0, 5) || [];

  const handleEditMilestone = (milestone) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleMilestoneSave = async (formData) => {
    try {
      if (selectedMilestone) {
        await firebaseDb.updateMilestone(project.id, selectedMilestone.id, formData);
        toast.success('Milestone updated successfully');
      } else {
        await firebaseDb.createMilestone(project.id, formData);
        toast.success('Milestone created successfully');
      }
      setIsModalOpen(false);
      setSelectedMilestone(null);
    } catch (error) {
      console.error('Error saving milestone:', error);
      toast.error('Failed to save milestone');
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {/* Left Section - 3 columns */}
        <div className="col-span-3 space-y-4">
          {/* Top Section - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Project Status Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold">Project Status</h3>
                  <StatusBadge status={project?.status} />
                </div>
              </div>
              
              {/* Progress Circle with Details */}
              <div className="flex items-center space-x-3">
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                    <text 
                      x="18" 
                      y="18" 
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="font-medium fill-current text-gray-700"
                      style={{ fontSize: '6px' }}
                      transform="rotate(90 18 18)"
                    >
                      {completionPercentage}%
                    </text>
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm text-gray-500">Overall Progress</p>
                  <p className="font-medium text-sm">{completedTasks} of {totalTasks} tasks</p>
                  <div className="flex gap-1.5 text-xs">
                    {Object.entries(taskDistribution).map(([status, count]) => (
                      <span key={status} className={`px-1.5 py-0.5 rounded-full ${
                        status === 'done' ? 'bg-green-100 text-green-800' :
                        status === 'review' ? 'bg-purple-100 text-purple-800' :
                        status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {count} {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Remaining Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold mb-3">Time Remaining</h3>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className={`font-medium text-sm ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {daysRemaining !== null ? `${daysRemaining} days` : 'No end date set'}
                  </p>
                  {daysRemaining < 0 && (
                    <p className="text-xs text-red-500">
                      Project overdue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Section - Full Width Grid */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Milestones</h3>
              <button 
                onClick={() => {
                  setSelectedMilestone(null);
                  setIsModalOpen(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} />
                Add Milestone
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {upcomingMilestones.length > 0 ? (
                upcomingMilestones.map((milestone) => {
                  const status = getMilestoneStatus(milestone);
                  return (
                    <div key={milestone.id} className="p-3 bg-gray-50 rounded-lg group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : status === 'overdue' ? (
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <Flag className="h-4 w-4 text-blue-500 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-gray-900">{milestone.title}</h4>
                              <button
                                onClick={() => handleEditMilestone(milestone)}
                                className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 size={12} className="text-gray-500" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">{milestone.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-gray-600">
                                {team?.find(member => member.id === milestone.overseer)?.name || 'No overseer assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2">
                  <p className="text-center text-gray-500 py-3 text-sm">No milestones set</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Card - Right Column */}
        <div className="bg-white rounded-lg shadow p-4 h-full">
          <h3 className="text-base font-semibold mb-3">Team</h3>
          <div className="space-y-3">
            {team?.map((member) => (
              <div key={member.id} className="flex items-start space-x-2">
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {member.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.skills && Object.values(member.skills).map((skill) => (
                      <span 
                        key={skill.id}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          skill.proficiency >= 80 ? 'bg-green-50 text-green-600' :
                          skill.proficiency >= 60 ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                    {(!member.skills || Object.keys(member.skills).length === 0) && (
                      <span className="text-xs text-gray-500">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!team?.length && (
              <p className="text-sm text-gray-500">No team members assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMilestone(null);
        }}
        onSave={handleMilestoneSave}
        projectId={project?.id}
        milestone={selectedMilestone}
        teamMembers={team}
      />
    </>
  );
};

export default ProjectOverview; 