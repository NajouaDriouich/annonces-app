import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABuqnfI00kG24CgfuNL0vrb1fqCrkyDio",
  authDomain: "annoncesapp-8d0d4.firebaseapp.com",
  projectId: "annoncesapp-8d0d4",
  storageBucket: "annoncesapp-8d0d4.firebasestorage.app",
  messagingSenderId: "559944114626",
  appId: "1:559944114626:web:f5045124d1407a7dab765b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
