const { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const { getFirestore } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

const config = {
  apiKey: "AIzaSyDV_eiDfZn8hEdSUU-3_ooiGm5aFMGvxyc",
  authDomain: "stefanhiene-2ec0a.firebaseapp.com",
  projectId: "stefanhiene-2ec0a",
  storageBucket: "stefanhiene-2ec0a.firebasestorage.app",
  messagingSenderId: "80241216538",
  appId: "1:80241216538:web:c96211fe87de2738dad5a3"
};

// Initialize Firebase for the script
const app = initializeApp(config);
const db = getFirestore(app);

const COLLECTION_NAME = 'landing-pages';

const createLandingPage = async (landingPage) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...landingPage,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

module.exports = {
  createLandingPage
};
