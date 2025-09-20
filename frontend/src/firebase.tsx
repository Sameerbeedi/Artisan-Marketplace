import { initializeApp } from "firebase/app";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Initialize Firebase
let app;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseConfigured = false;

try {
  // Check if we have real Firebase config (not demo values)
  const hasRealConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                       process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                       process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
                       !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo');

  if (hasRealConfig) {
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully with real config");
  } else {
    console.warn("Using demo Firebase config - auth and storage will use fallback methods");
    isFirebaseConfigured = false;
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  storage = null;
  auth = null;
  db = null;
  isFirebaseConfigured = false;
}

export { storage, auth, db, isFirebaseConfigured };
