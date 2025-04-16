import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TaskCreationForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reading',
    dueDate: '',
    content: [],
    submissionFields: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate due date
    const dueDate = new Date(formData.dueDate);
    if (isNaN(dueDate.getTime())) {
      toast.error('Please enter a valid due date');
      return;
    }

    onSubmit({
      ...formData,
      dueDate
    });
  };

  const addContent = () => {
    setFormData(prev => ({
      ...prev,
      content: [
        ...prev.content,
        {
          title: '',
          details: '',
          resources: []
        }
      ]
    }));
  };

  const updateContent = (index, updatedContent) => {
    const newContent = [...formData.content];
    newContent[index] = updatedContent;
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const removeContent = (index) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const addSubmissionField = () => {
    setFormData(prev => ({
      ...prev,
      submissionFields: [
        ...prev.submissionFields,
        {
          id: Date.now().toString(),
          label: '',
          type: 'text',
          required: false,
          description: ''
        }
      ]
    }));
  };

  const updateSubmissionField = (index, updates) => {
    const newFields = [...formData.submissionFields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData(prev => ({ ...prev, submissionFields: newFields }));
  };

  const removeSubmissionField = (index) => {
    setFormData(prev => ({
      ...prev,
      submissionFields: prev.submissionFields.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Task Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="reading">Reading Material</option>
            <option value="submission">Team Submission</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Reading Material Content */}
      {formData.type === 'reading' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Content Sections</h3>
            <button
              type="button"
              onClick={addContent}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>
          {formData.content.map((section, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-4">
                <h4 className="font-medium">Section {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeContent(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => updateContent(index, { ...section, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Section Content"
                  value={section.details}
                  onChange={(e) => updateContent(index, { ...section, details: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Fields */}
      {formData.type === 'submission' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Submission Fields</h3>
            <button
              type="button"
              onClick={addSubmissionField}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Add Field
            </button>
          </div>
          {formData.submissionFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-4">
                <h4 className="font-medium">Field {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeSubmissionField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Field Label"
                  value={field.label}
                  onChange={(e) => updateSubmissionField(index, { label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateSubmissionField(index, { type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Long Text</option>
                  <option value="link">Link/URL</option>
                  <option value="file">File Upload</option>
                  <option value="date">Date</option>
                </select>
                <textarea
                  placeholder="Field Description"
                  value={field.description}
                  onChange={(e) => updateSubmissionField(index, { description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateSubmissionField(index, { required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Required field</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskCreationForm;