import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function getApp(): FirebaseApp {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

export function getDb() {
  return getFirestore(getApp())
}

export function getAuthInstance() {
  return getAuth(getApp())
}

// Convenience: initialize eagerly on client side
const app = typeof window !== 'undefined' ? getApp() : undefined
export const db = typeof window !== 'undefined' ? getFirestore(app!) : (null as never)
export const auth = typeof window !== 'undefined' ? getAuth(app!) : (null as never)

export default getApp
