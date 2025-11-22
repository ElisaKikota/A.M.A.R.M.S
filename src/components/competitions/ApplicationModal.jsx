import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createApplication, updateApplication } from '../../services/competitionService';
import { useProjectStore } from '../../stores/projectsSlice';
import { toast } from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const defaultForm = {
  projectId: '',
  status: 'draft',
  feedback: '',
  notes: '',
  documents: [],
};

const ApplicationModal = ({ isOpen, onClose, application, competition }) => {
  const { projects, setProjects } = useProjectStore();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (application) {
      setForm({ ...defaultForm, ...application });
    } else {
      setForm(defaultForm);
    }
  }, [application]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (isOpen && projects.length === 0) {
        setLoadingProjects(true);
        try {
          const querySnapshot = await getDocs(collection(db, 'projects'));
          const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProjects(projectsData);
        } catch (error) {
          toast.error('Failed to load projects.');
          console.error("Error fetching projects: ", error);
        } finally {
          setLoadingProjects(false);
        }
      }
    };
    fetchProjects();
  }, [isOpen, projects.length, setProjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.projectId) {
        toast.error('Project is required');
        setLoading(false);
        return;
      }
      const payload = {
        ...form,
        competitionId: competition.id,
      };
      if (application) {
        await updateApplication(application.id, payload);
        toast.success('Application updated');
      } else {
        await createApplication(payload);
        toast.success('Application created');
      }
      onClose();
    } catch (err) {
      toast.error('Error saving application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <X size={22} />
        </button>
        <h2 className="text-xl font-semibold mb-4">{application ? 'Edit Application' : 'New Application'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select name="projectId" value={form.projectId} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              <option value="">Select a project...</option>
              {loadingProjects ? (
                <option value="" disabled>Loading projects...</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="awarded">Awarded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feedback</label>
            <textarea name="feedback" value={form.feedback} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          {/* Document upload mock */}
          <div>
            <label className="block text-sm font-medium mb-1">Documents (mock)</label>
            <input type="file" multiple disabled className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Document upload coming soon</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" disabled={loading}>
              {loading ? 'Saving...' : application ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal; 