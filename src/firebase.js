import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // On ajoute le service de base de données
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAx_PR8K-tLbBv8Dg2osiVJ_z77mhmuII4',
  authDomain: 'shasozam.firebaseapp.com',
  projectId: 'shasozam',
  storageBucket: 'shasozam.firebasestorage.app',
  messagingSenderId: '139358287090',
  appId: '1:139358287090:web:6cb35babd9a4789a7a4c6b',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // On exporte la base de données sous le nom 'db'
export const storage = getStorage(app);
