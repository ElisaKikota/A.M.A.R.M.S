import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Activity types constants
export const ACTIVITY_TYPES = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_DELETED: 'TASK_DELETED',
  
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  
  MILESTONE_CREATED: 'MILESTONE_CREATED',
  MILESTONE_UPDATED: 'MILESTONE_UPDATED',
  MILESTONE_COMPLETED: 'MILESTONE_COMPLETED',
  
  COMMENT_ADDED: 'COMMENT_ADDED',
  
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_UPDATED: 'DOCUMENT_UPDATED',
  DOCUMENT_DELETED: 'DOCUMENT_DELETED',
  
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  
  RESOURCE_ALLOCATED: 'RESOURCE_ALLOCATED',
  RESOURCE_DEALLOCATED: 'RESOURCE_DEALLOCATED',
  
  PAGE_VISIT: 'PAGE_VISIT'
};

export const activityLogService = {
  /**
   * Log a user activity
   * @param {string} userId - The ID of the user who performed the action
   * @param {string} type - The type of activity from ACTIVITY_TYPES
   * @param {Object} details - Additional details about the activity
   * @param {string} [projectId] - Optional project ID related to the activity
   * @returns {Promise<string>} - The ID of the created activity log
   */
  async logActivity(userId, type, details, projectId = null) {
    try {
      if (!userId) {
        console.warn('No userId provided to logActivity');
        return null;
      }

      if (!type || !Object.values(ACTIVITY_TYPES).includes(type)) {
        console.warn(`Invalid activity type: ${type}`);
        return null;
      }

      const activityData = {
        userId,
        type,
        details: details || {},
        timestamp: new Date().toISOString(),
        serverTimestamp: serverTimestamp(), // For accurate time ordering
      };

      if (projectId) {
        activityData.projectId = projectId;
      }

      const activitiesRef = collection(db, 'activities');
      const docRef = await addDoc(activitiesRef, activityData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  },

  /**
   * Get activities for a specific user
   * @param {string} userId - The ID of the user
   * @param {number} [pageSize=20] - Number of activities to fetch per page
   * @param {Object} [lastDoc=null] - The last document for pagination
   * @returns {Promise<Object>} - Object with activities and pagination info
   */
  async getUserActivities(userId, pageSize = 20, lastDoc = null) {
    try {
      if (!userId) {
        console.warn('No userId provided to getUserActivities');
        return { activities: [], lastDoc: null, hasMore: false };
      }

      const activitiesRef = collection(db, 'activities');
      let q = query(
        activitiesRef,
        where('userId', '==', userId),
        orderBy('serverTimestamp', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const hasMore = activities.length === pageSize;
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      return {
        activities,
        lastDoc: newLastDoc,
        hasMore
      };
    } catch (error) {
      console.error('Error getting user activities:', error);
      return { activities: [], lastDoc: null, hasMore: false };
    }
  },

  /**
   * Get activities for a specific project
   * @param {string} projectId - The ID of the project
   * @param {number} [pageSize=20] - Number of activities to fetch per page
   * @param {Object} [lastDoc=null] - The last document for pagination
   * @returns {Promise<Object>} - Object with activities and pagination info
   */
  async getProjectActivities(projectId, pageSize = 20, lastDoc = null) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectActivities');
        return { activities: [], lastDoc: null, hasMore: false };
      }

      const activitiesRef = collection(db, 'activities');
      let q = query(
        activitiesRef,
        where('projectId', '==', projectId),
        orderBy('serverTimestamp', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const hasMore = activities.length === pageSize;
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      return {
        activities,
        lastDoc: newLastDoc,
        hasMore
      };
    } catch (error) {
      console.error('Error getting project activities:', error);
      return { activities: [], lastDoc: null, hasMore: false };
    }
  },

  /**
   * Get user activity metrics (counts by type for a timeframe)
   * @param {string} userId - The ID of the user
   * @param {string} [timeframe='week'] - Timeframe for the metrics ('day', 'week', 'month')
   * @returns {Promise<Object>} - Metrics object with counts by activity type
   */
  async getUserActivityMetrics(userId, timeframe = 'week') {
    try {
      if (!userId) {
        console.warn('No userId provided to getUserActivityMetrics');
        return {};
      }

      // Calculate start date based on timeframe
      const startDate = new Date();
      if (timeframe === 'day') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'month') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      const startDateStr = startDate.toISOString();

      // Get all activities for the user in the timeframe
      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        where('timestamp', '>=', startDateStr),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Count activities by type
      const metrics = {
        totalActivities: activities.length,
        byType: {}
      };

      // Initialize all activity types with 0 count
      Object.values(ACTIVITY_TYPES).forEach(type => {
        metrics.byType[type] = 0;
      });

      // Count activities by type
      activities.forEach(activity => {
        if (activity.type) {
          metrics.byType[activity.type] = (metrics.byType[activity.type] || 0) + 1;
        }
      });

      // Add derived metrics
      metrics.tasksCompleted = metrics.byType[ACTIVITY_TYPES.TASK_COMPLETED] || 0;
      metrics.milestonesCompleted = metrics.byType[ACTIVITY_TYPES.MILESTONE_COMPLETED] || 0;
      metrics.commentsAdded = metrics.byType[ACTIVITY_TYPES.COMMENT_ADDED] || 0;
      metrics.documentsUploaded = metrics.byType[ACTIVITY_TYPES.DOCUMENT_UPLOADED] || 0;
      
      // Calculate time spent in the system based on page visit patterns
      const pageVisits = activities
        .filter(a => a.type === ACTIVITY_TYPES.PAGE_VISIT)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      let timeSpentInSystem = 0;
      const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
      const MIN_SESSION_TIME = 1 * 60 * 1000; // 1 minute minimum session time
      
      if (pageVisits.length > 0) {
        let sessionStart = new Date(pageVisits[0].timestamp);
        let lastVisit = sessionStart;
        
        if (pageVisits.length === 1) {
          // If there's only one page visit, count it as a minimum session time
          timeSpentInSystem = MIN_SESSION_TIME;
        } else {
          for (let i = 1; i < pageVisits.length; i++) {
            const currentVisit = new Date(pageVisits[i].timestamp);
            const timeSinceLastVisit = currentVisit - lastVisit;
            
            if (timeSinceLastVisit <= SESSION_TIMEOUT) {
              // User is still in the same session
              lastVisit = currentVisit;
            } else {
              // Session ended, add the time spent (minimum 1 minute)
              timeSpentInSystem += Math.max(MIN_SESSION_TIME, lastVisit - sessionStart);
              // Start new session
              sessionStart = currentVisit;
              lastVisit = currentVisit;
            }
          }
          
          // Add the last session (minimum 1 minute)
          timeSpentInSystem += Math.max(MIN_SESSION_TIME, lastVisit - sessionStart);
        }
        
        // Convert to minutes
        timeSpentInSystem = Math.round(timeSpentInSystem / (60 * 1000));
      }
      
      metrics.timeSpentInSystem = timeSpentInSystem;
      
      // Calculate unique pages visited
      const uniquePages = new Set();
      pageVisits.forEach(visit => {
        if (visit.details && visit.details.pathname) {
          uniquePages.add(visit.details.pathname);
        }
      });
      
      metrics.pagesVisited = uniquePages.size || Math.min(20, Math.round(metrics.totalActivities / 3));
      
      return metrics;
    } catch (error) {
      console.error('Error getting user activity metrics:', error);
      return {};
    }
  },

  /**
   * Get team activity summary for multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {string} [timeframe='week'] - Timeframe for the summary ('day', 'week', 'month')
   * @returns {Promise<Array>} - Array of user activity summaries
   */
  async getTeamActivitySummary(userIds, timeframe = 'week') {
    try {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        console.warn('Invalid userIds provided to getTeamActivitySummary');
        return [];
      }

      // Get metrics for each user
      const userMetricsPromises = userIds.map(userId => 
        this.getUserActivityMetrics(userId, timeframe)
      );

      const userMetrics = await Promise.all(userMetricsPromises);

      // Combine with user IDs
      return userIds.map((userId, index) => ({
        userId,
        metrics: userMetrics[index] || {}
      }));
    } catch (error) {
      console.error('Error getting team activity summary:', error);
      return [];
    }
  }
}; 