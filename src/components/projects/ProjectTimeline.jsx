// src/components/projects/ProjectTimeline.jsx
import React from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Circle } from 'lucide-react';

const ProjectTimeline = ({ project }) => {
  const sortedMilestones = [...project.milestones].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Project Timeline</h3>
      <div className="relative">
        {sortedMilestones.map((milestone, index) => (
          <div key={milestone.id} className="flex mb-8 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              {milestone.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
              {index < sortedMilestones.length - 1 && (
                <div className="w-px h-full bg-gray-200 my-2" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{milestone.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  milestone.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : milestone.status === 'inProgress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                Overseer: {project.team?.find(m => m.id === milestone.overseer)?.name || 'Not assigned'}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar size={14} />
                {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;