// src/firebase/storageConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const storageConfig = {
  apiKey: "AIzaSyD2ae7jW_1RF6m6225QsiYtgXfwW0W_rJI",
  authDomain: "back-7250a.firebaseapp.com",
  databaseURL: "https://back-7250a-default-rtdb.firebaseio.com",
  projectId: "back-7250a",
  storageBucket: "back-7250a.appspot.com",
  messagingSenderId: "132243534371",
  appId: "1:132243534371:web:ddba0a7de32e4f5ccd7796",
  measurementId: "G-6W7J5TGRKL"
};

const storageApp = initializeApp(storageConfig, 'storage');
export const storage = getStorage(storageApp);

export const storageService = {
  uploadFile: async (file, path) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },
  
  deleteFile: async (path) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },
  
  getDownloadUrl: async (path) => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }
};