
// @ts-ignore
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getAuth } from "firebase/auth";
// @ts-ignore
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5x31OtysnNJwj8DhxZx_0BzVci6JOGDI",
  authDomain: "astrologer-d11d4.firebaseapp.com",
  projectId: "astrologer-d11d4",
  storageBucket: "astrologer-d11d4.firebasestorage.app",
  messagingSenderId: "559599648123",
  appId: "1:559599648123:web:cbb774d1bc97c4e1a151de",
  measurementId: "G-32S81M31WB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
