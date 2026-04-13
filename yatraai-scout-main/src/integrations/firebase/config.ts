import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Guard: If env vars are missing, show a clear error in the console
if (!projectId) {
  console.error(
    "🔴 YatraAI Firebase Error: Environment variables are missing.\n" +
    "Go to Vercel → Project Settings → Environment Variables and add:\n" +
    "  VITE_FIREBASE_API_KEY\n" +
    "  VITE_FIREBASE_AUTH_DOMAIN\n" +
    "  VITE_FIREBASE_PROJECT_ID\n" +
    "  VITE_FIREBASE_STORAGE_BUCKET\n" +
    "  VITE_FIREBASE_MESSAGING_SENDER_ID\n" +
    "  VITE_FIREBASE_APP_ID\n" +
    "Then trigger a new Redeploy."
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
