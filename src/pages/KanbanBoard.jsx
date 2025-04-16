import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { firebaseDb } from '../services/firebaseDb';
import KanbanBoard from '../components/board/KanbanBoard';
import { useFirebase } from '../contexts/FirebaseContext';

const KanbanBoardPage = () => {
  const { projectId } = useParams();
  const { user } = useFirebase();
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const milestonesData = await firebaseDb.getProjectMilestones(projectId);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };
    
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Project Tasks</h1>
        <select
          value={selectedMilestoneId}
          onChange={(e) => setSelectedMilestoneId(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
            </option>
          ))}
        </select>
      </div>

      <KanbanBoard
        projectId={projectId}
        selectedMilestoneId={selectedMilestoneId}
        currentUser={user}
      />
    </div>
  );
};

export default KanbanBoardPage; 