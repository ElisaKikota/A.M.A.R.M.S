import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, CheckCircle, Circle, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';
import MilestoneModal from './MilestoneModal';

const MilestoneManager = ({ projectId }) => {
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    loadMilestones();
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    try {
      const members = await firebaseDb.getTeamMembers(projectId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const milestonesData = await firebaseDb.getProjectMilestones(projectId);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading milestones:', error);
      setError('Failed to load milestones');
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const loadMilestoneTasks = async (milestoneId) => {
    try {
      const tasksData = await firebaseDb.getMilestoneTasks(projectId, milestoneId);
      setTasks(prev => ({
        ...prev,
        [milestoneId]: tasksData
      }));
    } catch (error) {
      console.error('Error loading milestone tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const toggleMilestone = async (milestoneId) => {
    if (expandedMilestone === milestoneId) {
      setExpandedMilestone(null);
    } else {
      setExpandedMilestone(milestoneId);
      if (!tasks[milestoneId]) {
        await loadMilestoneTasks(milestoneId);
      }
    }
  };

  const handleTaskStatusChange = async (milestoneId, taskId, newStatus) => {
    try {
      await firebaseDb.updateTaskStatus(projectId, taskId, newStatus);
      await loadMilestoneTasks(milestoneId);
      await firebaseDb.updateMilestoneProgress(projectId, milestoneId);
      await loadMilestones();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleMilestoneSave = async (formData) => {
    try {
      if (selectedMilestone) {
        const updatedMilestone = await firebaseDb.updateMilestone(projectId, selectedMilestone.id, formData);
        setMilestones(prevMilestones => 
          prevMilestones.map(m => m.id === selectedMilestone.id ? updatedMilestone : m)
        );
        toast.success('Milestone updated successfully');
      } else {
        const createdMilestone = await firebaseDb.createMilestone(projectId, formData);
        setMilestones(prevMilestones => [...prevMilestones, createdMilestone]);
        toast.success('Milestone created successfully');
      }
      setIsModalOpen(false);
      setSelectedMilestone(null);
    } catch (error) {
      console.error('Error saving milestone:', error);
      toast.error('Failed to save milestone');
      throw error;
    }
  };

  const handleEditMilestone = (milestone) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleAddMilestone = () => {
    setSelectedMilestone(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Milestones</h2>
        <button
          onClick={handleAddMilestone}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Milestone
        </button>
      </div>

      <div className="space-y-4">
        {milestones.map(milestone => (
          <div
            key={milestone.id}
            className="border rounded-lg overflow-hidden"
          >
            <div
              className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
              onClick={() => toggleMilestone(milestone.id)}
            >
              <div className="flex items-center gap-4">
                {expandedMilestone === milestone.id ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
                <div>
                  <h3 className="font-medium">{milestone.title}</h3>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Overseer: {teamMembers.find(m => m.id === milestone.overseer)?.name || 'Not assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditMilestone(milestone);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <Edit2 size={16} />
                </button>
                <div className="text-sm text-gray-500">
                  {milestone.progress || 0}% Complete
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${milestone.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {expandedMilestone === milestone.id && (
              <div className="p-4 border-t">
                <div className="space-y-2">
                  {tasks[milestone.id]?.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTaskStatusChange(
                            milestone.id,
                            task.id,
                            task.status === 'completed' ? 'pending' : 'completed'
                          )}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMilestone(null);
        }}
        projectId={projectId}
        milestone={selectedMilestone}
        onSave={handleMilestoneSave}
        teamMembers={teamMembers}
      />
    </div>
  );
};

export default MilestoneManager; 