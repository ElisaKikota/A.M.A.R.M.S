import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createCompetition, updateCompetition } from '../../services/competitionService';
import { toast } from 'react-hot-toast';

const defaultForm = {
  name: '',
  description: '',
  fundingAmount: 0,
  currency: 'USD',
  organization: '',
  applicationDeadline: '',
  requirements: [],
  status: 'open',
  eligibilityCriteria: '',
  maxApplications: '',
};

const CompetitionModal = ({ isOpen, onClose, competition }) => {
  const [form, setForm] = useState(defaultForm);
  const [reqInput, setReqInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (competition) {
      const deadline = competition.applicationDeadline;
      // Format to yyyy-MM-ddTHH:mm, required by datetime-local input
      const formattedDeadline = deadline ? new Date(deadline).toISOString().slice(0, 16) : '';
      setForm({ ...defaultForm, ...competition, applicationDeadline: formattedDeadline });
    } else {
      setForm(defaultForm);
    }
  }, [competition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddRequirement = () => {
    if (reqInput.trim()) {
      setForm(f => ({ ...f, requirements: [...(f.requirements || []), reqInput.trim()] }));
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (i) => {
    setForm(f => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name || !form.organization || !form.applicationDeadline) {
        toast.error('Name, Organization, and Deadline are required');
        setLoading(false);
        return;
      }
      if (competition) {
        await updateCompetition(competition.id, form);
        toast.success('Competition updated');
      } else {
        await createCompetition(form);
        toast.success('Competition created');
      }
      onClose();
    } catch (err) {
      toast.error('Error saving competition');
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
        <h2 className="text-xl font-semibold mb-4">{competition ? 'Edit Competition' : 'New Competition'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization</label>
            <input type="text" name="organization" value={form.organization} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Funding Amount</label>
            <input type="number" name="fundingAmount" value={form.fundingAmount} onChange={handleChange} className="w-full border rounded px-3 py-2" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <input type="text" name="currency" value={form.currency} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Application Deadline</label>
            <input type="datetime-local" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Eligibility Criteria</label>
            <input type="text" name="eligibilityCriteria" value={form.eligibilityCriteria} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Applications</label>
            <input type="number" name="maxApplications" value={form.maxApplications} onChange={handleChange} className="w-full border rounded px-3 py-2" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Requirements</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={reqInput} onChange={e => setReqInput(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Add requirement..." />
              <button type="button" onClick={handleAddRequirement} className="bg-blue-500 text-white px-3 py-2 rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requirements.map((req, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  {req}
                  <button type="button" onClick={() => handleRemoveRequirement(i)} className="ml-1 text-red-500">&times;</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" disabled={loading}>
              {loading ? 'Saving...' : competition ? 'Save Changes' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitionModal; 