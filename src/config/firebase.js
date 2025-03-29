import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, onValue, serverTimestamp, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBEgp6wElu9GGzt8VSqrD4Z5JjdaHbAS0U",
  authDomain: "course-ac11b.firebaseapp.com",
  projectId: "course-ac11b",
  storageBucket: "course-ac11b.appspot.com",
  messagingSenderId: "504173119960",
  appId: "1:504173119960:web:0fd66571b4fe6c260c0aad",
  measurementId: "G-XCT1QBJVVF",
  databaseURL: "https://course-ac11b-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const googleProvider = new GoogleAuthProvider();
const auth = getAuth();
const db = getDatabase(app);

export const storage = getStorage(app);

export { googleProvider, auth };

export { db, ref, push, onValue, serverTimestamp, set, remove }; // Thêm 'remove'
