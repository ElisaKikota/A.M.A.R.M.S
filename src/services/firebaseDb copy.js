// src/services/firebaseDb.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

async function deleteProjectAndRelatedData(projectId) {
  const batch = writeBatch(db);

  // Delete the project document
  const projectRef = doc(db, 'projects', projectId);
  batch.delete(projectRef);

  // Delete related milestones
  const milestonesRef = collection(db, 'milestones');
  const milestonesQuery = query(milestonesRef, where('projectId', '==', projectId));
  const milestonesDocs = await getDocs(milestonesQuery);
  milestonesDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete related KPIs
  const kpisRef = collection(db, 'kpis');
  const kpisQuery = query(kpisRef, where('projectId', '==', projectId));
  const kpisDocs = await getDocs(kpisQuery);
  kpisDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete related documents references
  const documentsRef = collection(db, 'documents');
  const documentsQuery = query(documentsRef, where('projectId', '==', projectId));
  const documentsDocs = await getDocs(documentsQuery);
  documentsDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Execute the batch
  await batch.commit();
}

async function getProjectTasks(projectId) {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting project tasks:', error);
    throw error;
  }
}

export const firebaseDb = {
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
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        milestones: doc.data().milestones || [], // Ensure milestones exist
        team: doc.data().team || [], // Ensure team exists
        resources: doc.data().resources || [] // Ensure resources exist
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to load projects');
    }
  },

  async getProject(projectId) {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  },

  async createProject(projectData) {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, projectData);
    return {
      id: docRef.id,
      ...projectData
    };
  },

  async updateProject(projectId, updates) {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, updates);
    return {
      id: projectId,
      ...updates
    };
  },

  async deleteProject(projectId) {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
    return projectId;
  },

  // Team Members
  async getTeamMembers(userId) {
    const teamRef = collection(db, 'team');
    const q = query(teamRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addTeamMember(memberData) {
    const teamRef = collection(db, 'team');
    const docRef = await addDoc(teamRef, memberData);
    return {
      id: docRef.id,
      ...memberData
    };
  },

  // Resources
  async getResources(userId) {
    const resourcesRef = collection(db, 'resources');
    const q = query(resourcesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // KPIs
  async getProjectKPIs(projectId) {
    const kpisRef = collection(db, 'kpis');
    const q = query(kpisRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addKPI(kpiData) {
    const kpisRef = collection(db, 'kpis');
    const docRef = await addDoc(kpisRef, kpiData);
    return {
      id: docRef.id,
      ...kpiData
    };
  },

  async deleteProject(projectId) {
    try {
      await deleteProjectAndRelatedData(projectId);
      return projectId;
    } catch (error) {
      console.error('Error deleting project and related data:', error);
      throw error;
    }
  },

  // Team Members
  async getTeamMembers(userId) {
    const teamRef = collection(db, 'team');
    const q = query(teamRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addTeamMember(memberData) {
    const teamRef = collection(db, 'team');
    const docRef = await addDoc(teamRef, memberData);
    return {
      id: docRef.id,
      ...memberData
    };
  },

  async updateTeamMember(memberId, updates) {
    const docRef = doc(db, 'team', memberId);
    await updateDoc(docRef, updates);
    return {
      id: memberId,
      ...updates
    };
  },

  async deleteTeamMember(memberId) {
    const docRef = doc(db, 'team', memberId);
    await deleteDoc(docRef);
    return memberId;
  },

  
};