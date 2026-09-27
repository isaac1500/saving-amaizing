import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { loginUser, logoutUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Firebase auth state listener
  useEffect(() => {
    console.log('🔍 Setting up Firebase auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('🔥 Firebase user detected:', firebaseUser.email);
        try {
          // Get additional user data from Firestore for members
          // For admin, we use the hardcoded data
          if (firebaseUser.uid === 'admin-user-id') {
            setUser({
              uid: 'admin-user-id',
              email: 'byabajunguhenry@gmail.com',
              displayName: 'Henry Byabajungu',
              role: 'admin'
            });
            localStorage.setItem('savingsGroupUser', JSON.stringify({
              uid: 'admin-user-id',
              email: 'byabajunguhenry@gmail.com',
              displayName: 'Henry Byabajungu',
              role: 'admin'
            }));
          } else {
            const userDoc = await getDoc(doc(db, 'members', firebaseUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const completeUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userData.fullName || firebaseUser.displayName,
                role: userData.role || 'member',
                ...userData
              };
              
              console.log('✅ Member user loaded:', completeUser);
              setUser(completeUser);
              localStorage.setItem('savingsGroupUser', JSON.stringify(completeUser));
            } else {
              console.log('❌ User document not found in Firestore');
              setError('User data not found. Please contact administrator.');
              await logoutUser();
              setUser(null);
              localStorage.removeItem('savingsGroupUser');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Error loading user information');
        }
      } else {
        console.log('👤 No Firebase user signed in');
        setUser(null);
        localStorage.removeItem('savingsGroupUser');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError('');
    setLoading(true);

    try {
      console.log('🔄 AuthContext attempting login for:', email);
      const userData = await loginUser(email, password);
      
      console.log('✅ AuthContext login successful, user:', userData);
      setUser(userData);
      localStorage.setItem('savingsGroupUser', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('❌ AuthContext login error:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setError('');
      localStorage.removeItem('savingsGroupUser');
      console.log('👋 User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};