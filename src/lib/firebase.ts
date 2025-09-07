// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Load config from environment variables
const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "AIzaSyCTSE2m1vmgEIz-jOSzH-Au-MFyWdy_yBU",
  authDomain: "artisan-marketplace-ai-b31cf.firebaseapp.com",
  projectId: "artisan-marketplace-ai-b31cf",
  storageBucket: "artisan-marketplace-ai-b31cf.appspot.com",
  messagingSenderId: "1098354854044",
  appId: "1:1098354854044:web:6954e13acb8c0502b10559",
  measurementId: "G-FG8ZPC53GG"
=======
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
>>>>>>> 60b34ff6b4a9a438b0d5a6937c1dd6bf3d820c29
};

// Initialize app only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
<<<<<<< HEAD
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
=======
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
>>>>>>> 60b34ff6b4a9a438b0d5a6937c1dd6bf3d820c29
