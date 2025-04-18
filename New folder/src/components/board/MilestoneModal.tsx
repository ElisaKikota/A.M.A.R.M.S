import React, { useState } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  milestone?: {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    overseer?: {
      id: string;
      name: string;
    };
  } | null;
  projectId: string;
  project: {
    startDate: string;
    endDate: string;
  };
  teamMembers: Array<{
    id: string;
    name: string;
  }>;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  milestone,
  projectId,
  project,
  teamMembers
}) => {
  const [title, setTitle] = useState(milestone?.title || '');
  const [description, setDescription] = useState(milestone?.description || '');
  const [startDate, setStartDate] = useState(milestone?.startDate || '');
  const [endDate, setEndDate] = useState(milestone?.endDate || '');
  const [overseer, setOverseer] = useState(milestone?.overseer || null);
  const [dateError, setDateError] = useState('');

  if (!isOpen) return null;

  const validateDates = (start: string, end: string) => {
    if (!start || !end) {
      setDateError('Both start date and end date are required');
      return false;
    }

    const startDateTime = new Date(start);
    const endDateTime = new Date(end);
    const projectStartDate = new Date(project.startDate);
    const projectEndDate = new Date(project.endDate);

    if (endDateTime <= startDateTime) {
      setDateError('End date must be after start date');
      return false;
    }

    if (startDateTime < projectStartDate) {
      setDateError('Start date cannot be before project start date');
      return false;
    }

    if (endDateTime > projectEndDate) {
      setDateError('End date cannot be after project end date');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast.error('Title is required');
      return;
    }

    if (!overseer) {
      toast.error('Overseer is required');
      return;
    }

    if (!validateDates(startDate, endDate)) {
      return;
    }

    onSave({
      title,
      description,
      startDate,
      endDate,
      overseer,
      projectId
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {milestone ? 'Edit Milestone' : 'Create Milestone'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter milestone title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter milestone description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate) validateDates(e.target.value, endDate);
                  }}
                  min={project.startDate}
                  max={project.endDate}
                  className={`w-full px-3 py-2 border rounded-md pl-10 ${
                    dateError ? 'border-red-500' : ''
                  }`}
                  required
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (startDate) validateDates(startDate, e.target.value);
                  }}
                  min={startDate || project.startDate}
                  max={project.endDate}
                  className={`w-full px-3 py-2 border rounded-md pl-10 ${
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

          {project.startDate && project.endDate && (
            <p className="text-xs text-gray-500">
              Project timeline: {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overseer
            </label>
            <div className="relative">
              <select
                value={overseer?.id || ''}
                onChange={(e) => {
                  const selected = teamMembers.find(member => member.id === e.target.value);
                  setOverseer(selected || null);
                }}
                className="w-full px-3 py-2 border rounded-md pl-10"
                required
              >
                <option value="">Select an overseer</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {milestone ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal; 