// src/services/resourceService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  orderBy,
  query, 
  where, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase/config';
import { storage } from '../firebase/storageConfig';

export const resourceService = {
  // Upload multiple images and get their URLs
  async uploadImages(files, resourceType, category, resourceName) {
    try {
      const uploadPromises = files.map(async (file) => {
        const path = `resources/${resourceType}/${category}/${resourceName}_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { url, path };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  },

  // Delete multiple images by their storage paths
  async deleteImages(imagePaths) {
    try {
      const deletePromises = imagePaths.map(async (path) => {
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error('Failed to delete images');
    }
  },

  // Get all resources of a specific type
  async getResources(resourceType) {
    try {
      const resourcesRef = collection(db, resourceType);
      const snapshot = await getDocs(resourcesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure status object exists with default values
        status: {
          available: 0,
          inUse: 0,
          maintenance: 0,
          ...(doc.data().status || {})
        }
      }));
    } catch (error) {
      console.error('Error getting resources:', error);
      throw new Error('Failed to load resources');
    }
  },

  // Add new resource with multiple images
  async addResource(resourceType, resourceData) {
    try {
      const { imageFiles, ...data } = resourceData;
      
      // Upload images if provided
      let imageUrls = [];
      let imagePaths = [];
      if (imageFiles?.length) {
        const uploads = await this.uploadImages(
          imageFiles,
          resourceType,
          data.category,
          data.name
        );
        imageUrls = uploads.map(u => u.url);
        imagePaths = uploads.map(u => u.path);
      }

      // Add resource document
      const resourceRef = collection(db, resourceType);
      const docRef = await addDoc(resourceRef, {
        ...data,
        images: imageUrls,
        imagePaths, // Store paths for future deletion
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add to history
      await this.addToHistory(resourceType, docRef.id, {
        action: 'created',
        details: 'Resource created',
        timestamp: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...data,
        images: imageUrls,
        imagePaths
      };
    } catch (error) {
      console.error('Error adding resource:', error);
      throw new Error('Failed to add resource');
    }
  },

  // Update resource including images
  async updateResource(resourceType, resourceId, updates) {
    try {
      const resourceRef = doc(db, resourceType, resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Resource not found');
      }

      const currentData = resourceDoc.data();
      const { imageFiles, imagesToDelete, ...data } = updates;

      // Handle image updates
      let newImages = [...(currentData.images || [])];
      let newImagePaths = [...(currentData.imagePaths || [])];

      // Delete removed images
      if (imagesToDelete?.length) {
        const pathsToDelete = imagesToDelete.map(url => {
          const index = currentData.images.indexOf(url);
          return currentData.imagePaths[index];
        });
        await this.deleteImages(pathsToDelete);
        
        // Remove deleted images from arrays
        newImages = newImages.filter(url => !imagesToDelete.includes(url));
        newImagePaths = newImagePaths.filter(path => !pathsToDelete.includes(path));
      }

      // Upload new images
      if (imageFiles?.length) {
        const uploads = await this.uploadImages(
          imageFiles,
          resourceType,
          data.category || currentData.category,
          data.name || currentData.name
        );
        newImages = [...newImages, ...uploads.map(u => u.url)];
        newImagePaths = [...newImagePaths, ...uploads.map(u => u.path)];
      }

      // Update document
      const updateData = {
        ...data,
        images: newImages,
        imagePaths: newImagePaths,
        updatedAt: serverTimestamp()
      };

      await updateDoc(resourceRef, updateData);

      // Add to history
      await this.addToHistory(resourceType, resourceId, {
        action: 'updated',
        details: 'Resource updated',
        changes: Object.keys(data),
        timestamp: serverTimestamp()
      });

      return {
        id: resourceId,
        ...currentData,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating resource:', error);
      throw new Error('Failed to update resource');
    }
  },

  // Delete resource and its images
  async deleteResource(resourceType, resourceId) {
    try {
      const resourceRef = doc(db, resourceType, resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Resource not found');
      }

      const { imagePaths } = resourceDoc.data();

      // Delete images from storage
      if (imagePaths?.length) {
        await this.deleteImages(imagePaths);
      }

      // Delete resource document
      await deleteDoc(resourceRef);

      // Add to history
      await this.addToHistory(resourceType, resourceId, {
        action: 'deleted',
        details: 'Resource deleted',
        timestamp: serverTimestamp()
      });

      return resourceId;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw new Error('Failed to delete resource');
    }
  },

  // Update resource status quantities
  async updateStatus(resourceType, resourceId, newStatus) {
    try {
      const resourceRef = doc(db, resourceType, resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Resource not found');
      }

      const currentData = resourceDoc.data();

      // Validate total quantity remains the same
      const currentTotal = Object.values(currentData.status).reduce((a, b) => a + b, 0);
      const newTotal = Object.values(newStatus).reduce((a, b) => a + b, 0);

      if (currentTotal !== newTotal) {
        throw new Error('Total quantity must remain the same');
      }

      await updateDoc(resourceRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Add to history
      await this.addToHistory(resourceType, resourceId, {
        action: 'status_updated',
        details: 'Status quantities updated',
        previousStatus: currentData.status,
        newStatus,
        timestamp: serverTimestamp()
      });

      return {
        id: resourceId,
        ...currentData,
        status: newStatus
      };
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update status');
    }
  },

  // Add entry to resource history
  async addToHistory(resourceType, resourceId, historyData) {
    try {
      const historyRef = collection(db, `${resourceType}History`);
      await addDoc(historyRef, {
        resourceId,
        ...historyData
      });
    } catch (error) {
      console.error('Error adding to history:', error);
      // Don't throw error for history additions
    }
  },

  // Get resource history
  async getHistory(resourceType, resourceId) {
    try {
      const historyRef = collection(db, `${resourceType}History`);
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
    } catch (error) {
      console.error('Error getting history:', error);
      throw new Error('Failed to load history');
    }
  },

  // Get all bookings
  getBookings: async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Failed to load bookings');
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      
      // Process booking data for Firestore
      // Remove any undefined values and fields that shouldn't be saved
      const cleanedData = Object.fromEntries(
        Object.entries(bookingData)
          .filter(([_, value]) => value !== undefined)
          .filter(([key]) => key !== 'action') // Remove action field as it's just for UI
      );
      
      const bookingToSave = {
        ...cleanedData,
        date: new Date(bookingData.date),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(bookingsRef, bookingToSave);
      
      return {
        id: docRef.id,
        ...cleanedData,
        date: new Date(bookingData.date)
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  },

  // Update an existing booking
  updateBooking: async (id, bookingData) => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      // Process booking data for Firestore
      // Remove any undefined values and fields that shouldn't be saved
      const cleanedData = Object.fromEntries(
        Object.entries(bookingData)
          .filter(([_, value]) => value !== undefined)
          .filter(([key]) => key !== 'action') // Remove action field as it's just for UI
      );
      
      const updateData = {
        ...cleanedData,
        date: new Date(bookingData.date),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(bookingRef, updateData);
      
      return {
        id,
        ...bookingDoc.data(),
        ...cleanedData
      };
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  },

  // Delete a booking
  deleteBooking: async (id) => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      await deleteDoc(bookingRef);
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking');
    }
  },

  // Get all borrowings for a user
  async getBorrowings(userId) {
    try {
      // Use a simpler query that doesn't require a composite index
      const borrowingsRef = collection(db, 'borrowings');
      const q = query(
        borrowingsRef,
        where('userId', '==', userId)
        // Removed the orderBy to avoid needing composite index
      );
      const snapshot = await getDocs(q);
      
      // Sort the results in memory instead
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in descending order
      return results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
    } catch (error) {
      console.error('Error getting borrowings:', error);
      throw new Error('Failed to load borrowings');
    }
  },

  // Create a new borrowing request
  async createBorrowing(borrowingData) {
    try {
      // Get the hardware item
      const hardwareRef = doc(db, 'hardware', borrowingData.hardwareId);
      const hardwareDoc = await getDoc(hardwareRef);
      
      if (!hardwareDoc.exists()) {
        throw new Error('Hardware not found');
      }

      const hardware = hardwareDoc.data();
      
      // Check if enough quantity is available
      if (hardware.status.available < borrowingData.quantity) {
        throw new Error('Not enough quantity available');
      }

      // Create the borrowing document
      const borrowingRef = collection(db, 'borrowings');
      const docRef = await addDoc(borrowingRef, {
        ...borrowingData,
        createdAt: serverTimestamp()
      });

      // Update hardware status
      await updateDoc(hardwareRef, {
        status: {
          ...hardware.status,
          available: hardware.status.available - borrowingData.quantity,
          inUse: (hardware.status.inUse || 0) + borrowingData.quantity
        }
      });

      return {
        id: docRef.id,
        ...borrowingData
      };
    } catch (error) {
      console.error('Error creating borrowing:', error);
      throw new Error('Failed to create borrowing');
    }
  },

  // Update a borrowing status
  async updateBorrowing(borrowingId, updates) {
    try {
      const borrowingRef = doc(db, 'borrowings', borrowingId);
      const borrowingDoc = await getDoc(borrowingRef);
      
      if (!borrowingDoc.exists()) {
        throw new Error('Borrowing not found');
      }

      const borrowing = borrowingDoc.data();

      // If marking as returned, update hardware status
      if (updates.status === 'returned' && borrowing.status !== 'returned') {
        const hardwareRef = doc(db, 'hardware', borrowing.hardwareId);
        const hardwareDoc = await getDoc(hardwareRef);
        
        if (hardwareDoc.exists()) {
          const hardware = hardwareDoc.data();
          await updateDoc(hardwareRef, {
            status: {
              ...hardware.status,
              available: (hardware.status.available || 0) + borrowing.quantity,
              inUse: Math.max(0, (hardware.status.inUse || 0) - borrowing.quantity)
            }
          });
        }
      }

      await updateDoc(borrowingRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return {
        id: borrowingId,
        ...borrowing,
        ...updates
      };
    } catch (error) {
      console.error('Error updating borrowing:', error);
      throw new Error('Failed to update borrowing');
    }
  },

  // Get all borrowings (for admin)
  async getAllBorrowings() {
    try {
      // Get all documents without ordering in the query
      const borrowingsRef = collection(db, 'borrowings');
      const snapshot = await getDocs(borrowingsRef);
      
      // Sort the results in memory
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in descending order
      return results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
    } catch (error) {
      console.error('Error getting all borrowings:', error);
      throw new Error('Failed to load all borrowings');
    }
  },
};