import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyCZJhjlXm4u_evYEsRrBezxTctSli8JSuM",
  authDomain: "kurdshop-c2ed7.firebaseapp.com",
  projectId: "kurdshop-c2ed7",
  storageBucket: "kurdshop-c2ed7.firebasestorage.app",
  messagingSenderId: "1076079983982",
  appId: "1:1076079983982:web:34c7d9d61d0b4c15da557f"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
export const auth = getAuth(app);