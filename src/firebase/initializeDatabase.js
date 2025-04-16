// src/firebase/initializeDatabase.js
import { setupRoles } from './setupRoles';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';

// Function to initialize your database
const initializeDatabase = async () => {
  console.log('Starting database initialization...');
  
  // Collections to preserve
  const preservedCollections = ['authorization', 'roles'];
  
  try {
    // Get all collections to check
    const commonCollections = [
      'users',
      'projects',
      'tasks',
      'activities',
      'teams',
      'notifications',
      'settings',
      'resources',
      'training'
    ];
    
    // Delete data from all collections except preserved ones
    for (const collectionName of commonCollections) {
      // Skip preserved collections
      if (preservedCollections.includes(collectionName)) {
        console.log(`Skipping preserved collection: ${collectionName}`);
        continue;
      }
      
      console.log(`Clearing collection: ${collectionName}`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        // Delete all documents in this collection
        const deletePromises = snapshot.docs.map(document => {
          console.log(`Deleting document: ${document.id} from ${collectionName}`);
          return deleteDoc(doc(db, collectionName, document.id));
        });
        
        await Promise.all(deletePromises);
        console.log(`Collection cleared: ${collectionName}`);
      } catch (err) {
        console.log(`Error clearing collection ${collectionName}:`, err);
        // Continue with other collections even if one fails
      }
    }
    
    // Set up roles (will only create missing roles, not delete existing ones)
    await setupRoles();
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error; // Re-throw to handle in the UI
  }
};

export default initializeDatabase;