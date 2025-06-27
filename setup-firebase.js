#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup for Life Story Biography App\n');

console.log('📋 Steps to set up Firebase:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project');
console.log('3. Enable Authentication (Email/Password)');
console.log('4. Create a Firestore database');
console.log('5. Get your config from Project Settings > General > Your Apps\n');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questions = [
    'Enter your Firebase API Key: ',
    'Enter your Firebase Auth Domain: ',
    'Enter your Firebase Project ID: ',
    'Enter your Firebase Storage Bucket: ',
    'Enter your Firebase Messaging Sender ID: ',
    'Enter your Firebase App ID: '
];

const answers = [];

function askQuestion(index) {
    if (index >= questions.length) {
        createConfig();
        return;
    }

    rl.question(questions[index], (answer) => {
        answers.push(answer);
        askQuestion(index + 1);
    });
}

function createConfig() {
    const firebaseConfig = `import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "${answers[0]}",
  authDomain: "${answers[1]}",
  projectId: "${answers[2]}",
  storageBucket: "${answers[3]}",
  messagingSenderId: "${answers[4]}",
  appId: "${answers[5]}"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = () => {
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Database functions
export const saveUserData = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), data);
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const updateUserData = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};
`;

    const filePath = path.join(__dirname, 'src', 'firebase.js');

    try {
        fs.writeFileSync(filePath, firebaseConfig);
        console.log('\n✅ Firebase configuration created successfully!');
        console.log('📁 File created: src/firebase.js');

        console.log('\n🔒 Next steps:');
        console.log('1. Set up Firestore security rules in Firebase Console');
        console.log('2. Enable Authentication methods');
        console.log('3. Run "npm start" to test the app');

    } catch (error) {
        console.error('❌ Error creating Firebase config:', error.message);
    }

    rl.close();
}

console.log('Please provide your Firebase configuration details:\n');
askQuestion(0);