import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarView from './CalendarView';
import { firebaseDb } from '../../services/firebaseDb';
import { toast } from 'react-hot-toast';
import { format, subMonths, addMonths } from 'date-fns';

const TimelineView = ({ project }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setMilestones] = useState([]);
  const [setProjectTeam] = useState([]);

  // Define loadTasks with useCallback
  const loadTasks = useCallback(async () => {
    if (!project?.id) return;
    
    setLoading(true);
    try {
      // Load tasks
      const projectTasks = await firebaseDb.getProjectTasks(project.id);
      
      // Transform tasks to ensure consistent data structure
      const transformedTasks = projectTasks.map(task => ({
        id: task.id,
        title: task.title || task.name || '',
        description: task.description || '',
        startDate: task.startDate || task.createdAt || new Date().toISOString().split('T')[0],
        endDate: task.dueDate || task.endDate || '',
        progress: task.progress || 0,
        status: task.status || 'todo',
        assignee: task.assignee || task.assignedTo || null,
        milestoneId: task.milestoneId || null,
        evidence: task.evidence || [],
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString()
      }));
      
      setTasks(transformedTasks);
      setError(null);
    } catch (error) {
      console.error('Error loading project data:', error);
      setError('Failed to load project data');
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [project?.id]); // Add project.id as dependency

  useEffect(() => {
    const loadProjectData = async () => {
      if (!project?.id) return;
      
      try {
        setLoading(true);
        const [milestoneData, teamData] = await Promise.all([
          firebaseDb.getProjectMilestones(project.id),
          firebaseDb.getProjectTeam(project.id)
        ]);
        setMilestones(milestoneData);
        setProjectTeam(teamData);
      } catch (error) {
        console.error('Error loading project data:', error);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [project?.id, setError, setMilestones, setProjectTeam]);

  // Call loadTasks when project changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-red-600 mb-2">Error loading timeline data</div>
        <button
          onClick={() => {
            setError(null);
            loadTasks();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header - More compact */}
      <div className="bg-white border-b">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-gray-800">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex">
              <button 
                onClick={() => setSelectedDate(subMonths(selectedDate, 1))} 
                className="p-0.5 hover:bg-gray-100 rounded"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setSelectedDate(addMonths(selectedDate, 1))} 
                className="p-0.5 hover:bg-gray-100 rounded"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center px-2.5 py-1 rounded text-sm ${
                view === 'calendar'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={16} className="mr-1.5" />
              Calendar
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`flex items-center px-2.5 py-1 rounded text-sm ${
                view === 'gantt'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart2 size={16} className="mr-1.5" />
              Gantt
            </button>
          </div>
        </div>
      </div>

      {/* Content - Optimized spacing */}
      <div className="bg-white">
        {view === 'gantt' ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <BarChart2 size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Gantt View Coming Soon</h3>
            <p className="text-gray-500 max-w-md">
              We're working on bringing you a powerful Gantt chart view for better project timeline visualization.
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No tasks found.
          </div>
        ) : (
          <CalendarView
            project={project}
            tasks={tasks}
            timeframe={view}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            currentDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
};

export default TimelineView; 