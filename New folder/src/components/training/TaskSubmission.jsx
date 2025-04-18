import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TaskSubmission = ({ task, submissions, onSubmit }) => {
  const { user } = useFirebase();
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userProject, setUserProject] = useState(null);

  useEffect(() => {
    // Check if user has already submitted
    const userSubmission = submissions?.find(s => s.userId === user?.uid);
    setHasSubmitted(!!userSubmission);

    // Get user's project assignment
    const loadUserProject = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserProject(userDoc.data()?.assignedProject || null);
      } catch (error) {
        console.error('Error loading user project:', error);
      }
    };

    if (user) {
      loadUserProject();
    }
  }, [user, submissions]);

  // Check if user is admin or instructor
  const isAdminOrInstructor = hasPermission('canManageContent');
  
  // Check if user is a project member and belongs to the correct project
  const canSubmit = !isAdminOrInstructor && 
  user?.role === 'project_member' && 
  userProject === task.projectId &&
  user?.groupStatus === 'approved';

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
      setHasSubmitted(true);
      toast.success('Response submitted successfully');
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  // Render submission status for admin/instructor
  if (isAdminOrInstructor) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Submission Status</h3>
        {submissions?.length > 0 ? (
          <div className="space-y-2">
            {submissions.map((submission, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <span className="font-medium">{submission.submitter?.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle size={20} />
            <span>No submissions yet</span>
          </div>
        )}
      </div>
    );
  }

  // Render submission form for project members
  if (!canSubmit) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle size={20} />
          <span>You don't have permission to submit responses for this task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {hasSubmitted ? (
        <div className="p-4 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          <span>Response submitted successfully</span>
        </div>
      ) : (
        <div className="space-y-4">
          {task.submissionFields?.map((field) => (
            <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">{field.label}</span>
                {field.required && (
                  <span className="text-red-500 text-sm">*Required</span>
                )}
              </div>
              {field.description && (
                <p className="text-sm text-gray-600 mt-1">{field.description}</p>
              )}
              <div className="mt-2">
                {field.type === 'link' ? (
                  <input
                    type="url"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    placeholder="Enter URL"
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white opacity-50 cursor-not-allowed"
                    placeholder="This field type is not available"
                    disabled
                  />
                )}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit Response
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskSubmission;