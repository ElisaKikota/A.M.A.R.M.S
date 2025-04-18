import React, { createContext, useContext, useCallback } from 'react';
import { useFirebase } from './FirebaseContext';
import { activityLogService, ACTIVITY_TYPES } from '../services/activityLogService';

const ActivityLogContext = createContext();

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};

export const ActivityLogProvider = ({ children }) => {
  const { user } = useFirebase();

  const logActivity = useCallback(
    async (type, details, projectId = null) => {
      if (!user) return null;
      return await activityLogService.logActivity(user.uid, type, details, projectId);
    },
    [user]
  );

  const logTaskActivity = useCallback(
    async (action, task, projectId) => {
      if (!user || !task) return null;

      let activityType;
      switch (action) {
        case 'create':
          activityType = ACTIVITY_TYPES.TASK_CREATED;
          break;
        case 'update':
          activityType = ACTIVITY_TYPES.TASK_UPDATED;
          break;
        case 'complete':
          activityType = ACTIVITY_TYPES.TASK_COMPLETED;
          break;
        case 'delete':
          activityType = ACTIVITY_TYPES.TASK_DELETED;
          break;
        default:
          return null;
      }

      const details = {
        taskId: task.id,
        title: task.title,
        status: task.status,
        action
      };

      return await logActivity(activityType, details, projectId);
    },
    [user, logActivity]
  );

  const logProjectActivity = useCallback(
    async (action, project) => {
      if (!user || !project) return null;

      let activityType;
      switch (action) {
        case 'create':
          activityType = ACTIVITY_TYPES.PROJECT_CREATED;
          break;
        case 'update':
          activityType = ACTIVITY_TYPES.PROJECT_UPDATED;
          break;
        case 'delete':
          activityType = ACTIVITY_TYPES.PROJECT_DELETED;
          break;
        default:
          return null;
      }

      const details = {
        projectId: project.id,
        name: project.name,
        action
      };

      return await logActivity(activityType, details, project.id);
    },
    [user, logActivity]
  );

  const logMilestoneActivity = useCallback(
    async (action, milestone, projectId) => {
      if (!user || !milestone || !projectId) return null;

      let activityType;
      switch (action) {
        case 'create':
          activityType = ACTIVITY_TYPES.MILESTONE_CREATED;
          break;
        case 'update':
          activityType = ACTIVITY_TYPES.MILESTONE_UPDATED;
          break;
        case 'complete':
          activityType = ACTIVITY_TYPES.MILESTONE_COMPLETED;
          break;
        default:
          return null;
      }

      const details = {
        milestoneId: milestone.id,
        title: milestone.title,
        status: milestone.status,
        action
      };

      return await logActivity(activityType, details, projectId);
    },
    [user, logActivity]
  );

  const logDocumentActivity = useCallback(
    async (action, document, projectId) => {
      if (!user || !document) return null;

      let activityType;
      switch (action) {
        case 'upload':
          activityType = ACTIVITY_TYPES.DOCUMENT_UPLOADED;
          break;
        case 'update':
          activityType = ACTIVITY_TYPES.DOCUMENT_UPDATED;
          break;
        case 'delete':
          activityType = ACTIVITY_TYPES.DOCUMENT_DELETED;
          break;
        default:
          return null;
      }

      const details = {
        documentId: document.id,
        name: document.name || document.title,
        type: document.type,
        action
      };

      return await logActivity(activityType, details, projectId);
    },
    [user, logActivity]
  );

  const logCommentActivity = useCallback(
    async (comment, projectId, relatedItemType, relatedItemId) => {
      if (!user || !comment) return null;

      const details = {
        commentId: comment.id,
        content: comment.content,
        relatedItemType,
        relatedItemId
      };

      return await logActivity(ACTIVITY_TYPES.COMMENT_ADDED, details, projectId);
    },
    [user, logActivity]
  );

  const logUserSessionActivity = useCallback(
    async (action) => {
      if (!user) return null;

      const activityType = action === 'login' 
        ? ACTIVITY_TYPES.USER_LOGIN 
        : ACTIVITY_TYPES.USER_LOGOUT;

      const details = {
        timestamp: new Date().toISOString(),
        action
      };

      return await logActivity(activityType, details);
    },
    [user, logActivity]
  );

  const logPageVisit = useCallback(
    async (pathname) => {
      if (!user) return null;

      const details = {
        timestamp: new Date().toISOString(),
        pathname
      };

      return await logActivity(ACTIVITY_TYPES.PAGE_VISIT, details);
    },
    [user, logActivity]
  );

  const logResourceActivity = useCallback(
    async (action, resource, projectId) => {
      if (!user || !resource) return null;

      const activityType = action === 'allocate' 
        ? ACTIVITY_TYPES.RESOURCE_ALLOCATED 
        : ACTIVITY_TYPES.RESOURCE_DEALLOCATED;

      const details = {
        resourceId: resource.id,
        name: resource.name,
        type: resource.type,
        action
      };

      return await logActivity(activityType, details, projectId);
    },
    [user, logActivity]
  );

  // Get user activities with pagination
  const getUserActivities = useCallback(
    async (userId = null, pageSize = 20, lastDoc = null) => {
      const targetUserId = userId || (user ? user.uid : null);
      if (!targetUserId) return { activities: [], lastDoc: null, hasMore: false };
      
      return await activityLogService.getUserActivities(targetUserId, pageSize, lastDoc);
    },
    [user]
  );

  // Get project activities with pagination
  const getProjectActivities = useCallback(async (projectId, pageSize = 20, lastDoc = null) => {
    if (!projectId) return { activities: [], lastDoc: null, hasMore: false };
    
    return await activityLogService.getProjectActivities(projectId, pageSize, lastDoc);
  }, []);

  // Get user activity metrics
  const getUserActivityMetrics = useCallback(
    async (userId = null, timeframe = 'week') => {
      const targetUserId = userId || (user ? user.uid : null);
      if (!targetUserId) return {};
      
      return await activityLogService.getUserActivityMetrics(targetUserId, timeframe);
    },
    [user]
  );

  // Get team activity summary
  const getTeamActivitySummary = useCallback(async (userIds, timeframe = 'week') => {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) return [];
    
    return await activityLogService.getTeamActivitySummary(userIds, timeframe);
  }, []);

  const value = {
    // Logging functions
    logActivity,
    logTaskActivity,
    logProjectActivity,
    logMilestoneActivity,
    logDocumentActivity,
    logCommentActivity,
    logUserSessionActivity,
    logPageVisit,
    logResourceActivity,
    
    // Retrieval functions
    getUserActivities,
    getProjectActivities,
    getUserActivityMetrics,
    getTeamActivitySummary,
    
    // Constants
    ACTIVITY_TYPES
  };

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
}; 