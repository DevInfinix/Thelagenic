import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQHvTTYIKhKux8g7rCalxs7nOC3F6Hz8E",
  authDomain: "hygieatvendor.firebaseapp.com",
  projectId: "hygieatvendor",
  storageBucket: "hygieatvendor.firebasestorage.app",
  messagingSenderId: "1075848694059",
  appId: "1:1075848694059:web:41e1ed68dfe28d15f61d6e",
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;