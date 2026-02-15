
// @google/genai-api-fix: Refactored to use Firebase v8 compat syntax to resolve module export errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";


/**
 * إعدادات Firebase
 * تم تثبيت القيم لضمان التشغيل الفوري.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBeNmcjRIH1ZxMEgBJAzlE716f7e2eQPHw",
  authDomain: "eco-chemist.firebaseapp.com",
  projectId: "eco-chemist",
  storageBucket: "eco-chemist.firebasestorage.app",
  messagingSenderId: "962097626578",
  appId: "1:962097626578:web:f6d0a31c1ca7ce69175c0b"
};

// تهيئة التطبيق
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}


// تصدير خدمة المصادقة
export const auth = firebase.auth();

/**
 * دالة لمراقبة حالة المستخدم (تسجيل دخول/خروج)
 */
export const subscribeToAuthChanges = (callback: (user: firebase.User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

/**
 * تسجيل الخروج من النظام
 */
export const logout = () => auth.signOut();