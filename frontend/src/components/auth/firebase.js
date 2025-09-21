import {initializeApp} from 'firebase/app'
import { getAuth} from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_AUTH_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_AUTH_DOMAIN|| '',
  projectId: import.meta.env.VITE_FIREBASE_AUTH_PROJECT_ID|| '',
  storageBucket: import.meta.env.VITE_FIREBASE_AUTH_STORAGE_BUCKET|| '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_AUTH_MESSAGING_SENDER_ID|| '',
  appId: import.meta.env.VITE_FIREBASE_AUTH_APP_ID|| '',
  measurementId: import.meta.env.VITE_FIREBASE_AUTH_MEASUREMENT_ID|| '' 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);




export {app , auth};