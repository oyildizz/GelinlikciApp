// firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBnb9kJmhiWPf3R-BZHLrnYhYAZAEOTnNs",
  authDomain: "angelhouse-app.firebaseapp.com",
  projectId: "angelhouse-app",
  storageBucket: "angelhouse-app.firebasestorage.app",
  messagingSenderId: "300459538913",
  appId: "1:300459538913:web:d265fc8632a06f226cbaa0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
