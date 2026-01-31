// auth.ts - Supabase authentication utilities

import { supabase } from './supabase'

export interface AuthUser {
  userId: string;
  email: string;
}

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  // This is a sync check - for async use getSession
  const session = supabase.auth.getSession();
  // For sync access, we need to use a different approach
  return null; // Will be updated by the async version
};

// Get current user (async)
export const getCurrentUserAsync = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return null;

  return {
    userId: session.user.id,
    email: session.user.email || '',
  };
};

// Check if user is authenticated (async)
export const isAuthenticatedAsync = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Check if authenticated (sync - checks local storage)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Check if there's a session in local storage
  const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
  const sessionData = localStorage.getItem(storageKey);
  return !!sessionData;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        userId: session.user.id,
        email: session.user.email || '',
      });
    } else {
      callback(null);
    }
  });
};
