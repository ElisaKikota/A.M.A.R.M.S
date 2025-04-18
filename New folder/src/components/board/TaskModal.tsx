import React, { useState, useEffect } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { firebaseDb } from '../../services/firebaseDb';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any;
  onSave: (taskData: any) => void;
  projectId: string;
  selectedMilestoneId: string;
  milestone: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  projectId,
  selectedMilestoneId,
  milestone
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    assignees: [] as TeamMember[],
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        assignees: task.assignees || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: milestone.startDate,
        endDate: '',
        assignees: [],
      });
    }
  }, [task, milestone]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const members = await firebaseDb.getTeamMembers(projectId);
        setTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen, projectId]);

  const validateDates = (start: string, end: string) => {
    if (!start || !end) {
      setDateError('Both start date and end date are required');
      return false;
    }

    const startDateTime = new Date(start);
    const endDateTime = new Date(end);
    const milestoneStartDate = new Date(milestone.startDate);
    const milestoneEndDate = new Date(milestone.endDate);

    if (endDateTime <= startDateTime) {
      setDateError('End date must be after start date');
      return false;
    }

    if (startDateTime < milestoneStartDate) {
      setDateError('Start date cannot be before milestone start date');
      return false;
    }

    if (endDateTime > milestoneEndDate) {
      setDateError('End date cannot be after milestone end date');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateDates(formData.startDate, formData.endDate)) {
      setLoading(false);
      return;
    }

    try {
      await onSave({
        ...formData,
        milestoneId: selectedMilestoneId
      });
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'startDate' || name === 'endDate') {
      validateDates(
        name === 'startDate' ? value : formData.startDate,
        name === 'endDate' ? value : formData.endDate
      );
    }
  };

  const toggleAssignee = (member: TeamMember) => {
    setFormData(prev => {
      const isAssigned = prev.assignees.some(a => a.id === member.id);
      return {
        ...prev,
        assignees: isAssigned
          ? prev.assignees.filter(a => a.id !== member.id)
          : [...prev.assignees, member]
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={milestone.startDate}
                  max={milestone.endDate}
                  className={`w-full px-3 py-2 border rounded-lg pl-10 ${
                    dateError ? 'border-red-500' : ''
                  }`}
                  required
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || milestone.startDate}
                  max={milestone.endDate}
                  className={`w-full px-3 py-2 border rounded-lg pl-10 ${
                    dateError ? 'border-red-500' : ''
                  }`}
                  required
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {dateError && (
            <p className="text-red-500 text-sm">{dateError}</p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Assignees</label>
            <div className="relative">
              <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                {teamMembers.map(member => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAssignee(member)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
                      formData.assignees.some(a => a.id === member.id)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users size={14} />
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 