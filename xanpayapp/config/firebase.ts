import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyA319G2oj_5dO6lm93QhExYRQcyx_MhaN0",
  authDomain: "flaresec-1dfea.firebaseapp.com",
  projectId: "flaresec-1dfea",
  storageBucket: "flaresec-1dfea.firebasestorage.app",
  messagingSenderId: "305151061105",
  appId: "1:305151061105:web:f05d04435fe9e389183fd0",
  measurementId: "G-FR7XCE7GC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;