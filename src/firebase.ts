/// <reference types="vite/client" />

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Import the Firebase configuration as fallback for local offline dev
import firebaseConfigFile from '../firebase-applet-config.json';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigFile.measurementId,
};

const firestoreDatabaseId =
  env.VITE_FIRESTORE_DATABASE_ID ||
  env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  firebaseConfigFile.firestoreDatabaseId;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
  throw new Error('Firebase configuration not found. Set VITE_FIREBASE_... env vars or firebase-applet-config.json.');
}

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
let db;
try {
  db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
} catch (error) {
  console.error('Firestore initialization failed:', error);
  throw error;
}
export { db };
export const auth = getAuth();

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export function handleFirestoreError(error: any, operationType: string, path: string | null) {
  const errInfo: any = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
