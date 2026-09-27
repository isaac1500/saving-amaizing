import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  updateProfile, 
  updatePassword as firebaseUpdatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  signInWithEmailAndPassword,
  verifyBeforeUpdateEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'byabajunguhenry@gmail.com';

const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (err.code?.includes('network') || err.message?.includes('network')) {
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
};

const isOnline = () => navigator.onLine;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          if (!isOnline()) {
            const cached = localStorage.getItem('savingsGroupUser');
            if (cached) setUser(JSON.parse(cached));
            setLoading(false);
            return;
          }

          // Reload user to get latest email verification status
          await firebaseUser.reload();
          const refreshedUser = auth.currentUser;

          if (refreshedUser.email === ADMIN_EMAIL) {
            const adminUser = {
              uid: refreshedUser.uid,
              email: refreshedUser.email,
              displayName: refreshedUser.displayName || 'Admin',
              role: 'admin',
              emailVerified: refreshedUser.emailVerified,
            };
            setUser(adminUser);
            localStorage.setItem('savingsGroupUser', JSON.stringify(adminUser));
          } else {
            const userDoc = await retryOperation(() => getDoc(doc(db, 'members', refreshedUser.uid)));

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const completeUser = {
                uid: refreshedUser.uid,
                email: refreshedUser.email,
                displayName: userData.fullName || refreshedUser.displayName,
                role: userData.role || 'member',
                emailVerified: refreshedUser.emailVerified,
                ...userData,
              };
              setUser(completeUser);
              localStorage.setItem('savingsGroupUser', JSON.stringify(completeUser));
            } else {
              const newUserData = {
                uid: refreshedUser.uid,
                email: refreshedUser.email,
                fullName: refreshedUser.displayName || '',
                username: refreshedUser.email.split('@')[0],
                role: 'member',
                emailVerified: refreshedUser.emailVerified,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(doc(db, 'members', refreshedUser.uid), newUserData);
              setUser(newUserData);
              localStorage.setItem('savingsGroupUser', JSON.stringify(newUserData));
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          const cached = localStorage.getItem('savingsGroupUser');
          if (cached) setUser(JSON.parse(cached));
        }
      } else {
        setUser(null);
        localStorage.removeItem('savingsGroupUser');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ── LOGIN ──────────────────────────────────────────────────────── */
  const login = async (email, password) => {
    setError('');
    setLoading(true);
    if (!isOnline()) {
      setError('No internet connection');
      setLoading(false);
      throw new Error('No internet connection');
    }
    try {
      const userCredential = await retryOperation(() =>
        signInWithEmailAndPassword(auth, email, password)
      );
      
      // Reload to get latest email verification status
      await userCredential.user.reload();
      const refreshedUser = auth.currentUser;
      
      const userDoc = await getDoc(doc(db, 'members', refreshedUser.uid));
      const userData = userDoc.data() || {};
      const userObj = {
        uid: refreshedUser.uid,
        email: refreshedUser.email,
        displayName: userData.fullName || refreshedUser.displayName,
        role: userData.role || (email === ADMIN_EMAIL ? 'admin' : 'member'),
        emailVerified: refreshedUser.emailVerified,
        ...userData,
      };
      setUser(userObj);
      localStorage.setItem('savingsGroupUser', JSON.stringify(userObj));
      return userObj;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGOUT ─────────────────────────────────────────────────────── */
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      localStorage.removeItem('savingsGroupUser');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /* ── UPDATE PROFILE (name + username only) ──────────────────────── */
  const updateUserProfile = async (updates) => {
    setError('');
    if (!isOnline()) throw new Error('No internet connection');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      if (updates.fullName && updates.fullName !== currentUser.displayName) {
        await retryOperation(() =>
          updateProfile(currentUser, { displayName: updates.fullName })
        );
      }

      const userRef = doc(db, 'members', currentUser.uid);
      const updateData = { updatedAt: new Date().toISOString() };
      if (updates.fullName) updateData.fullName = updates.fullName;
      if (updates.username) updateData.username = updates.username;

      await retryOperation(() => updateDoc(userRef, updateData));

      const updatedUser = {
        ...user,
        fullName: updates.fullName || user?.fullName,
        username: updates.username || user?.username,
        displayName: updates.fullName || user?.displayName,
      };
      setUser(updatedUser);
      localStorage.setItem('savingsGroupUser', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /* ── UPDATE EMAIL ───────────────────────────────────────────────── */
  const updateEmail = async (currentPassword, newEmail) => {
    setError('');
    if (!isOnline()) throw new Error('No internet connection');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      console.log('📧 Starting email change process...');
      console.log('Current email:', currentUser.email);
      console.log('New email:', newEmail);

      // Step 1: Re-authenticate user
      console.log('🔐 Re-authenticating user...');
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await retryOperation(() => reauthenticateWithCredential(currentUser, credential));
      console.log('✅ User re-authenticated successfully');

      // Step 2: Send verification email to new address
      console.log('📧 Sending verification email to:', newEmail);
      await verifyBeforeUpdateEmail(currentUser, newEmail);
      console.log('✅ Verification email sent successfully!');

      return { success: true, requiresVerification: true };
    } catch (err) {
      console.error('❌ Email update error:', err);
      console.error('Error code:', err.code);
      
      let message = 'Failed to update email.';
      switch (err.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          message = 'That email is already linked to another account.';
          break;
        case 'auth/invalid-email':
          message = 'The email address is not valid.';
          break;
        case 'auth/requires-recent-login':
          message = 'Session expired. Please log out and log in again, then retry.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please wait a few minutes and try again.';
          break;
        default:
          message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  /* ── UPDATE PASSWORD ────────────────────────────────────────────── */
  const updatePassword = async (currentPassword, newPassword) => {
    setError('');
    if (!isOnline()) throw new Error('No internet connection');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await retryOperation(() => reauthenticateWithCredential(currentUser, credential));
      await retryOperation(() => firebaseUpdatePassword(currentUser, newPassword));
      return { success: true };
    } catch (err) {
      let message = 'Failed to change password.';
      switch (err.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          message = 'New password is too weak. Use at least 6 characters.';
          break;
        default:
          message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUserProfile,
    updateEmail,
    updatePassword,
    loading,
    error,
    setError,
    isOnline: isOnline(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};