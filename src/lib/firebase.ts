import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKXoHtcrGpcbv5leu9lcYF53ZFsv15BuY",
  authDomain: "daf-controller-bot.firebaseapp.com",
  projectId: "daf-controller-bot",
  storageBucket: "daf-controller-bot.firebasestorage.app",
  messagingSenderId: "232928217720",
  appId: "1:232928217720:web:ec40dfad1afc7506e43b8d",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
