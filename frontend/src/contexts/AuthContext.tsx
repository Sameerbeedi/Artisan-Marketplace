'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/firebase';

export type UserRole = 'artist' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isArtist: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user && db) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || data.displayName || '',
              role: data.role || 'customer',
              createdAt: data.createdAt?.toDate() || new Date(),
            });
          } else {
            // Create default profile if it doesn't exist
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              role: 'customer',
              createdAt: new Date(),
            };
            await setDoc(doc(db, 'users', user.uid), {
              ...defaultProfile,
              createdAt: new Date(),
            });
            setUserProfile(defaultProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    if (!auth || !db || !isFirebaseConfigured) {
      throw new Error('Firebase not configured. Using demo mode.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, { displayName });

      // Save user profile to Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName,
        role: role,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: new Date(),
      });

      setUserProfile(userProfile);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase not configured. Using demo mode.');
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth || !isFirebaseConfigured) {
      return;
    }

    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    isArtist: userProfile?.role === 'artist',
    isCustomer: userProfile?.role === 'customer',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}