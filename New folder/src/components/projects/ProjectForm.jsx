import React from 'react';
import { useProjectStore } from '../../stores/projectStore';

export default function ProjectForm({ onSubmit }) {
  const addProject = useProjectStore(state => state.addProject);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: Date.now().toString(),
      ...formData,
      milestones: [],
      team: [],
      resources: []
    };
    addProject(newProject);
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            name: e.target.value
          }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      {/* Add other form fields */}
      <button 
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Project
      </button>
    </form>
  );
}