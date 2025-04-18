import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MilestoneModal = ({ isOpen, onClose, onSave, projectId, teamMembers, projectStartDate, projectEndDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    overseer: null,
    status: 'active',
    progress: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.overseer) {
      toast.error('Please select an overseer');
      return;
    }

    // Validate dates
    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      const projectStart = new Date(projectStartDate);
      const projectEnd = new Date(projectEndDate);

      if (start > due) {
        toast.error('Start date must be before due date');
        return;
      }

      if (start < projectStart || start > projectEnd) {
        toast.error('Start date must be within project timeline');
        return;
      }

      if (due < projectStart || due > projectEnd) {
        toast.error('Due date must be within project timeline');
        return;
      }
    }

    onSave(formData);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
      overseer: null,
      status: 'active',
      progress: 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Create Milestone</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
              required
            />
          </div>

          <div>
            <div className="mb-2">
              <span className="text-xs text-gray-500">
                Project timeline: {new Date(projectStartDate).toLocaleDateString()} - {new Date(projectEndDate).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  min={projectStartDate}
                  max={projectEndDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  min={formData.startDate || projectStartDate}
                  max={projectEndDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overseer
            </label>
            <select
              value={formData.overseer ? formData.overseer.id : ''}
              onChange={(e) => {
                const selectedMember = teamMembers.find(member => member.id === e.target.value);
                setFormData({
                  ...formData,
                  overseer: selectedMember ? {
                    id: selectedMember.id,
                    name: selectedMember.name,
                    email: selectedMember.email,
                    role: selectedMember.role
                  } : null
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select an overseer</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal; 