import firebase from "firebase/compat/app";
import "firebase/compat/auth";

/**
 * Firebase Configuration
 * Use environment variables for security.
 * Ensure these are set in your .env file or deployment platform.
 */
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase if not already initialized
try {
  if (firebaseConfig.apiKey && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  } else if (!firebaseConfig.apiKey) {
    console.warn("Firebase API key is missing. Auth features will be disabled.");
  }
} catch (error) {
  console.error("Firebase init error:", error);
}

// Export Authentication Service
export const auth = firebase.auth();

/**
 * Monitors user authentication state (Login/Logout)
 */
export const subscribeToAuthChanges = (callback: (user: firebase.User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

/**
 * Signs out the current user
 */
export const logout = () => auth.signOut();