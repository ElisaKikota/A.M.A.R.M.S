import React from 'react';
import ProjectCard from './ProjectCard';
import { useProjectStore } from '../../stores/projectsSlice';

const ProjectList = () => {
  const projects = useProjectStore(state => Object.values(state.projects));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;