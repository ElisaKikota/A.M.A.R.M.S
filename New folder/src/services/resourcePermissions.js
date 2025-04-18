// src/services/resourcePermissions.js

export const RESOURCE_PERMISSIONS = {
    ADMIN: 'Administrator',
    SUPERVISOR: 'Supervisor',
    COMMUNITY_MEMBER: 'Community Member',
    PROJECT_MEMBER: 'Project Member',
    INSTRUCTOR: 'Instructor',
    RESOURCE_MANAGER: 'Resource Manager',
    DEVELOPER: 'Developer'
  };
  
  export const resourcePermissions = {
    canView: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.COMMUNITY_MEMBER,
        RESOURCE_PERMISSIONS.PROJECT_MEMBER,
        RESOURCE_PERMISSIONS.INSTRUCTOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER,
        RESOURCE_PERMISSIONS.DEVELOPER
      ].includes(userRole);
    },
  
    canAddHardware: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canAddSoftware: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    },
  
    canBookVenue: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.COMMUNITY_MEMBER,
        RESOURCE_PERMISSIONS.PROJECT_MEMBER,
        RESOURCE_PERMISSIONS.INSTRUCTOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER,
        RESOURCE_PERMISSIONS.DEVELOPER
      ].includes(userRole);
    },
  
    canViewHistory: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER,
        RESOURCE_PERMISSIONS.DEVELOPER
      ].includes(userRole);
    },
  
    canBorrow: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.SUPERVISOR,
        RESOURCE_PERMISSIONS.COMMUNITY_MEMBER,
        RESOURCE_PERMISSIONS.PROJECT_MEMBER,
        RESOURCE_PERMISSIONS.INSTRUCTOR,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER,
        RESOURCE_PERMISSIONS.DEVELOPER
      ].includes(userRole);
    },
  
    canEditQuantity: (userRole) => {
      return [
        RESOURCE_PERMISSIONS.ADMIN,
        RESOURCE_PERMISSIONS.RESOURCE_MANAGER
      ].includes(userRole);
    }
  };