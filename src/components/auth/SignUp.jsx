import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const SignUp = () => {
  const [formData, setFormData] = useState({
    role: '',
    clientKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.role === 'client') {
      // Fetch the client key from Firestore
      const clientDoc = await getDoc(doc(db, 'authorization', 'client'));
      const clientCode = clientDoc.exists() ? clientDoc.data().code : null;
      if (!clientCode || formData.clientKey !== clientCode) {
        setError('Invalid client authorization key.');
        setLoading(false);
        return;
      }
    }

    // ... existing code ...
  };

  return (
    <div>
      {/* ... existing code ... */}
      {formData.role === 'client' && (
        <div className="mb-4">
          <label htmlFor="clientKey" className="block text-gray-700 font-medium mb-2">Client Authorization Key</label>
          <input
            type="text"
            id="clientKey"
            name="clientKey"
            value={formData.clientKey || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}
      {/* ... */}
    </div>
  );
};

export default SignUp; 