import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Mock Firebase configuration for testing
const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project",
  storageBucket: "test-project.appspot.com",
  messagingSenderId: "test-sender-id",
  appId: "test-app-id"
};

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  auth = getAuth(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create a mock auth object for testing
  auth = {
    currentUser: { uid: 'test-user' },
    onAuthStateChanged: (callback) => {
      callback({ uid: 'test-user' });
      return () => {};
    }
  };
}

export { auth };
export default app; 