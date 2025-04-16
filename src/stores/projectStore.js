import create from 'zustand';
import { firebaseDb } from '../services/firebaseDb';

const useProjectStore = create((set) => ({
  projects: [
    {
      id: '1',
      name: 'Voice Training',
      description: 'Swahili text to speech model training system',
      status: 'inProgress',
      milestones: [
        {
          name: 'Website Development',
          dueDate: '2024-11-30',
          status: 'pending'
        },
        {
          name: 'Portal Testing',
          dueDate: '2024-12-31',
          status: 'pending'
        }
      ]
    },
    {
      id: '2',
      name: 'EnergyOpt',
      description: 'Machine learning software for energy efficiency',
      status: 'inProgress',
      milestones: [
        {
          name: 'Data Analysis',
          dueDate: '2024-11-15',
          status: 'completed'
        },
        {
          name: 'Algorithm Implementation',
          dueDate: '2024-12-15',
          status: 'pending'
        }
      ]
    }
    // Add all other projects from the document
  ],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  }))
}));