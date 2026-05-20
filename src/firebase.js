import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBXz6IuKnuKuCVvEHxnUtrJT42QwpVO2HY",
  authDomain: "draci-talisman.firebaseapp.com",
  databaseURL: "https://draci-talisman-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "draci-talisman",
  storageBucket: "draci-talisman.firebasestorage.app",
  messagingSenderId: "126825969940",
  appId: "1:126825969940:web:983f83c884325843d0ea01"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;