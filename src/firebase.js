import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration
 * ──────────────────────
 * Copy .env.example → .env and fill in your credentials from:
 * https://console.firebase.google.com → Project Settings → General → Your apps
 *
 * If credentials are omitted the app automatically enters Demo Mode
 * (localStorage / sessionStorage, no cloud sync).
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
};

let app;
let auth     = null;
let db       = null;             // Firestore instance
let isFirebaseAvailable = false;

const hasConfig = !!firebaseConfig.apiKey;

if (hasConfig) {
  try {
    app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db   = getFirestore(app);
    isFirebaseAvailable = true;
    console.log('[EcoTrack] Firebase Auth + Firestore initialised successfully.');
  } catch (error) {
    console.error('[EcoTrack] Firebase failed to initialise → Demo Mode.', error);
  }
} else {
  console.warn(
    '[EcoTrack] No Firebase config detected. Running in Demo Mode.\n' +
    'Copy .env.example → .env and add your Firebase credentials to enable cloud sync.'
  );
}

export { auth, db, isFirebaseAvailable };
export default auth;
