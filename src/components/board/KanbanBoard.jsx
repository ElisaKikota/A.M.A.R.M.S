import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Calendar, Paperclip, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';
import { useActivityLog } from '../../contexts/ActivityLogContext';
import TaskModal from './TaskModal';
import MilestoneModal from './MilestoneModal';
import TaskReviewModal from './TaskReviewModal';
import TaskDetailsModal from './TaskDetailsModal';

const COLUMN_NAMES = {
  todo: 'To Do',
  inProgress: 'In Progress',
  review: 'Review',
  done: 'Done',
  trash: 'Trash'
};

const COLUMN_COLORS = {
  todo: 'bg-red-50 border-red-200',
  inProgress: 'bg-blue-50 border-blue-200',
  review: 'bg-purple-50 border-purple-200',
  done: 'bg-green-50 border-green-200',
  trash: 'bg-gray-50 border-gray-200'
};

const STATUS_COLORS = {
  todo: 'bg-red-100 text-red-800',
  inProgress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  trash: 'bg-gray-100 text-gray-800'
};

const KanbanBoard = ({ projectId, currentUser, onMilestoneUpdate }) => {
  const { logTaskActivity, logMilestoneActivity } = useActivityLog();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [isTaskReviewModalOpen, setIsTaskReviewModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('all');
  const [project, setProject] = useState(null);
  const [showClearTrash, setShowClearTrash] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const projectData = await firebaseDb.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    }
  }, [projectId]);

  const loadMilestones = useCallback(async () => {
    try {
      const milestonesData = await firebaseDb.getProjectMilestones(projectId);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading milestones:', error);
      toast.error('Failed to load milestones');
    }
  }, [projectId]);

  const loadTeamMembers = useCallback(async () => {
    try {
      const teamData = await firebaseDb.getProjectTeam(projectId);
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    }
  }, [projectId]);

  const loadAllTasks = useCallback(async () => {
    try {
      const tasksData = await firebaseDb.getProjectTasks(projectId);
      setAllTasks(tasksData);
      const initialTasks = selectedMilestoneId === 'all'
        ? tasksData
        : tasksData.filter(task => task.milestoneId === selectedMilestoneId);
      setTasks(initialTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  }, [selectedMilestoneId, projectId]);

  useEffect(() => {
    loadProject();
    loadMilestones();
    loadTeamMembers();
    loadAllTasks();
  }, [loadProject, loadMilestones, loadTeamMembers, loadAllTasks]);

  useEffect(() => {
    if (allTasks.length > 0) {
      const filteredTasks = selectedMilestoneId === 'all' 
        ? allTasks 
        : allTasks.filter(task => task.milestoneId === selectedMilestoneId);
      setTasks(filteredTasks);
    }
  }, [selectedMilestoneId, allTasks]);

  useEffect(() => {
    setShowClearTrash(tasks.some(task => task.status === 'trash'));
  }, [tasks]);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    try {
      const updatedTask = {
        ...task,
        status: destination.droppableId,
        // Preserve existing review data if it exists
        review: destination.droppableId === 'review' 
          ? {
              startedAt: new Date().toISOString(),
              status: 'pending',
              reviewers: [],
              comments: task.review?.comments || [] // Preserve previous comments
            }
          : task.review // Keep existing review data when moving to other columns
      };

      // First update the backend
      await firebaseDb.updateTask(projectId, draggableId, updatedTask);

      // Log task status change
      const action = destination.droppableId === 'done' ? 'complete' : 'update';
      await logTaskActivity(action, updatedTask, projectId);

      // Then update the UI after successful backend update
      setAllTasks(prevTasks => 
        prevTasks.map(t => t.id === draggableId ? updatedTask : t)
      );
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === draggableId ? updatedTask : t)
      );

      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
      
      // Revert optimistic update if backend update fails
      setAllTasks(prevTasks => [...prevTasks]);
      setTasks(prevTasks => [...prevTasks]);
    }
  };

  const handleCreateTask = () => {
    if (selectedMilestoneId === 'all') {
      toast.error('Please select a specific milestone to create a task');
      return;
    }
    setCurrentTask(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setCurrentTask(task);
    if (task.status === 'review') {
      setIsTaskReviewModalOpen(true);
    } else {
      setIsTaskDetailsModalOpen(true);
    }
  };

  const handleEditTask = () => {
    setIsTaskDetailsModalOpen(false);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (currentTask) {
        const updatedTask = await firebaseDb.updateTask(projectId, currentTask.id, {
          ...taskData,
          updatedAt: new Date().toISOString()
        });

        // Log task update activity
        await logTaskActivity('update', updatedTask, projectId);

        setAllTasks(prevTasks => 
          prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
        );
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
        );
      } else {
        const createdTask = await firebaseDb.createTask(projectId, {
          ...taskData,
          status: 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          milestoneId: selectedMilestoneId,
          isDisposed: false
        });

        // Log task creation activity
        await logTaskActivity('create', createdTask, projectId);

        setAllTasks(prevTasks => [...prevTasks, createdTask]);
        if (selectedMilestoneId === 'all' || createdTask.milestoneId === selectedMilestoneId) {
          setTasks(prevTasks => [...prevTasks, createdTask]);
        }
      }
      
      setIsTaskModalOpen(false);
      setCurrentTask(null);
      toast.success(currentTask ? 'Task updated successfully' : 'Task created successfully');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleCreateMilestone = async (milestoneData) => {
    try {
      const timestamp = new Date().toISOString();
      const newMilestone = {
        ...milestoneData,
        createdAt: timestamp,
        updatedAt: timestamp,
        progress: 0,
        status: 'active',
        overseer: {
          email: teamMembers[0]?.email || '',
          id: teamMembers[0]?.id || '',
          name: teamMembers[0]?.name || '',
          role: teamMembers[0]?.role || ''
        }
      };

      const createdMilestone = await firebaseDb.createMilestone(projectId, newMilestone);
      
      // Log milestone creation activity
      await logMilestoneActivity('create', createdMilestone, projectId);

      setMilestones(prevMilestones => [...prevMilestones, createdMilestone]);
      setIsMilestoneModalOpen(false);
      toast.success('Milestone created successfully');

      // Trigger milestone update in parent components if the callback exists
      if (typeof onMilestoneUpdate === 'function') {
        onMilestoneUpdate();
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  const handleClearTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all tasks in the trash?')) {
      return;
    }

    try {
      const trashTasks = tasks.filter(task => task.status === 'trash');
      
      // Delete all trash tasks
      await Promise.all(trashTasks.map(task => 
        firebaseDb.deleteProjectTask(projectId, task.id)
      ));

      // Update local state
      setAllTasks(prevTasks => prevTasks.filter(task => task.status !== 'trash'));
      setTasks(prevTasks => prevTasks.filter(task => task.status !== 'trash'));
      toast.success('Trash cleared successfully');
    } catch (error) {
      console.error('Error clearing trash:', error);
      toast.error('Failed to clear trash');
    }
  };

  const handleReviewApprove = async (reviewData) => {
    try {
      const updatedTask = {
        ...currentTask,
        review: {
          ...currentTask.review,
          status: 'approved',
          comments: [
            ...(currentTask.review?.comments || []),
            {
              ...reviewData,
              status: 'approved'
            }
          ]
        }
      };

      // Update in Firebase
      await firebaseDb.updateTask(projectId, currentTask.id, updatedTask);

      // Update local state
      setAllTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
      );
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
      );

      setIsTaskReviewModalOpen(false);
      setCurrentTask(null);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleReviewReject = async (reviewData) => {
    try {
      const updatedTask = {
        ...currentTask,
        review: {
          ...currentTask.review,
          status: 'changes_requested',
          comments: [
            ...(currentTask.review?.comments || []),
            {
              ...reviewData,
              status: 'changes_requested'
            }
          ]
        }
      };

      // Update in Firebase
      await firebaseDb.updateTask(projectId, currentTask.id, updatedTask);

      // Update local state
      setAllTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
      );
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
      );

      setIsTaskReviewModalOpen(false);
      setCurrentTask(null);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleUpdateTaskInReview = async (updatedTaskData) => {
    try {
      const updatedTask = {
        ...currentTask,
        ...updatedTaskData
      };

      // Update in Firebase
      await firebaseDb.updateTask(projectId, currentTask.id, updatedTask);

      // Update local state
      setAllTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
      );
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTask.id ? updatedTask : task)
      );

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'inProgress'),
    review: tasks.filter(task => task.status === 'review'),
    done: tasks.filter(task => task.status === 'done'),
    trash: tasks.filter(task => task.status === 'trash')
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isDateApproachingOrOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3;
  };

  const MilestoneTab = ({ milestone }) => {
    const milestoneProgress = useMemo(() => {
      const milestoneTasks = allTasks.filter(task => task.milestoneId === milestone.id);
      const nonTrashTasks = milestoneTasks.filter(task => task.status !== 'trash');
      if (nonTrashTasks.length === 0) return 0;
      const completedTasks = nonTrashTasks.filter(task => task.status === 'done').length;
      return Math.round((completedTasks / nonTrashTasks.length) * 100);
    }, [milestone.id]);

    return (
      <div 
        className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer transition-colors whitespace-nowrap text-sm border-b-2
          ${selectedMilestoneId === milestone.id 
            ? 'border-blue-500 text-blue-600 font-medium' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        onClick={() => setSelectedMilestoneId(milestone.id)}
      >
        <span>{milestone.title}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{milestoneProgress}%</span>
        </div>
      </div>
    );
  };

  const MilestoneTabs = () => {
    const overallProgress = useMemo(() => {
      const nonTrashTasks = allTasks.filter(task => task.status !== 'trash');
      if (nonTrashTasks.length === 0) return 0;
      const completedTasks = nonTrashTasks.filter(task => task.status === 'done').length;
      return Math.round((completedTasks / nonTrashTasks.length) * 100);
    }, []);

    return (
      <div className="flex items-center overflow-x-auto hide-scrollbar">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer text-sm whitespace-nowrap border-b-2 transition-colors
            ${selectedMilestoneId === 'all' 
              ? 'border-blue-500 text-blue-600 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setSelectedMilestoneId('all')}
        >
          <span>All Tasks</span>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{overallProgress}%</span>
          </div>
        </div>
        {milestones.map(milestone => (
          <MilestoneTab key={milestone.id} milestone={milestone} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 -mt-4">
        <div className="flex items-center justify-between px-3 sm:px-4">
          <div className="flex-1 mr-3">
            <MilestoneTabs />
            </div>
          <div>
            <button
              onClick={() => setIsMilestoneModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-2 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
            {Object.entries(columns)
              .filter(([columnId]) => columnId !== 'trash')
              .map(([columnId, columnTasks]) => (
                <div key={columnId} className={`rounded-lg p-2 border ${COLUMN_COLORS[columnId]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${STATUS_COLORS[columnId]} px-2.5 py-0.5 rounded-full text-sm`}>
                      {COLUMN_NAMES[columnId]}
                    </h3>
                    {columnId === 'todo' && selectedMilestoneId !== 'all' ? (
                      <button
                        onClick={handleCreateTask}
                        className="p-1 rounded-full hover:bg-white/50 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Add Task"
                      >
                        <Plus size={16} />
                      </button>
                    ) : null}
                  </div>
                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 min-h-[200px]"
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-2.5 rounded-lg shadow-sm border hover:shadow-md transition-all hover:-translate-y-0.5 ${
                                  task.status === 'review' && task.review?.status === 'changes_requested'
                                    ? 'bg-red-50 border-red-100'
                                    : task.status === 'review' && task.review?.status === 'approved'
                                    ? 'bg-green-50 border-green-100'
                                    : ''
                                }`}
                                onClick={() => handleTaskClick(task)}
                              >
                                <div className="flex flex-col gap-1.5">
                                  <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                                  <div className="text-xs text-gray-600 line-clamp-2">{task.description}</div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {task.dueDate && (
                                        <div className={`flex items-center gap-1 text-xs ${
                                          isDateApproachingOrOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                          <Calendar size={12} />
                                          {formatDate(task.dueDate)}
                                        </div>
                                      )}
                                      {task.evidence?.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-blue-600">
                                          <Paperclip size={12} />
                                          <span>{task.evidence.length}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {Object.values(task.assignee || {}).length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {Object.values(task.assignee || {})
                                        .filter(assignee => assignee && assignee.name)
                                        .map((assignee, idx) => (
                                          <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                                            {assignee.name}
                                          </span>
                                        ))}
                                    </div>
                                  )}
                                  {task.status === 'review' && task.review && (
                                    <div className="flex items-center gap-1 text-xs mt-2 pt-2 border-t border-gray-100">
                                      <MessageSquare size={12} className={
                                        task.review.status === 'approved'
                                          ? 'text-green-600'
                                          : task.review.status === 'changes_requested'
                                          ? 'text-red-600'
                                          : 'text-purple-600'
                                      } />
                                      <span className={
                                        task.review.status === 'approved'
                                          ? 'text-green-600'
                                          : task.review.status === 'changes_requested'
                                          ? 'text-red-600'
                                          : 'text-purple-600'
                                      }>
                                        {task.review.status === 'approved'
                                          ? 'Approved'
                                          : task.review.status === 'changes_requested'
                                          ? 'Changes Requested'
                                          : 'Under Review'
                                        }
                                        {task.review.comments?.length > 0 && ` (${task.review.comments.length})`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
          </div>

          {/* Trash Column */}
          <div className={`w-72 rounded-lg p-2 border ${COLUMN_COLORS['trash']}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium ${STATUS_COLORS['trash']} px-2.5 py-0.5 rounded-full text-sm`}>
                {COLUMN_NAMES['trash']}
              </h3>
            </div>
            <Droppable droppableId="trash">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 min-h-[200px]"
                >
                  {columns['trash'].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2.5 rounded-lg shadow-sm border hover:shadow-md transition-all hover:-translate-y-0.5"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex flex-col gap-1.5">
                            <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                            <div className="text-xs text-gray-600 line-clamp-2">{task.description}</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.dueDate && (
                                  <div className={`flex items-center gap-1 text-xs ${isDateApproachingOrOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                                    <Calendar size={12} />
                                    {formatDate(task.dueDate)}
                                  </div>
                                )}
                                {task.evidence?.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <Paperclip size={12} />
                                    <span>{task.evidence.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {Object.values(task.assignee || {}).length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {Object.values(task.assignee || {})
                                  .filter(assignee => assignee && assignee.name)
                                  .map((assignee, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                                      {assignee.name}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {showClearTrash && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleClearTrash}
                  className="px-2.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium inline-flex items-center"
                >
                  Clear Trash
                </button>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>

      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => {
          setIsTaskDetailsModalOpen(false);
          setCurrentTask(null);
        }}
        task={currentTask}
        onEdit={handleEditTask}
        projectId={projectId}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setCurrentTask(null);
        }}
        onSave={handleSaveTask}
        task={currentTask}
        projectId={projectId}
        teamMembers={teamMembers}
      />

      <TaskReviewModal
        isOpen={isTaskReviewModalOpen}
        onClose={() => {
          setIsTaskReviewModalOpen(false);
          setCurrentTask(null);
        }}
        task={currentTask}
        currentUser={currentUser}
        onApprove={handleReviewApprove}
        onReject={handleReviewReject}
        onUpdateTask={handleUpdateTaskInReview}
        projectId={projectId}
        teamMembers={teamMembers}
      />

      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSave={handleCreateMilestone}
        projectId={projectId}
        teamMembers={teamMembers}
        projectStartDate={project?.startDate}
        projectEndDate={project?.endDate}
      />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard; 