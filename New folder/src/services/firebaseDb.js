// src/services/firebaseDb.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where, 
  updateDoc,
  addDoc,
  deleteDoc,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db } from '../firebase/config';
// Import storage from storageConfig instead of config
import { storage } from '../firebase/storageConfig';

export const firebaseDb = {
  async syncProjectTeamMembers(project) {
    if (!project.team || project.team.length === 0) return project;
    
    try {
      // Get current user statuses
      const teamIds = project.team.map(member => member.id);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', teamIds));
      const snapshot = await getDocs(q);
      
      const activeUserIds = new Set();
      snapshot.docs.forEach(doc => {
        if (['active', 'onLeave'].includes(doc.data().status)) {
          activeUserIds.add(doc.id);
        }
      });
      
      // Update team status
      const updatedTeam = project.team.map(member => ({
        ...member,
        status: activeUserIds.has(member.id) ? 'active' : 'inactive'
      }));
      
      // If the team has changed, update the project in the database
      if (JSON.stringify(project.team) !== JSON.stringify(updatedTeam)) {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, { team: updatedTeam });
      }
      
      return { ...project, team: updatedTeam };
    } catch (error) {
      console.error('Error syncing project team members:', error);
      return project;
    }
  },

  // Projects
  async getProjects(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getProjects');
        return [];
      }
  
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      // Get basic project data
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        team: doc.data().team || [],
        resources: doc.data().resources || []
      }));
      
      // Load milestones for each project
      const projectsWithMilestones = await Promise.all(
        projectsData.map(async (project) => {
          const milestones = await this.getProjectMilestones(project.id);
          return {
            ...project,
            milestones
          };
        })
      );
      
      // Sync team members for each project
      const syncedProjects = await Promise.all(
        projectsWithMilestones.map(project => this.syncProjectTeamMembers(project))
      );
      
      return syncedProjects;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to load projects');
    }
  },

  // Get projects where user is a team member
  async getProjectsWhereUserIsMember(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getProjectsWhereUserIsMember');
        return [];
      }

      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      
      // Filter projects where the user is a team member
      const projects = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          milestones: doc.data().milestones || [],
          team: doc.data().team || [],
          resources: doc.data().resources || []
        }))
        .filter(project => 
          // Check if user is in the team array
          project.team && project.team.some(member => member.id === userId)
        );

      // Sync team members for each project
      const syncedProjects = await Promise.all(
        projects.map(project => this.syncProjectTeamMembers(project))
      );
      
      return syncedProjects;
    } catch (error) {
      console.error('Error getting projects where user is a member:', error);
      throw new Error('Failed to load projects where user is a member');
    }
  },

  // Get all projects for a user (both owned and member of)
  async getAllUserProjects(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getAllUserProjects');
        return [];
      }

      // Get projects owned by the user
      const ownedProjects = await this.getProjects(userId);
      
      // Get projects where user is a team member
      const memberProjects = await this.getProjectsWhereUserIsMember(userId);
      
      // Combine and deduplicate projects (in case user is both owner and member)
      const allProjects = [...ownedProjects];
      
      // Add member projects if they're not already in the list
      memberProjects.forEach(memberProject => {
        if (!allProjects.some(project => project.id === memberProject.id)) {
          allProjects.push(memberProject);
        }
      });
      
      return allProjects;
    } catch (error) {
      console.error('Error getting all user projects:', error);
      throw new Error('Failed to load all user projects');
    }
  },

  async createProject(projectData) {
    try {
      // Extract milestones from project data
      const { milestones = [], ...projectWithoutMilestones } = projectData;
      
      // Create the project document first
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        ...projectWithoutMilestones,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Create milestones in the subcollection if any exist
      if (milestones.length > 0) {
        const milestonesRef = collection(db, 'projects', docRef.id, 'milestones');
        await Promise.all(
          milestones.map(milestone => 
            addDoc(milestonesRef, {
              ...milestone,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: milestone.status || 'pending',
              progress: milestone.progress || 0
            })
          )
        );
      }

      // Return the created project with its ID
      return {
        id: docRef.id,
        ...projectWithoutMilestones,
        milestones: [] // Return empty array since milestones are now in subcollection
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  },

  async updateProject(projectId, data) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async deleteProject(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to deleteProject');
        throw new Error('Project ID is required');
      }

      // 1. Delete all documents and their associated files in storage
      const documentsRef = collection(db, 'projects', projectId, 'documents');
      const documentsSnapshot = await getDocs(documentsRef);
      
      // Delete each document and its file if it exists
      const documentDeletions = documentsSnapshot.docs.map(async (doc) => {
        const documentData = doc.data();
        
        // If the document has a file, delete it from storage
        if (documentData.type === 'file' && documentData.filePath) {
          try {
            const storageRef = ref(storage, documentData.filePath);
            await deleteObject(storageRef);
          } catch (error) {
            console.error(`Error deleting file for document ${doc.id}:`, error);
            // Continue with deletion even if file deletion fails
          }
        }
        
        // Delete the document from Firestore
        await deleteDoc(doc.ref);
      });
      
      await Promise.all(documentDeletions);
      
      // 2. Delete all tasks
      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      const taskDeletions = tasksSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      await Promise.all(taskDeletions);
      
      // 3. Delete all milestones
      const milestonesRef = collection(db, 'projects', projectId, 'milestones');
      const milestonesSnapshot = await getDocs(milestonesRef);
      
      const milestoneDeletions = milestonesSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      await Promise.all(milestoneDeletions);
      
      // 4. Delete all activities
      const activitiesRef = collection(db, 'projects', projectId, 'activities');
      const activitiesSnapshot = await getDocs(activitiesRef);
      
      const activityDeletions = activitiesSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      await Promise.all(activityDeletions);
      
      // 5. Delete all team members
      const teamRef = collection(db, 'projects', projectId, 'team');
      const teamSnapshot = await getDocs(teamRef);
      
      const teamDeletions = teamSnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      await Promise.all(teamDeletions);
      
      // 6. Delete any remaining files in storage
      try {
        const storageRef = ref(storage, `projects/${projectId}`);
        const storageItems = await listAll(storageRef);
        
        // Delete all items in the project storage folder
        const storageDeletions = [
          ...storageItems.items.map(item => deleteObject(item)),
          ...storageItems.prefixes.map(async (prefix) => {
            const prefixItems = await listAll(prefix);
            return Promise.all([
              ...prefixItems.items.map(item => deleteObject(item)),
              ...prefixItems.prefixes.map(async (nestedPrefix) => {
                const nestedItems = await listAll(nestedPrefix);
                return Promise.all(nestedItems.items.map(item => deleteObject(item)));
              })
            ]);
          })
        ];
        
        await Promise.all(storageDeletions);
      } catch (error) {
        console.error('Error deleting project files from storage:', error);
        // Continue with project deletion even if storage deletion fails
      }
      
      // 7. Finally, delete the project document itself
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      
      console.log(`Project ${projectId} and all related data successfully deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project and its related data');
    }
  },

  // Team Members
  async getTeamMembers(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getTeamMembers');
        return [];
      }

      // Get the project document to get the team member IDs
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        console.warn('Project not found');
        return [];
      }

      const projectData = projectDoc.data();
      const teamIds = projectData.team?.map(member => member.id) || [];

      if (teamIds.length === 0) {
        return [];
      }

      // Get the user documents for each team member
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', teamIds));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        role: doc.data().role,
        email: doc.data().email,
        status: doc.data().status || 'active'
      }));
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  },

  // Resources
  async getResources(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getResources');
        return [];
      }

      const resourcesRef = collection(db, 'resources');
      const q = query(resourcesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const resources = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        utilization: doc.data().utilization || 0,
        bookings: doc.data().bookings || []
      }));
      
      return resources;
    } catch (error) {
      console.error('Error getting resources:', error);
      throw new Error('Failed to load resources');
    }
  },

  // Helper function to check if user is admin
  async isUserAdmin(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Tasks
  async getProjectTasks(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectTasks');
        return [];
      }

      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting project tasks:', error);
      throw new Error('Failed to load tasks');
    }
  },

  // Get all tasks assigned to a user across all projects
  async getUserTasks(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getUserTasks');
        return [];
      }

      console.log('Fetching tasks for user:', userId);

      // First, get all projects
      const projectsRef = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      console.log('Found projects:', projectsSnapshot.docs.length);
      
      // For each project, get tasks assigned to the user
      const userTasks = [];
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectId = projectDoc.id;
        const projectData = projectDoc.data();
        
        // Get milestones from both project data and subcollection
        const milestoneMap = {};
        
        // 1. Check for milestones array in project data (legacy format)
        if (projectData.milestones && Array.isArray(projectData.milestones)) {
          projectData.milestones.forEach(milestone => {
            if (milestone && milestone.id) {
              milestoneMap[milestone.id] = milestone.title || milestone.name || 'Unknown';
            }
          });
        }
        
        // 2. Get milestones from subcollection (new format)
        try {
          const milestonesRef = collection(db, 'projects', projectId, 'milestones');
          const milestonesSnapshot = await getDocs(milestonesRef);
          
          milestonesSnapshot.docs.forEach(doc => {
            const milestone = doc.data();
            milestoneMap[doc.id] = milestone.title || milestone.name || 'Unknown';
          });
        } catch (error) {
          console.log(`Error fetching milestones for project ${projectId}:`, error);
          // Continue execution even if milestone fetching fails
        }
        
        console.log(`Project ${projectId} has ${Object.keys(milestoneMap).length} milestones`);
        
        // Get all tasks for this project
        const tasksRef = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        console.log(`Project ${projectId} has ${tasksSnapshot.docs.length} tasks`);
        
        // Process all tasks for this project
        const projectTasks = tasksSnapshot.docs.map(doc => {
          const taskData = doc.data();
          
          // Add milestone name if the task has a milestoneId
          let milestoneName = 'Unknown';
          if (taskData.milestoneId && milestoneMap[taskData.milestoneId]) {
            milestoneName = milestoneMap[taskData.milestoneId];
          } else if (taskData.milestone && typeof taskData.milestone === 'object') {
            // Some tasks might have milestone object directly
            milestoneName = taskData.milestone.title || taskData.milestone.name || 'Unknown';
          }
            
          // Make sure evidence is always an array
          const evidence = taskData.evidence || [];
            
          return {
            id: doc.id,
            ...taskData,
            projectId, // Add projectId to each task
            projectName: projectData.name || 'Unnamed Project', // Add project name for display
            milestoneName, // Add milestone name if available
            evidence // Ensure evidence is included
          };
        });

        // Filter tasks assigned to the user
        const userProjectTasks = projectTasks.filter(task => {
          console.log(`Checking task ${task.id} for user ${userId}`);
          
          // For debugging, log the assignee structure
          if (task.assignee) {
            console.log(`Task ${task.id} assignee:`, JSON.stringify(task.assignee));
          }
          if (task.assignees) {
            console.log(`Task ${task.id} assignees:`, JSON.stringify(task.assignees));
          }
          
          // 1. Legacy format: assignedTo field (string)
          if (task.assignedTo === userId) {
            console.log(`Match found: legacy assignedTo field`);
            return true;
          }
          
          // 2. Single assignee object with id field
          if (task.assignee && !Array.isArray(task.assignee) && 
              typeof task.assignee === 'object' && task.assignee.id === userId) {
            console.log(`Match found: assignee.id field`);
            return true;
          }
          
          // 3. Array of assignee objects
          if (Array.isArray(task.assignee)) {
            const found = task.assignee.some(person => 
              (typeof person === 'object' && person.id === userId) || 
              (typeof person === 'string' && person === userId)
            );
            if (found) {
              console.log(`Match found: assignee array`);
              return true;
            }
          }
          
          // 4. Array of assignees (plural form)
          if (Array.isArray(task.assignees)) {
            const found = task.assignees.some(person => 
              (typeof person === 'object' && person.id === userId) || 
              (typeof person === 'string' && person === userId)
            );
            if (found) {
              console.log(`Match found: assignees array (plural)`);
              return true;
            }
          }
          
          // 5. Object with userIds as keys: { userId1: {}, userId2: {} }
          if (task.assignee && typeof task.assignee === 'object' && 
              !Array.isArray(task.assignee) && userId in task.assignee) {
            console.log(`Match found: assignee object with userIds as keys`);
            return true;
          }
          
          // 6. Object with userIds as keys (plural form)
          if (task.assignees && typeof task.assignees === 'object' && 
              !Array.isArray(task.assignees) && userId in task.assignees) {
            console.log(`Match found: assignees object with userIds as keys`);
            return true;
          }
          
          // 7. Check team array
          if (task.team && Array.isArray(task.team)) {
            const found = task.team.some(member => 
              (typeof member === 'object' && member.id === userId) || 
              (typeof member === 'string' && member === userId)
            );
            if (found) {
              console.log(`Match found: team array`);
              return true;
            }
          }

          // Not assigned to this user
          return false;
        });
        
        console.log(`Found ${userProjectTasks.length} tasks assigned to user in project ${projectId}`);
        userTasks.push(...userProjectTasks);
      }
      
      console.log(`Total tasks found for user: ${userTasks.length}`);
      
      // Sort tasks by due date (if available) or creation date
      return userTasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (a.dueDate) {
          return -1; // a has dueDate, b doesn't
        } else if (b.dueDate) {
          return 1; // b has dueDate, a doesn't
        }
        // Fall back to creation date
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw new Error('Failed to load user tasks');
    }
  },

  async createTask(projectId, taskData) {
    try {
      // Use the client-provided ID instead of letting Firestore generate one
      const taskId = taskData.id || Date.now().toString();
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      
      await setDoc(taskRef, {
        ...taskData,
        id: taskId, // Ensure the ID is included in the document
        milestoneId: taskData.milestoneId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: taskId,
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        createdAt: taskData.createdAt || new Date().toISOString(),
        updatedAt: taskData.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },

  async updateTask(projectId, taskId, taskData) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      
      // Check if the document exists first
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        console.error(`Task document does not exist: projects/${projectId}/tasks/${taskId}`);
        throw new Error('Task document does not exist');
      }
      
      await updateDoc(taskRef, {
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: taskId,
        ...taskData,
        milestoneId: taskData.milestoneId || null,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error; // Propagate the original error
    }
  },

  async deleteTask(projectId, taskId) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },

  async updateTaskStatus(projectId, taskId, newStatus) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  // Project Activities
  async addProjectActivity(projectId, activityData) {
    try {
      const activitiesRef = collection(db, 'projects', projectId, 'activities');
      const docRef = await addDoc(activitiesRef, {
        ...activityData,
        createdAt: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        ...activityData,
        createdAt: activityData.createdAt
      };
    } catch (error) {
      console.error('Error adding project activity:', error);
      throw new Error('Failed to add project activity');
    }
  },

  async getProjectActivities(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectActivities');
        return [];
      }

      const activitiesRef = collection(db, 'projects', projectId, 'activities');
      const q = query(activitiesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting project activities:', error);
      throw new Error('Failed to load project activities');
    }
  },

  // Project Documents
  async getProjectDocuments(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectDocuments');
        return [];
      }
      
      const documentsRef = collection(db, 'projects', projectId, 'documents');
      const q = query(documentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting project documents:', error);
      return [];
    }
  },

  async addProjectDocument(projectId, documentData, file = null) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to addProjectDocument');
        throw new Error('Project ID is required');
      }

      let fileUrl = null;
      let fileMetadata = {};

      // If a file is provided, try to upload it to Firebase Storage
      if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size exceeds 5MB limit');
        }

        try {
          // Create a reference to the file in Firebase Storage
          // Use the same path structure as in the Resources page
          const storageRef = ref(storage, `projects/${projectId}/documents/${Date.now()}_${file.name}`);
          
          // Upload the file
          await uploadBytes(storageRef, file);
          
          // Get the download URL
          fileUrl = await getDownloadURL(storageRef);
          
          // Set file metadata
          fileMetadata = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: storageRef.fullPath,
            fileUrl: fileUrl
          };
        } catch (error) {
          console.error('Error uploading file to Firebase Storage:', error);
          
          // If there's a CORS error, create a document entry without the actual file
          if (error.message && (error.message.includes('CORS') || error.message.includes('network error'))) {
            // Create a placeholder for the file
            fileMetadata = {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              uploadError: 'CORS error: Unable to upload file to storage. Firebase Storage CORS settings need to be configured.'
            };
          } else {
            throw error;
          }
        }
      }

      // Create document data
      const newDocumentData = {
        ...documentData,
        ...fileMetadata,
        type: file ? 'file' : 'link',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add document to Firestore
      const documentsRef = collection(db, 'projects', projectId, 'documents');
      const docRef = await addDoc(documentsRef, newDocumentData);
      
      return {
        id: docRef.id,
        ...newDocumentData
      };
    } catch (error) {
      console.error('Error adding project document:', error);
      throw new Error('Failed to add project document: ' + error.message);
    }
  },

  async deleteProjectDocument(projectId, documentId) {
    try {
      if (!projectId || !documentId) {
        console.warn('Project ID and Document ID are required');
        throw new Error('Project ID and Document ID are required');
      }

      // Get the document to check if it has a file
      const documentRef = doc(db, 'projects', projectId, 'documents', documentId);
      const documentSnap = await getDoc(documentRef);
      
      if (documentSnap.exists()) {
        const documentData = documentSnap.data();
        
        // If the document has a file, delete it from storage
        if (documentData.type === 'file' && documentData.filePath) {
          try {
            const storageRef = ref(storage, documentData.filePath);
            await deleteObject(storageRef);
          } catch (error) {
            console.error('Error deleting file from storage:', error);
            // Continue with document deletion even if file deletion fails
          }
        }
      }

      // Delete the document from Firestore
      await deleteDoc(documentRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting project document:', error);
      throw new Error('Failed to delete project document');
    }
  },

  // Milestones
  async getProjectMilestones(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectMilestones');
        return [];
      }
      
      // First, get any milestones embedded in the project document
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        console.warn(`Project ${projectId} not found`);
        return [];
      }
      
      // Get embedded milestones (older format)
      const embeddedMilestones = projectDoc.data().milestones || [];
      
      // Try to get milestones from subcollection (newer format)
      const milestonesRef = collection(db, 'projects', projectId, 'milestones');
      const milestonesSnapshot = await getDocs(milestonesRef);
      const subcollectionMilestones = milestonesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Combine and deduplicate milestones (prefer subcollection if same ID exists in both)
      const allMilestones = [...embeddedMilestones];
      
      // Add subcollection milestones if they're not already in the list
      subcollectionMilestones.forEach(subcollectionMilestone => {
        if (!allMilestones.some(m => m.id === subcollectionMilestone.id)) {
          allMilestones.push(subcollectionMilestone);
        }
      });
      
      console.log(`Retrieved ${allMilestones.length} milestones for project ${projectId}`);
      
      return allMilestones;
    } catch (error) {
      console.error('Error getting project milestones:', error);
      return [];
    }
  },

  async createMilestone(projectId, milestoneData) {
    try {
      const milestoneRef = doc(collection(db, 'projects', projectId, 'milestones'));
      const milestone = {
        ...milestoneData,
        id: milestoneRef.id,
      };
      await setDoc(milestoneRef, milestone);
      return milestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  },

  async updateMilestone(projectId, milestoneId, milestoneData) {
    try {
      const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
      await updateDoc(milestoneRef, {
        ...milestoneData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: milestoneId,
        ...milestoneData,
        updatedAt: milestoneData.updatedAt
      };
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw new Error('Failed to update milestone');
    }
  },

  async deleteMilestone(projectId, milestoneId) {
    try {
      const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
      await deleteDoc(milestoneRef);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw new Error('Failed to delete milestone');
    }
  },

  // Get tasks for a specific milestone
  async getMilestoneTasks(projectId, milestoneId) {
    try {
      if (!projectId || !milestoneId) {
        console.warn('Missing projectId or milestoneId for getMilestoneTasks');
        return [];
      }

      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      // Temporarily remove the orderBy to avoid requiring the index
      const q = query(
        tasksRef,
        where('milestoneId', '==', milestoneId)
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort the tasks in memory instead
      return tasks.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } catch (error) {
      console.error('Error getting milestone tasks:', error);
      if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
        const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)[0];
        console.log('Please create the required index by visiting:', indexUrl);
      }
      throw error;
    }
  },

  // Update milestone progress based on task completion
  async updateMilestoneProgress(projectId, milestoneId) {
    try {
      // Get all tasks for this project
      const allTasks = await this.getProjectTasks(projectId);
      
      // Filter tasks for this milestone
      const tasks = allTasks.filter(task => task.milestoneId === milestoneId);
      
      if (tasks.length === 0) {
        return 0; // No tasks, so progress is 0%
      }
      
      // Calculate progress based on task status
      // A task is considered complete if its status is 'done'
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const progress = Math.round((completedTasks / tasks.length) * 100);
      
      // Check if milestone is in subcollection or in project document
      const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
      const milestoneDoc = await getDoc(milestoneRef);
      
      if (milestoneDoc.exists()) {
        // Update milestone in subcollection
        await updateDoc(milestoneRef, { 
          progress,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Milestone might be in the project document
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          
          if (projectData.milestones && projectData.milestones.length > 0) {
            // Find the milestone in the project document
            const updatedMilestones = projectData.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return { ...milestone, progress };
              }
              return milestone;
            });
            
            // Update the project document with the updated milestones
            await updateDoc(projectRef, { 
              milestones: updatedMilestones,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
      
      // After updating milestone progress, update project progress
      await this.updateProjectProgress(projectId);
      
      return progress;
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      throw new Error('Failed to update milestone progress');
    }
  },

  // Calculate and update project progress based on task completion
  async updateProjectProgress(projectId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      // Always calculate progress based on tasks directly
      const tasks = await this.getProjectTasks(projectId);
      
      if (tasks.length === 0) {
        // No tasks, so progress is 0%
        await updateDoc(projectRef, { 
          progress: 0,
          updatedAt: new Date().toISOString()
        });
        return 0;
      }
      
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const progress = Math.round((completedTasks / tasks.length) * 100);
      
      await updateDoc(projectRef, { 
        progress,
        updatedAt: new Date().toISOString()
      });
      
      return progress;
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw new Error('Failed to update project progress');
    }
  },

  // Get all projects from the database (for admin and supervisor users)
  async getAllProjects() {
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        milestones: doc.data().milestones || [],
        team: doc.data().team || [],
        resources: doc.data().resources || []
      }));

      // Sync team members for each project
      const syncedProjects = await Promise.all(
        projects.map(project => this.syncProjectTeamMembers(project))
      );
      
      return syncedProjects;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw new Error('Failed to load all projects');
    }
  },

  // Task Evidence
  async addTaskEvidence(projectId, taskId, evidenceId) {
    try {
      if (!projectId || !taskId || !evidenceId) {
        console.warn('Project ID, Task ID, and Evidence ID are required');
        throw new Error('Project ID, Task ID, and Evidence ID are required');
      }

      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }
      
      const taskData = taskDoc.data();
      const evidence = taskData.evidence || [];
      
      // Check if evidence already exists
      if (evidence.includes(evidenceId)) {
        return taskData;
      }
      
      // Add evidence to task
      const updatedEvidence = [...evidence, evidenceId];
      
      await updateDoc(taskRef, {
        evidence: updatedEvidence,
        updatedAt: new Date().toISOString()
      });
      
      return {
        ...taskData,
        evidence: updatedEvidence,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding task evidence:', error);
      throw new Error('Failed to add task evidence');
    }
  },

  async removeTaskEvidence(projectId, taskId, evidenceId) {
    try {
      if (!projectId || !taskId || !evidenceId) {
        console.warn('Project ID, Task ID, and Evidence ID are required');
        throw new Error('Project ID, Task ID, and Evidence ID are required');
      }

      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }
      
      const taskData = taskDoc.data();
      const evidence = taskData.evidence || [];
      
      // Remove evidence from task
      const updatedEvidence = evidence.filter(id => id !== evidenceId);
      
      await updateDoc(taskRef, {
        evidence: updatedEvidence,
        updatedAt: new Date().toISOString()
      });
      
      return {
        ...taskData,
        evidence: updatedEvidence,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error removing task evidence:', error);
      throw new Error('Failed to remove task evidence');
    }
  },

  async getTaskEvidence(projectId, taskId) {
    try {
      if (!projectId || !taskId) {
        console.warn('Project ID and Task ID are required');
        throw new Error('Project ID and Task ID are required');
      }

      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }
      
      const taskData = taskDoc.data();
      const evidenceIds = taskData.evidence || [];
      
      if (evidenceIds.length === 0) {
        return [];
      }
      
      // Get all documents for the project
      const documents = await this.getProjectDocuments(projectId);
      
      // Filter documents that are used as evidence for this task
      return documents.filter(doc => evidenceIds.includes(doc.id));
    } catch (error) {
      console.error('Error getting task evidence:', error);
      throw new Error('Failed to get task evidence');
    }
  },

  async getProjectTeam(projectId) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to getProjectTeam');
        return [];
      }
      
      // Get the project document
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        console.warn(`Project with ID ${projectId} not found`);
        return [];
      }
      
      const projectData = projectSnap.data();
      
      // If the project has a team array
      if (projectData.team && Array.isArray(projectData.team)) {
        // Fetch complete user data for each team member to include skills
        const teamWithSkills = await Promise.all(projectData.team.map(async (member) => {
          // If the member already has skills, return it as is
          if (member.skills) {
            return member;
          }
          
          // Otherwise, try to fetch the user data to get skills
          try {
            const userRef = doc(db, 'users', member.id);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              return {
                ...member,
                skills: userData.skills || []
              };
            }
          } catch (error) {
            console.error(`Error fetching user data for team member ${member.id}:`, error);
          }
          
          // If we couldn't fetch the user data, return the original member
          return member;
        }));
        
        return teamWithSkills;
      }
      
      // Otherwise, check for a team subcollection
      const teamRef = collection(db, 'projects', projectId, 'team');
      const teamSnap = await getDocs(teamRef);
      
      const teamMembers = teamSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch complete user data for each team member
      const teamWithSkills = await Promise.all(teamMembers.map(async (member) => {
        // If the member already has skills, return it as is
        if (member.skills) {
          return member;
        }
        
        // Otherwise, try to fetch the user data to get skills
        try {
          const userRef = doc(db, 'users', member.id);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            return {
              ...member,
              skills: userData.skills || []
            };
          }
        } catch (error) {
          console.error(`Error fetching user data for team member ${member.id}:`, error);
        }
        
        // If we couldn't fetch the user data, return the original member
        return member;
      }));
      
      return teamWithSkills;
    } catch (error) {
      console.error('Error getting project team:', error);
      return [];
    }
  },

  async updateProjectStatus(projectId, status) {
    try {
      if (!projectId) {
        console.warn('No projectId provided to updateProjectStatus');
        throw new Error('Project ID is required');
      }
      
      // Validate status
      const validStatuses = ['planning', 'inProgress', 'onHold', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      // Update the project status
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw new Error('Failed to update project status');
    }
  },

  async getProject(projectId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      return {
        id: projectDoc.id,
        ...projectDoc.data()
      };
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getUserById');
        throw new Error('User ID is required');
      }
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn(`User with ID ${userId} not found`);
        return null;
      }
      
      return {
        id: userId,
        ...userSnap.data()
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to load user data');
    }
  },

  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, `${path}/${file.name}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Task Review Functions
  async getTaskReviews(projectId) {
    try {
      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      const reviews = [];

      for (const taskDoc of tasksSnapshot.docs) {
        const task = taskDoc.data();
        if (task.status === 'review') {
          // Get milestone data
          let milestoneData = null;
          if (task.milestoneId) {
            const milestoneRef = doc(db, 'projects', projectId, 'milestones', task.milestoneId);
            const milestoneSnap = await getDoc(milestoneRef);
            if (milestoneSnap.exists()) {
              milestoneData = {
                id: milestoneSnap.id,
                ...milestoneSnap.data()
              };
            }
          }

          // Get assignees data
          const assigneesData = {};
          if (task.assignees) {
            for (const userId of Object.keys(task.assignees)) {
              const userRef = doc(db, 'users', userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                assigneesData[userId] = {
                  id: userId,
                  name: userSnap.data().name,
                  role: userSnap.data().role
                };
              }
            }
          }

          reviews.push({
            taskId: taskDoc.id,
            taskTitle: task.title,
            taskDescription: task.description,
            milestone: milestoneData,
            assignees: assigneesData,
            attachments: task.attachments || [],
            evidence: task.evidence || [],
            approvals: task.approvals || [],
            changes: task.changes || [],
            status: task.status,
            createdAt: task.createdAt
          });
        }
      }

      return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting task reviews:', error);
      throw error;
    }
  },

  async updateTaskReview(projectId, taskId, reviewData) {
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        approvals: reviewData.approvals || [],
        changes: reviewData.changes || [],
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating task review:', error);
      throw error;
    }
  },

  // Comments
  async getProjectComments(projectId) {
    try {
      const commentsRef = collection(db, 'projects', projectId, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));
    } catch (error) {
      console.error('Error getting project comments:', error);
      throw new Error('Failed to load comments');
    }
  },

  async addProjectComment(projectId, commentData) {
    try {
      const commentsRef = collection(db, 'projects', projectId, 'comments');
      const docRef = await addDoc(commentsRef, {
        ...commentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add an activity entry for the new comment
      await this.addProjectActivity(projectId, {
        type: 'comment',
        action: 'added',
        userId: commentData.authorId,
        userName: commentData.authorName,
        timestamp: new Date(),
        details: {
          commentId: docRef.id,
          content: commentData.content.substring(0, 100) + (commentData.content.length > 100 ? '...' : '')
        }
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding project comment:', error);
      throw new Error('Failed to add comment');
    }
  },

  async updateProjectComment(projectId, commentId, updates, user) {
    try {
      const commentRef = doc(db, 'projects', projectId, 'comments', commentId);
      await updateDoc(commentRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Add an activity entry for the comment update
      await this.addProjectActivity(projectId, {
        type: 'comment',
        action: 'edited',
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: new Date(),
        details: {
          commentId: commentId
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating project comment:', error);
      throw new Error('Failed to update comment');
    }
  },

  async deleteProjectComment(projectId, commentId, user) {
    try {
      const commentRef = doc(db, 'projects', projectId, 'comments', commentId);
      await deleteDoc(commentRef);
      
      // Add an activity entry for the comment deletion
      await this.addProjectActivity(projectId, {
        type: 'comment',
        action: 'deleted',
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: new Date(),
        details: {
          commentId: commentId
        }
      });

      return true;
    } catch (error) {
      console.error('Error deleting project comment:', error);
      throw new Error('Failed to delete comment');
    }
  },

  async toggleCommentLike(projectId, commentId, userId) {
    try {
      const commentRef = doc(db, 'projects', projectId, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      const comment = commentDoc.data();
      const likes = comment.likes || [];
      const userLikeIndex = likes.indexOf(userId);
      
      if (userLikeIndex === -1) {
        likes.push(userId);
      } else {
        likes.splice(userLikeIndex, 1);
      }
      
      await updateDoc(commentRef, { likes });
      return true;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw new Error('Failed to update like');
    }
  },

  async updateProjectPresentable(projectId, presentableData) {
    try {
      // Convert any single file entries to arrays
      const normalizedData = Object.entries(presentableData).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value : (value ? [value] : []);
        return acc;
      }, {});

      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        presentable: normalizedData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating project presentable:', error);
      throw new Error('Failed to update presentable');
    }
  },

  async getProjectPresentable(projectId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const defaultData = {
        finalReport: [],
        onePager: [],
        presentation: [],
        videoDemo: [],
        pitchDeck: [],
        shortVideoDemo: []
      };
      
      const presentableData = projectDoc.data()?.presentable;
      if (!presentableData) return defaultData;

      // Convert any single file entries to arrays
      return Object.entries(presentableData).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value : (value ? [value] : []);
        return acc;
      }, defaultData);
    } catch (error) {
      console.error('Error getting project presentable:', error);
      throw new Error('Failed to get presentable');
    }
  },

  async getBookings(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getBookings');
        return [];
      }

      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return bookings;
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Failed to load bookings');
    }
  },
};