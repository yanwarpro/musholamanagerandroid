import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name,
              role: userData.role as UserRole,
              createdAt: userData.createdAt?.toDate() || new Date(),
            });
          } else {
            // User document doesn't exist yet - create it in Firestore
            const defaultName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            const defaultRole: UserRole = 'takmir';
            
            // Save new user to Firestore
            await setDoc(userDocRef, {
              name: defaultName,
              email: firebaseUser.email || '',
              role: defaultRole,
              createdAt: serverTimestamp(),
            });
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: defaultName,
              role: defaultRole,
              createdAt: new Date(),
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Still try to set user from Firebase Auth if Firestore fails
        if (auth.currentUser) {
          setUser({
            id: auth.currentUser.uid,
            email: auth.currentUser.email || '',
            name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
            role: 'takmir' as UserRole,
            createdAt: new Date(),
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Create user document in Firestore with serverTimestamp
      await setDoc(doc(db, 'users', userId), {
        name,
        email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Sign out after creating account so user can sign in manually
      await firebaseSignOut(auth);
      setUser(null);
      
      // Return success - the LoginScreen will show success alert
      return;
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please contact administrator.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
