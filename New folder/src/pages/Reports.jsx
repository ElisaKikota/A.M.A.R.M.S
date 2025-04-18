import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseDb } from '../services/firebaseDb';
import { Users, TrendingUp, Activity, Calendar, Database, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import ProjectProgressChart from '../components/reports/ProjectProgressChart';
import ResourceUtilizationChart from '../components/reports/ResourceUtilizationChart';
import ReportsGenerator from '../components/reports/ReportsGenerator';
import { toast } from 'react-hot-toast';
import { useActivityLog } from '../contexts/ActivityLogContext';

const Reports = () => {
  const { user } = useFirebase();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [activeProjectTab, setActiveProjectTab] = useState('graph');
  const [data, setData] = useState({
    projects: [],
    teamMembers: [],
    resources: [],
    bookings: []
  });
  const [teamMetrics, setTeamMetrics] = useState({
    totalCompletedTasks: 0,
    activityScore: 0,
    recentActivities: []
  });
  const [teamActivities, setTeamActivities] = useState([]);
  const { getUserActivityMetrics, getTeamActivitySummary } = useActivityLog();
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  useEffect(() => {
    // When overview tab is selected in location state, change it to projects
    if (location.state && location.state.activeTab) {
      if (location.state.activeTab === 'overview') {
        setActiveTab('projects');
      } else {
        setActiveTab(location.state.activeTab);
      }
    } else {
      // Set default tab to projects instead of overview
      setActiveTab('projects');
    }
  }, [location]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
               
        const [projectsData, teamData, resourcesData, bookingsData] = await Promise.all([
          firebaseDb.getProjects(user.uid),
          firebaseDb.getTeamMembers(user.uid),
          firebaseDb.getResources(user.uid),
          firebaseDb.getBookings(user.uid)
        ]);

        // Debug: Log milestone data for Drone Displays project
        const droneProject = projectsData.find(p => p.name === 'Drone Displays');
        if (droneProject) {
          console.log('Drone Displays project found:', droneProject);
          console.log('Milestones:', droneProject.milestones);
          
          // Log progress for each milestone
          droneProject.milestones?.forEach((milestone, index) => {
            console.log(`Milestone ${index + 1}: ${milestone.title || 'Untitled'}`);
            console.log(`  Status: ${milestone.status}, Progress: ${milestone.progress}`);
            console.log(`  Column: ${milestone.column}, Tasks: ${milestone.tasks?.length || 0}`);
            console.log(`  Raw milestone data:`, milestone);
          });
        } else {
          console.log('Drone Displays project not found in data');
        }

        // Load tasks for each project
        const projectsWithTasks = await Promise.all(
          projectsData.map(async (project) => {
            try {
              const projectTasks = await firebaseDb.getProjectTasks(project.id);
              return {
                ...project,
                tasks: projectTasks
              };
            } catch (error) {
              console.error(`Error loading tasks for project ${project.id}:`, error);
              return project;
            }
          })
        );

        // Get team activity data
        const teamMemberIds = teamData.map(member => member.id);
        
        // Load activity data for all team members
        let teamWithActivityData = teamData;
        
        if (teamMemberIds.length > 0) {
          try {
            // Get team activity summary
            const teamActivitySummary = await getTeamActivitySummary(teamMemberIds, 'month');
            
            // Combine activity data with team member data
            teamWithActivityData = teamData.map(member => {
              const activityData = teamActivitySummary.find(a => a.userId === member.id)?.metrics || {};
              
              // Calculate activity score (0-10) based on various metrics
              const tasksCompleted = activityData.tasksCompleted || 0;
              const milestonesCompleted = activityData.milestonesCompleted || 0;
              const commentsAdded = activityData.commentsAdded || 0;
              const documentsUploaded = activityData.documentsUploaded || 0;
              
              // Simple scoring algorithm
              const activityScore = Math.min(10, Math.round(
                (tasksCompleted * 2 + milestonesCompleted * 3 + commentsAdded + documentsUploaded) / 3
              ));
              
              return {
                ...member,
                activityData: {
                  ...activityData,
                  activityScore
                }
              };
            });
            
            // Calculate overall team metrics
            const totalCompletedTasks = teamActivitySummary.reduce(
              (sum, item) => sum + (item.metrics.tasksCompleted || 0), 0
            );
            
            const teamActivityScores = teamWithActivityData.map(m => m.activityData?.activityScore || 0);
            const avgActivityScore = teamActivityScores.length > 0 
              ? Math.round(teamActivityScores.reduce((sum, score) => sum + score, 0) / teamActivityScores.length) 
              : 0;
            
            setTeamMetrics({
              totalCompletedTasks,
              activityScore: avgActivityScore,
              recentActivities: []
            });
            
            // Get recent team activities for the activity feed
            // This would be a simplified implementation
            const mockActivities = teamWithActivityData
              .filter(member => member.activityData?.tasksCompleted > 0)
              .map(member => ({
                user: { 
                  id: member.id,
                  name: member.name
                },
                description: `Completed ${member.activityData.tasksCompleted} tasks this month`,
                timestamp: new Date().toISOString()
              }));
            
            setTeamActivities(mockActivities);
          } catch (error) {
            console.error('Error loading team activity data:', error);
            // Fallback to basic team data without activity metrics
          }
        }

        setData({
          projects: projectsWithTasks,
          teamMembers: teamWithActivityData,
          resources: resourcesData,
          bookings: bookingsData
        });
      } catch (error) {
        console.error('Error loading report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, getUserActivityMetrics, getTeamActivitySummary]);

  // Prepare chart data
  const progressData = data.projects.map(project => {
    if (!project.milestones || project.milestones.length === 0) {
      return {
        name: project.name,
        completed: 0,
        inProgress: 0
      };
    }
    
    // Count total milestones
    const totalMilestones = project.milestones.length;
    
    // Count milestones as completed if any of these conditions are met
    const completedMilestones = project.milestones.filter(m => {
      // Debug log for the milestone being checked
      
      const milestoneTitle = m.title || m.name || 'Unnamed milestone';
      
      // If milestone has a progress field at 100%, it's completed
      if (m.progress === 100) {
        console.log(`Milestone ${milestoneTitle} completed based on progress=100`);
        return true;
      }
      
      // If milestone has a status field set to 'completed', it's completed
      if (m.status === 'completed') {
        console.log(`Milestone ${milestoneTitle} completed based on status=completed`);
        return true;
      }
      
      // For board view where progress is shown as percentage string
      if (typeof m.progress === 'string' && m.progress.includes('%')) {
        const progressValue = parseInt(m.progress.replace('%', '').trim());
        if (progressValue === 100) {
          console.log(`Milestone ${milestoneTitle} completed based on progress string=${m.progress}`);
          return true;
        }
      }
      
      // If milestone is in the Done column on board
      if (m.column === 'done' || m.status === 'done') {
        console.log(`Milestone ${milestoneTitle} completed based on column/status=done`);
        return true;
      }
      
      // Check the title to identify board view section
      // E.g., "Team formation" with 100% is shown in the screenshot
      if (m.title && m.title.toLowerCase().includes('team formation') && 
          (m.progress === 100 || (typeof m.progress === 'string' && m.progress.includes('100%')))) {
        console.log(`Milestone ${milestoneTitle} completed based on title pattern match`);
        return true;
      }
      
      // If milestone has tasks, check if all are completed
      if (m.tasks && m.tasks.length > 0) {
        const completedTasks = m.tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
        const allTasksComplete = completedTasks === m.tasks.length && completedTasks > 0;
        if (allTasksComplete) {
          console.log(`Milestone ${milestoneTitle} completed based on its internal tasks (${completedTasks}/${m.tasks.length})`);
          return true;
        }
      }
      
      // Special case: Check if all tasks for this milestone are in the done column
      // First check if the milestone has a valid ID
      if (m.id) {
        // Find all tasks in the project that belong to this milestone
        const milestoneTasks = project.tasks?.filter(task => task.milestoneId === m.id);
        console.log(`Milestone ${milestoneTitle} (id: ${m.id}) has ${milestoneTasks?.length || 0} project tasks`);
        
        // If there are tasks and all are in the done column, milestone is completed
        if (milestoneTasks && milestoneTasks.length > 0) {
          const allTasksDone = milestoneTasks.every(task => 
            task.status === 'done' || task.status === 'completed');
          if (allTasksDone) {
            console.log(`Milestone ${milestoneTitle} completed based on all project tasks done (${milestoneTasks.length} tasks)`);
            return true;
          }
        }
      }
      
      return false;
    }).length;
    
    // Count in-progress milestones as (total - completed)
    const inProgressMilestones = totalMilestones - completedMilestones;
    
    return {
      name: project.name,
      completed: completedMilestones,
      inProgress: inProgressMilestones
    };
  });

  // Prepare resource utilization data
  const resourceData = data.resources.length > 0 
    ? data.resources.map(resource => ({
        resource: resource.name,
        used: resource.utilization,
        available: 100 - resource.utilization
      }))
    : [
    { resource: 'Equipment', used: 75, available: 25 },
    { resource: 'Software Licenses', used: 60, available: 40 },
    { resource: 'Meeting Rooms', used: 85, available: 15 }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'projects', label: 'Projects', icon: Activity },
    { id: 'resources', label: 'Resources', icon: Database },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'generate', label: 'Generate', icon: Download },
    { id: 'timeline', label: 'Timeline', icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - reduced spacing */}
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500 mt-0.5">View project metrics and performance insights</p>
        </div>
      </div>

      {/* Tabs - reduced height */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - reduced top margin */}
      <div className="mt-3">
        {/* Projects Tab (formerly Progress) */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow p-3">
              {/* Nested tabs for Projects section - reduced spacing */}
              <div className="border-b mb-2">
                <nav className="flex space-x-8">
                  {[
                    { id: 'graph', label: 'Graph', icon: TrendingUp },
                    { id: 'milestones', label: 'Milestone Completion', icon: Activity }
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveProjectTab(subTab.id)}
                      className={`py-1.5 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm ${
                        activeProjectTab === subTab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <subTab.icon size={14} />
                      <span>{subTab.label}</span>
                    </button>
                  ))}
                </nav>
      </div>

              {/* Content for the nested tabs */}
              {activeProjectTab === 'graph' && (
                <div>
                  <ProjectProgressChart data={progressData} />
        </div>
              )}
              
              {activeProjectTab === 'milestones' && (
                <div>
                  <div className="overflow-x-auto -mx-2">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Milestones</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              </tr>
            </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.projects.map(project => {
                          const totalMilestones = project.milestones?.length || 0;
                          
                          // Use the same milestone completion detection logic
                          const completedMilestones = project.milestones?.filter(m => {
                            // If milestone has a progress field at 100%, it's completed
                            if (m.progress === 100) return true;
                            
                            // If milestone has a status field set to 'completed', it's completed
                            if (m.status === 'completed') return true;
                            
                            // For board view where progress is shown as percentage string
                            if (typeof m.progress === 'string' && m.progress.includes('%')) {
                              const progressValue = parseInt(m.progress.replace('%', '').trim());
                              if (progressValue === 100) return true;
                            }
                            
                            // If milestone is in the Done column on board
                            if (m.column === 'done' || m.status === 'done') return true;
                            
                            // Check the title to identify board view section
                            // E.g., "Team formation" with 100% is shown in the screenshot
                            if (m.title && m.title.toLowerCase().includes('team formation') && 
                                (m.progress === 100 || (typeof m.progress === 'string' && m.progress.includes('100%')))) {
                              return true;
                            }
                            
                            // If milestone has tasks, check if all are completed
                            if (m.tasks && m.tasks.length > 0) {
                              const completedTasks = m.tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
                              return completedTasks === m.tasks.length && completedTasks > 0;
                            }
                            
                            // Special case: Check if all tasks for this milestone are in the done column
                            // First check if the milestone has a valid ID
                            if (m.id) {
                              // Find all tasks in project tasks that belong to this milestone
                              const milestoneTasks = project.tasks?.filter(task => task.milestoneId === m.id);
                              // If there are tasks and all are in the done column, milestone is completed
                              if (milestoneTasks && milestoneTasks.length > 0) {
                                const allTasksDone = milestoneTasks.every(task => 
                                  task.status === 'done' || task.status === 'completed');
                                if (allTasksDone) return true;
                              }
                            }
                            
                            return false;
                          }).length || 0;
                          
                          const inProgressMilestones = totalMilestones - completedMilestones;
                          const completionRate = totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                          
                          return (
                <tr key={project.id}>
                              <td className="px-4 py-2 whitespace-nowrap">{project.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{totalMilestones}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                  {completedMilestones}
                                </span>
                  </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                  {inProgressMilestones}
                    </span>
                  </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${completionRate}%` }}
                                    ></div>
                                  </div>
                                  <span>{completionRate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Resource Utilization</h3>
              <ResourceUtilizationChart data={resourceData} />

              <div className="mt-4">
                <h4 className="font-medium mb-2">Resource Allocation by Project</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Projects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.resources.map(resource => (
                        <tr key={resource.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{resource.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{resource.type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${resource.utilization}%` }}
                        ></div>
                      </div>
                              <span>{resource.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                            {resource.projects?.length || 0} projects
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              resource.status === 'available' ? 'bg-green-100 text-green-800' :
                              resource.status === 'partiallyAvailable' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {resource.status || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Team Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-1">Active Members</h4>
                  <p className="text-2xl font-bold">{data.teamMembers.filter(m => m.status === 'active').length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-1">Completed Tasks</h4>
                  <p className="text-2xl font-bold">{teamMetrics.totalCompletedTasks || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-1">Team Activity Score</h4>
                  <p className="text-2xl font-bold">{teamMetrics.activityScore || 0}/10</p>
                </div>
              </div>
              
              <div className="mt-2">
                <h4 className="font-medium mb-2">Team Members</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Projects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.teamMembers.map(member => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{member.role || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{member.projects?.length || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{member.activityData?.tasksCompleted || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${member.activityData?.activityScore * 10 || 0}%` }}
                                ></div>
                              </div>
                              <span>{member.activityData?.activityScore || 0}/10</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'onLeave' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {member.status || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Recent Team Activities</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {teamActivities.slice(0, 5).map((activity, index) => (
                      <li key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.user?.name || 'Unknown user'}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                        </div>
                      </li>
                    ))}
                    {teamActivities.length === 0 && (
                      <li className="text-gray-500 text-center py-4">No recent activities found</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <ReportsGenerator />
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Project Timeline</h3>
              
              <div className="mt-2">
                <div className="space-y-6">
                  {data.projects.map(project => (
                    <div key={project.id} className="border-b pb-4">
                      <h4 className="font-medium mb-1">{project.name}</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        {project.startDate ? `Started: ${new Date(project.startDate).toLocaleDateString()}` : 'No start date'} | 
                        {project.dueDate ? ` Due: ${new Date(project.dueDate).toLocaleDateString()}` : ' No due date'}
                      </p>
                      
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-4">
                          {project.milestones?.map((milestone, index) => (
                            <div key={index} className="ml-10 relative">
                              <div className={`absolute -left-10 mt-1.5 w-6 h-6 rounded-full ${
                                milestone.status === 'completed' ? 'bg-green-500' :
                                milestone.status === 'inProgress' ? 'bg-blue-500' :
                                'bg-gray-300'
                              } flex items-center justify-center`}>
                                <span className="text-white text-xs">{index + 1}</span>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium">{milestone.name}</h5>
                                <p className="text-sm text-gray-500 mt-1">
                                  {milestone.dueDate ? `Due: ${new Date(milestone.dueDate).toLocaleDateString()}` : 'No due date'}
                                </p>
                                <div className="flex items-center mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        milestone.status === 'completed' ? 'bg-green-500' :
                                        milestone.status === 'inProgress' ? 'bg-blue-500' :
                                        'bg-gray-300'
                                      }`}
                                      style={{ width: `${milestone.progress || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">{milestone.progress || 0}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;