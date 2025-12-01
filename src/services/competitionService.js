import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Competition CRUD operations
export const createCompetition = async (competitionData) => {
  try {
    const competitionsRef = collection(db, 'competitions');
    const docRef = await addDoc(competitionsRef, {
      ...competitionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...competitionData };
  } catch (error) {
    console.error('Error creating competition:', error);
    throw error;
  }
};

export const updateCompetition = async (competitionId, updates) => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    await updateDoc(competitionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: competitionId, ...updates };
  } catch (error) {
    console.error('Error updating competition:', error);
    throw error;
  }
};

export const deleteCompetition = async (competitionId) => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    await deleteDoc(competitionRef);
    return true;
  } catch (error) {
    console.error('Error deleting competition:', error);
    throw error;
  }
};

export const getCompetition = async (competitionId) => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    const docSnap = await getDoc(competitionRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Competition not found');
    }
  } catch (error) {
    console.error('Error getting competition:', error);
    throw error;
  }
};

export const getAllCompetitions = async () => {
  try {
    console.log('Fetching all competitions...');
    const competitionsRef = collection(db, 'competitions');
    const q = query(competitionsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const competitions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Fetched competitions:', competitions);
    return competitions;
  } catch (error) {
    console.error('Error getting competitions:', error);
    throw error;
  }
};

export const getActiveCompetitions = async () => {
  try {
    const competitionsRef = collection(db, 'competitions');
    const q = query(
      competitionsRef, 
      where('status', '==', 'open'),
      orderBy('applicationDeadline', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting active competitions:', error);
    throw error;
  }
};

// Application CRUD operations
export const createApplication = async (applicationData) => {
  try {
    const applicationsRef = collection(db, 'competitionApplications');
    const docRef = await addDoc(applicationsRef, {
      ...applicationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...applicationData };
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

export const updateApplication = async (applicationId, updates) => {
  try {
    const applicationRef = doc(db, 'competitionApplications', applicationId);
    await updateDoc(applicationRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: applicationId, ...updates };
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const getApplication = async (applicationId) => {
  try {
    const applicationRef = doc(db, 'competitionApplications', applicationId);
    const docSnap = await getDoc(applicationRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Application not found');
    }
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
};

export const getApplicationsByCompetition = async (competitionId) => {
  try {
    const applicationsRef = collection(db, 'competitionApplications');
    const q = query(
      applicationsRef,
      where('competitionId', '==', competitionId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications by competition:', error);
    throw error;
  }
};

export const getApplicationsByProject = async (projectId) => {
  try {
    const applicationsRef = collection(db, 'competitionApplications');
    const q = query(
      applicationsRef,
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications by project:', error);
    throw error;
  }
};

export const getAllApplications = async () => {
  try {
    console.log('Fetching all applications...');
    const applicationsRef = collection(db, 'competitionApplications');
    const q = query(applicationsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Fetched applications:', applications);
    return applications;
  } catch (error) {
    console.error('Error getting all applications:', error);
    throw error;
  }
};

// Analytics and metrics
export const getCompetitionMetrics = async () => {
  try {
    console.log('Calculating competition metrics...');
    const applications = await getAllApplications();
    const competitions = await getAllCompetitions();
    
    const totalApplications = applications.length;
    const awardedApplications = applications.filter(app => app.status === 'awarded').length;
    const successRate = totalApplications > 0 ? (awardedApplications / totalApplications) * 100 : 0;
    
    const totalFundingReceived = applications
      .filter(app => app.status === 'awarded')
      .reduce((sum, app) => {
        // This would need to be calculated based on the competition funding amount
        // For now, we'll return 0 and implement this later
        return sum + 0;
      }, 0);
    
    const activeCompetitions = competitions.filter(comp => comp.status === 'open').length;
    const upcomingDeadlines = competitions.filter(comp => {
      const deadline = new Date(comp.applicationDeadline);
      const now = new Date();
      const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
      return comp.status === 'open' && daysUntilDeadline <= 30 && daysUntilDeadline > 0;
    }).length;
    
    const metrics = {
      totalApplications,
      successRate,
      totalFundingReceived,
      activeCompetitions,
      upcomingDeadlines
    };
    
    console.log('Calculated metrics:', metrics);
    return metrics;
  } catch (error) {
    console.error('Error getting competition metrics:', error);
    throw error;
  }
}; 