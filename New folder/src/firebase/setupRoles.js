// src/firebase/setupRoles.js
// Use this script to set up the initial roles in your Firebase database

import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Default roles with descriptions and initial permissions
const defaultRoles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: {
      // All permissions set to true by default for admin
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      'projects.view': true,
      'projects.create': true,
      'projects.edit': true,
      'projects.delete': true,
      'team.view': true,
      'team.addMember': true,
      'team.editMember': true,
      'team.removeMember': true,
      'team.assignTasks': true,
      'resources.view': true,
      'resources.addHardware': true,
      'resources.addSoftware': true,
      'resources.book': true,
      'resources.editQuantity': true,
      'training.view': true,
      'training.createMaterial': true,
      'training.createTask': true,
      'training.submitResponse': true,
      'training.viewSubmissions': true,
      'reports.view': true,
      'reports.export': true,
      'tasks.view': true,
      'tasks.create': true,
      'tasks.complete': true,
      'tasks.viewAll': true,
      'calendar.view': true,
      'calendar.create': true,
      'calendar.edit': true,
      'calendar.delete': true,
      'admin.approveMembers': true,
      'admin.managePermissions': true,
      'admin.viewSystemLogs': true
    }
  },
  {
    id: 'hod',
    name: 'Head of Department',
    description: 'Department-level oversight and management',
    isSystem: true,
    permissions: {
      // Dashboard permissions
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      
      // Projects permissions
      'projects.view': true,
      'projects.create': true,
      'projects.edit': true,
      'projects.delete': true,
      
      // Team permissions
      'team.view': true,
      'team.addMember': true,
      'team.editMember': true,
      'team.removeMember': true,
      'team.assignTasks': true,
      
      // Resources permissions
      'resources.view': true,
      'resources.addHardware': true,
      'resources.addSoftware': true,
      'resources.book': true,
      'resources.editQuantity': true,
      
      // Training permissions
      'training.view': true,
      'training.createMaterial': true,
      'training.viewSubmissions': true,
      
      // Reports permissions
      'reports.view': true,
      'reports.export': true,
      
      // Tasks permissions
      'tasks.view': true,
      'tasks.create': true,
      'tasks.viewAll': true,

      // Calendar permissions
      'calendar.view': true,
      'calendar.create': true,
      'calendar.edit': true,
      'calendar.delete': true,
      
      // Admin permissions
      'admin.approveMembers': true,
      'admin.viewSystemLogs': true
    }
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Oversees projects and team activities',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      'projects.view': true,
      'projects.create': true,
      'projects.edit': true,
      'team.view': true,
      'team.addMember': true,
      'team.editMember': true,
      'team.assignTasks': true,
      'resources.view': true,
      'resources.book': true,
      'training.view': true,
      'training.viewSubmissions': true,
      'reports.view': true,
      'reports.export': true,
      'tasks.view': true,
      'tasks.create': true,
      'tasks.viewAll': true,
      'calendar.view': true,
      'calendar.create': true,
      'calendar.edit': true,
      'admin.approveMembers': true
    }
  },
  {
    id: 'pr',
    name: 'PR',
    description: 'Manages public relations and communications',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'projects.view': true,
      'team.view': true,
      'resources.view': true,
      'resources.book': true,
      'reports.view': true,
      'tasks.view': true,
      'tasks.complete': true,
      'calendar.view': true,
      'calendar.create': true
    }
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Handles marketing strategies and campaigns',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'projects.view': true,
      'team.view': true,
      'resources.view': true,
      'resources.book': true,
      'reports.view': true,
      'tasks.view': true,
      'tasks.complete': true,
      'calendar.view': true,
      'calendar.create': true
    }
  },
  {
    id: 'resource_manager',
    name: 'Resource Manager',
    description: 'Manages hardware, software and venue resources',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'resources.view': true,
      'resources.addHardware': true,
      'resources.addSoftware': true,
      'resources.book': true,
      'resources.editQuantity': true,
      'reports.view': true,
      'tasks.view': true,
      'tasks.complete': true,
      'calendar.view': true,
      'calendar.create': true
    }
  },
  {
    id: 'graphics',
    name: 'Graphics',
    description: 'Handles design and visual content creation',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'projects.view': true,
      'resources.view': true,
      'resources.book': true,
      'tasks.view': true,
      'tasks.complete': true,
      'calendar.view': true,
      'calendar.create': true
    }
  },
  {
    id: 'leader',
    name: 'Leader',
    description: 'Team leader with project management responsibilities',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      'projects.view': true,
      'projects.create': true,
      'projects.edit': true,
      'team.view': true,
      'team.assignTasks': true,
      'resources.view': true,
      'resources.book': true,
      'reports.view': true,
      'tasks.view': true,
      'tasks.create': true,
      'tasks.viewAll': true,
      'calendar.view': true,
      'calendar.create': true,
      'calendar.edit': true
    }
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Handles system development and maintenance',
    isSystem: true,
    permissions: {
      'dashboard.view': true,
      'dashboard.viewMetrics': true,
      'projects.view': true,
      'projects.create': true,
      'projects.edit': true,
      'team.view': true,
      'resources.view': true,
      'resources.book': true,
      'reports.view': true,
      'tasks.view': true,
      'tasks.create': true,
      'tasks.complete': true,
      'calendar.view': true,
      'calendar.create': true,
      'admin.viewSystemLogs': true
    }
  }
];

// Set up all roles in Firestore
export const setupRoles = async () => {
  try {
    const rolesCollection = collection(db, 'roles');
    
    for (const role of defaultRoles) {
      const roleRef = doc(rolesCollection, role.id);
      
      // Check if role already exists
      const existingRole = await getDoc(roleRef);
      
      if (!existingRole.exists()) {
        // Add timestamp
        const roleData = {
          ...role,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(roleRef, roleData);
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }
    
    console.log('Role setup complete!');
  } catch (error) {
    console.error('Error setting up roles:', error);
  }
};

// Function to update existing user's role in the system
export const updateUserRole = async (userId, roleId) => {
  try {
    // Validate the role exists
    const roleRef = doc(db, 'roles', roleId);
    const roleDoc = await getDoc(roleRef);
    
    if (!roleDoc.exists()) {
      throw new Error(`Role ${roleId} does not exist`);
    }
    
    // Update user's role
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role: roleId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Updated user ${userId} to role: ${roleId}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};