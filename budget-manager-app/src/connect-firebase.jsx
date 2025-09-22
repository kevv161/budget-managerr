// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMrbqzy6BHPnl86EgFLnZCtjRkyzVm_7I",
  authDomain: "budget-managerr.firebaseapp.com",
  projectId: "budget-managerr",
  storageBucket: "budget-managerr.firebasestorage.app",
  messagingSenderId: "755923256842",
  appId: "1:755923256842:web:b27c820c4c681c0dad01f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email, password, displayName) => {
  try {
    // Crear el usuario con email y password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Actualizar el perfil con el displayName
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default app;