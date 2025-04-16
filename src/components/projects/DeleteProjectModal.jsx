import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ModalOverlay from '../ui/ModalOverlay';

const DeleteProjectModal = ({ isOpen, onClose, onConfirm, projectName }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center mb-4 text-red-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Delete Project</h3>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <span className="font-semibold">{projectName}</span>? This action cannot be undone and will delete all associated data including milestones, tasks, and files.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Project
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default DeleteProjectModal;