import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0rccYxhSCcDrT0I3l2xGj0iAR_-sIu-M",
    authDomain: "biographi-28eed.firebaseapp.com",
    projectId: "biographi-28eed",
    storageBucket: "biographi-28eed.firebasestorage.app",
    messagingSenderId: "513138653331",
    appId: "1:513138653331:web:879a746e8d185e8f31f566",
    measurementId: "G-F4N6MCQYBL"
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
export const saveUserData = async(userId, data) => {
    try {
        console.log('Firebase: Saving data for user:', userId);
        console.log('Firebase: Data to save:', {
            formDataKeys: Object.keys(data.formData || {}),
            photosCount: Object.keys(data.photos || {}).length,
            recordingsCount: Object.keys(data.recordings || {}).length,
            writingStreak: data.writingStreak,
            lastWriteDate: data.lastWriteDate,
            updatedAt: data.updatedAt
        });

        // Validate data before saving
        if (!userId) {
            console.error('Firebase: No user ID provided');
            return false;
        }

        if (!data || typeof data !== 'object') {
            console.error('Firebase: Invalid data provided');
            return false;
        }

        // Ensure required fields exist
        const dataToSave = {
            formData: data.formData || {},
            photos: data.photos || {},
            recordings: data.recordings || {},
            writingStreak: data.writingStreak || 0,
            lastWriteDate: data.lastWriteDate || null,
            updatedAt: data.updatedAt || new Date().toISOString(),
            createdAt: data.createdAt || new Date().toISOString()
        };

        await setDoc(doc(db, 'users', userId), dataToSave, { merge: true });
        console.log('Firebase: Data saved successfully for user:', userId);
        return true;
    } catch (error) {
        console.error('Firebase: Error saving user data:', error);
        console.error('Firebase: Error details:', {
            code: error.code,
            message: error.message,
            userId: userId
        });
        return false;
    }
};

export const getUserData = async(userId) => {
    try {
        console.log('Firebase: Getting data for user:', userId);

        if (!userId) {
            console.error('Firebase: No user ID provided');
            return null;
        }

        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Firebase: Data retrieved successfully:', {
                formDataKeys: Object.keys(data.formData || {}),
                photosCount: Object.keys(data.photos || {}).length,
                recordingsCount: Object.keys(data.recordings || {}).length,
                writingStreak: data.writingStreak,
                lastWriteDate: data.lastWriteDate
            });
            return data;
        } else {
            console.log('Firebase: No data found for user:', userId);
            return null;
        }
    } catch (error) {
        console.error('Firebase: Error getting user data:', error);
        console.error('Firebase: Error details:', {
            code: error.code,
            message: error.message,
            userId: userId
        });
        return null;
    }
};

export const updateUserData = async(userId, data) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, data);
        return true;
    } catch (error) {
        console.error('Error updating user data:', error);
        return false;
    }
};

export const getAllUsers = async() => {
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