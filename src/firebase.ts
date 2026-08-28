/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDGqaMpgfaOwU2HUZJU_2vD7v5hV22czuw",
  authDomain: "mnsapp-5926d.firebaseapp.com",
  databaseURL: "https://mnsapp-5926d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mnsapp-5926d",
  storageBucket: "mnsapp-5926d.firebasestorage.app",
  messagingSenderId: "598844324022",
  appId: "1:598844324022:web:971c7ebb377d9b95ed0e17",
  measurementId: "G-YPMTDSQ5M6"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
