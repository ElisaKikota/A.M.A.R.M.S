// src/services/resourceService.js
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    Timestamp,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export const resourceService = {
    // Get all resources
    async getResources() {
        try {
          console.log('Fetching resources...'); // Debug log
          const resourcesRef = collection(db, 'resources');
          const snapshot = await getDocs(resourcesRef);
          
          if (snapshot.empty) {
            console.log('No resources found in Firestore');
            return [];
          }
      
          const resources = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Resource data:', { id: doc.id, ...data }); // Debug log
            return {
              id: doc.id,
              ...data
            };
          });
      
          console.log('Fetched resources:', resources); // Debug log
          return resources;
        } catch (error) {
          console.error('Error fetching resources:', error);
          throw error;
        }
      },
  
      async removeBooking(bookingId) {
        try {
          const bookingRef = doc(db, 'bookings', bookingId);
          await deleteDoc(bookingRef);
          
          // Add to history
          await this.addHistoryEntry(bookingId, 'booking_cancelled', {
            timestamp: serverTimestamp(),
            action: 'cancelled'
          });
      
          return bookingId;
        } catch (error) {
          console.error('Error removing booking:', error);
          throw error;
        }
      },

    async addResource(resourceData) {
      const resourcesRef = collection(db, 'resources');
      const docRef = await addDoc(resourcesRef, {
        ...resourceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...resourceData
      };
    },
  
    async updateResource(id, updates) {
      const docRef = doc(db, 'resources', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return {
        id,
        ...updates
      };
    },
  
    async deleteResource(id) {
      await deleteDoc(doc(db, 'resources', id));
      return id;
    },
  
    // Venue Bookings
    async getBookings(startDate, endDate) {
        try {
          const bookingsRef = collection(db, 'bookings');
          const q = query(
            bookingsRef,
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate))
          );
          
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date.toDate() // Convert Timestamp to Date
            };
          });
        } catch (error) {
          console.error('Error getting bookings:', error);
          throw error;
        }
      },
  
      async addBooking(bookingData) {
        try {
          const startTime = bookingData.timeSlot.split('-')[0];
          const endTime = calculateEndTime(startTime, bookingData.duration);
          
          // Generate all time slots that should be booked
          const affectedTimeSlots = getAffectedTimeSlots(startTime, endTime);
          
          // Check for conflicts in all affected time slots
          const conflicts = await this.checkTimeSlotConflicts(
            bookingData.date,
            bookingData.venue,
            affectedTimeSlots
          );
      
          if (conflicts.length > 0) {
            throw new Error('One or more time slots are already booked');
          }
      
          // Create the booking with additional time slot information
          const bookingRef = await addDoc(collection(db, 'bookings'), {
            ...bookingData,
            startTime,
            endTime,
            affectedTimeSlots,
            createdAt: serverTimestamp()
          });
      
          return {
            id: bookingRef.id,
            ...bookingData
          };
        } catch (error) {
          console.error('Error adding booking:', error);
          throw error;
        }
      },

      
  
    async cancelBooking(id) {
      await deleteDoc(doc(db, 'bookings', id));
      return id;
    },
  
    // Resource History
    async addHistoryEntry(resourceId, action, details) {
      const historyRef = collection(db, 'resourceHistory');
      await addDoc(historyRef, {
        resourceId,
        action,
        details,
        timestamp: serverTimestamp()
      });
    },
  
    async getResourceHistory(resourceId) {
      const historyRef = collection(db, 'resourceHistory');
      const q = query(
        historyRef,
        where('resourceId', '==', resourceId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  };

  