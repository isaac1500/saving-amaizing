import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase config fields:', missingFields);
    throw new Error(`Firebase configuration missing: ${missingFields.join(', ')}`);
  }
  
  console.log('✅ Firebase config validation passed');
};

validateConfig();

// Initialize Firebase
console.log('🔧 Initializing Firebase app...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize Firestore with better offline support and persistence
console.log('🔧 Initializing Firestore with offline persistence...');
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  })
});
console.log('✅ Firestore initialized with persistence');

// Initialize Auth with persistence
console.log('🔧 Initializing Firebase Auth...');
const auth = getAuth(app);

// Set auth persistence to local (keeps user logged in)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('✅ Auth persistence set to LOCAL'))
  .catch((error) => console.error('❌ Auth persistence error:', error));

// Initialize Storage
console.log('🔧 Initializing Firebase Storage...');
const storage = getStorage(app);
console.log('✅ Firebase Storage initialized');

// Optional: Use emulators for development (uncomment if needed)
// if (process.env.NODE_ENV === 'development') {
//   console.log('🔧 Connecting to Firebase emulators...');
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   console.log('✅ Connected to emulators');
// }

// Network status monitoring
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  console.log('🌐 Network connection restored');
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('⚠️ Network connection lost');
});

// Export configured instances
export { auth, db, storage, isOnline };
export default app;