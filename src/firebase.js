import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // 1. Bunu ekledik

const firebaseConfig = {
  apiKey: "AIzaSyCxKmnJ4fN71tYKg1xh1jngFMsN6puI75E",
  authDomain: "kaiwatch-ba7e0.firebaseapp.com",
  databaseURL: "https://kaiwatch-ba7e0-default-rtdb.firebaseio.com",
  projectId: "kaiwatch-ba7e0",
  storageBucket: "kaiwatch-ba7e0.firebasestorage.app",
  messagingSenderId: "34101185417",
  appId: "1:34101185417:web:26361b9caaa3803c0d2f58",
  measurementId: "G-8QM56CQN3B"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// 2. Veritabanını başlat ve dışa aktar (Hatanın çözümü burası)
export const db = getDatabase(app);