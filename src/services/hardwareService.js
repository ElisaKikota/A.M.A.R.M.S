// src/services/hardwareService.js
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    query, 
    where,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export const hardwareService = {
    // Get all hardware items
    async getHardwareItems(userId) {
      try {
        const hardwareRef = collection(db, 'hardware');
        const q = query(hardwareRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting hardware items:', error);
        throw error;
      }
    },
  
    // Add new hardware item
    async addHardwareItem(userId, itemData) {
      try {
        const hardwareRef = collection(db, 'hardware');
        const docRef = await addDoc(hardwareRef, {
          ...itemData,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'available',
          checkoutHistory: []
        });
        
        return {
          id: docRef.id,
          ...itemData
        };
      } catch (error) {
        console.error('Error adding hardware item:', error);
        throw error;
      }
    },
  
    // Update hardware item
    async updateHardwareItem(itemId, updates) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        
        return {
          id: itemId,
          ...updates
        };
      } catch (error) {
        console.error('Error updating hardware item:', error);
        throw error;
      }
    },
  
    // Delete hardware item
    async deleteHardwareItem(itemId) {
      try {
        await deleteDoc(doc(db, 'hardware', itemId));
        return itemId;
      } catch (error) {
        console.error('Error deleting hardware item:', error);
        throw error;
      }
    },
  
    // Check out hardware item
    async checkoutItem(itemId, userId, checkoutData) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Hardware item not found');
        }
  
        const currentData = docSnap.data();
        const checkoutHistory = currentData.checkoutHistory || [];
  
        await updateDoc(docRef, {
          status: 'in-use',
          currentCheckout: {
            userId,
            checkoutDate: serverTimestamp(),
            expectedReturnDate: checkoutData.expectedReturnDate,
            purpose: checkoutData.purpose
          },
          checkoutHistory: [...checkoutHistory, {
            userId,
            checkoutDate: new Date().toISOString(),
            expectedReturnDate: checkoutData.expectedReturnDate,
            purpose: checkoutData.purpose
          }],
          updatedAt: serverTimestamp()
        });
  
        return {
          id: itemId,
          status: 'in-use',
          ...checkoutData
        };
      } catch (error) {
        console.error('Error checking out hardware item:', error);
        throw error;
      }
    },
  
    // Check in hardware item
    async checkinItem(itemId, condition) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Hardware item not found');
        }
  
        const currentData = docSnap.data();
        const checkoutHistory = currentData.checkoutHistory || [];
        const lastCheckout = currentData.currentCheckout;
  
        if (lastCheckout) {
          checkoutHistory[checkoutHistory.length - 1] = {
            ...lastCheckout,
            returnDate: new Date().toISOString(),
            returnCondition: condition
          };
        }
  
        await updateDoc(docRef, {
          status: 'available',
          currentCheckout: null,
          checkoutHistory,
          condition,
          updatedAt: serverTimestamp()
        });
  
        return {
          id: itemId,
          status: 'available',
          condition
        };
      } catch (error) {
        console.error('Error checking in hardware item:', error);
        throw error;
      }
    },
  
    // Log maintenance
    async logMaintenance(itemId, maintenanceData) {
      try {
        const docRef = doc(db, 'hardware', itemId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Hardware item not found');
        }
  
        const currentData = docSnap.data();
        const maintenanceHistory = currentData.maintenanceHistory || [];
  
        await updateDoc(docRef, {
          status: 'maintenance',
          maintenanceHistory: [...maintenanceHistory, {
            ...maintenanceData,
            date: new Date().toISOString()
          }],
          updatedAt: serverTimestamp()
        });
  
        return {
          id: itemId,
          status: 'maintenance',
          ...maintenanceData
        };
      } catch (error) {
        console.error('Error logging maintenance:', error);
        throw error;
      }
    }
  };