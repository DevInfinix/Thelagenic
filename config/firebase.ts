// hygieat-vendor/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: "hygieatvendor.firebaseapp.com",
    projectId: "hygieatvendor",
    storageBucket: "hygieatvendor.firebasestorage.app",
    messagingSenderId: "1075848694059",
    appId: "1:1075848694059:web:41e1ed68dfe28d15f61d6e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);