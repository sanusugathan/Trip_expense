// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBwyceiAvXoi3GBXrSyUq8MVyGYXl1mDaA",
  authDomain: "trip-expense-tracker-fe613.firebaseapp.com",
  projectId: "trip-expense-tracker-fe613",
  storageBucket: "trip-expense-tracker-fe613.firebasestorage.app",
  messagingSenderId: "422658434620",
  appId: "1:422658434620:web:0060d4bd8ed190d059c539"
};


// ✅ Initialize Firebase
export const app = initializeApp(firebaseConfig);

// ✅ Export Auth and Firestore using the app instance
export const auth = getAuth(app);
export const db = getFirestore(app);