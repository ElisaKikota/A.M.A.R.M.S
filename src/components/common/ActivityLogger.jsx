import React, { useEffect } from 'react';
import { useActivityLog } from '../../contexts/ActivityLogContext';

/**
 * ActivityLogger - A component that automatically logs user activity
 * This should be placed in components where we want to track specific user actions
 * 
 * @param {Object} props
 * @param {string} props.activityType - The type of activity from ACTIVITY_TYPES
 * @param {Object} props.details - Additional details about the activity
 * @param {string} [props.projectId] - Optional project ID related to the activity
 * @param {boolean} [props.logOnMount=true] - Whether to log the activity when the component mounts
 * @param {boolean} [props.logOnUnmount=false] - Whether to log the activity when the component unmounts
 * @param {boolean} [props.logOnTrigger=false] - Whether to log the activity when trigger changes
 * @param {any} props.trigger - Value that triggers logging when changed
 */
const ActivityLogger = ({
  activityType,
  details,
  projectId = null,
  logOnMount = true,
  logOnUnmount = false,
  logOnTrigger = false,
  trigger,
  children
}) => {
  const { logActivity, ACTIVITY_TYPES } = useActivityLog();

  // Log activity on component mount
  useEffect(() => {
    if (logOnMount && activityType) {
      logActivity(activityType, details, projectId);
    }

    // Log activity on component unmount
    return () => {
      if (logOnUnmount && activityType) {
        logActivity(activityType, details, projectId);
      }
    };
  }, [logOnMount, logOnUnmount, activityType, details, projectId, logActivity]);

  // Log activity when trigger changes
  useEffect(() => {
    if (logOnTrigger && activityType) {
      logActivity(activityType, details, projectId);
    }
  }, [logOnTrigger, trigger, activityType, details, projectId, logActivity]);

  // This is a utility component, it doesn't render anything itself
  return children || null;
};

export default ActivityLogger; 