import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Fix: Remove getReactNativePersistence from named imports if it causes TS errors
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ----------------------------------------------------------------------
// ⚠️ REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE PROJECT KEYS ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyAQHvTTYIKhKux8g7rCalxs7nOC3F6Hz8E",
  authDomain: "hygieatvendor.firebaseapp.com",
  projectId: "hygieatvendor",
  storageBucket: "hygieatvendor.firebasestorage.app",
  messagingSenderId: "1075848694059",
  appId: "1:1075848694059:web:41e1ed68dfe28d15f61d6e",
};

// ----------------------------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------------------------

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with React Native Persistence (AsyncStorage)
  // This fixes the warning and ensures users stay logged in.
  // Note: We cast to 'any' to avoid TS errors if getReactNativePersistence is missing from types
  try {
     const { getReactNativePersistence } = require('firebase/auth');
     if (getReactNativePersistence) {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
     } else {
        auth = getAuth(app);
     }
  } catch (e) {
     auth = getAuth(app);
  }
} else {
  app = getApp();
  auth = getAuth(app); // Get existing auth instance
}

export const db = getFirestore(app);
export { auth };
export default app;