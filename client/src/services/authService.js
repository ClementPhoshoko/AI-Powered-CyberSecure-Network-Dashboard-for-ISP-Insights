import { supabase } from './supabase';
import { getFriendlyErrorMessage as getGeneralFriendlyMessage } from './errorUtils';

const getFriendlyAuthErrorMessage = (error) => {
  if (!error || !error.message) {
    return getGeneralFriendlyMessage(error);
  }

  const msg = error.message.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your details and try again.';
  }

  if (msg.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }

  if (msg.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (msg.includes('password should be at least')) {
    return 'Your password must be at least 8 characters long.';
  }

  if (msg.includes('network error')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (msg.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }

  return getGeneralFriendlyMessage(error);
};

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const friendlyError = new Error(getFriendlyAuthErrorMessage(error));
    friendlyError.originalError = error;
    throw friendlyError;
  }
  return data;
};

export const register = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) {
    const friendlyError = new Error(getFriendlyAuthErrorMessage(error));
    friendlyError.originalError = error;
    throw friendlyError;
  }
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    const friendlyError = new Error(getFriendlyAuthErrorMessage(error));
    friendlyError.originalError = error;
    throw friendlyError;
  }
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  // Don't throw error if no user, just return null
  if (error) return null;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  // Don't throw error if no session, just return null
  if (error) return null;
  return session;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export const updateEmail = async (email) => {
  const { data, error } = await supabase.auth.updateUser({ 
    email,
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) {
    const friendlyError = new Error(getFriendlyAuthErrorMessage(error));
    friendlyError.originalError = error;
    throw friendlyError;
  }
  return data;
};
