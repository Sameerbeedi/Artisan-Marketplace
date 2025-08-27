// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTSE2m1vmgEIz-jOSzH-Au-MFyWdy_yBU",
  authDomain: "artisan-marketplace-ai-b31cf.firebaseapp.com",
  projectId: "artisan-marketplace-ai-b31cf",
  storageBucket: "artisan-marketplace-ai-b31cf.appspot.com",
  messagingSenderId: "1098354854044",
  appId: "1:1098354854044:web:6954e13acb8c0502b10559",
  measurementId: "G-FG8ZPC53GG"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, analytics };
