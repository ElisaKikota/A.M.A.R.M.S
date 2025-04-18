import React, { createContext, useContext } from 'react';
import { useProjectStore } from '../stores/projectsSlice';

export const ProjectContext = createContext({
  addTask: async (projectId, taskData) => {},
  updateTask: async (projectId, taskId, taskData) => {},
  deleteTask: async (projectId, taskId) => {},
  updateTaskProgress: async (projectId, taskId, progress) => {},
});

export const ProjectProvider = ({ children }) => {
  const projectStore = useProjectStore();

  return (
    <ProjectContext.Provider value={projectStore}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};