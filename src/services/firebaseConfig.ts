import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, setDoc, doc, query, where, orderBy, limit, updateDoc, increment, writeBatch, deleteDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyD_placeholder",
    authDomain: "hygieatvendor.firebaseapp.com",
    projectId: "hygieatvendor",
    storageBucket: "hygieatvendor.firebasestorage.app",
    messagingSenderId: "1075848694059",
    appId: "1:1075848694059:web:41e1ed68dfe28d15f61d6e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, getDocs, getDoc, setDoc, doc, query, where, orderBy, limit, updateDoc, increment, writeBatch, deleteDoc };
