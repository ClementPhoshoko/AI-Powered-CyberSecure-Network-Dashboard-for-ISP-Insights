import { supabase } from './supabase';
import { getFriendlyErrorMessage as getGeneralFriendlyMessage } from './errorUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const otpFetch = async (path, body) => {
  let res;
  try {
    res = await fetch(`${API_URL}/api/otp${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    throw new Error('Something went wrong. Please try again.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error('Something went wrong on our end. Please try again later.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const getFriendlyOtpErrorMessage = (error) => {
  if (!error || !error.message) {
    return 'Something went wrong. Please try again.';
  }

  const msg = error.message.toLowerCase();

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (msg.includes('too many') || msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  if (msg.includes('captcha')) {
    return 'Captcha verification failed. Please complete the challenge and try again.';
  }

  if (msg.includes('internal server error')) {
    return 'Something went wrong on our end. Please try again later.';
  }

  if (msg.includes('failed to send email')) {
    return 'We couldn\'t send the email. Please try again or check your email address.';
  }

  if (msg.includes('no account found')) {
    return 'No account found with this email address.';
  }

  if (msg.includes('already verified')) {
    return 'This email is already verified. You can sign in directly.';
  }

  if (msg.includes('no otp found') || msg.includes('request a new one')) {
    return 'No verification code found. Please request a new one.';
  }

  if (msg.includes('expired')) {
    return 'Your code has expired. Please request a new one.';
  }

  if (msg.includes('too many attempts')) {
    return 'Too many incorrect attempts. Please request a new code.';
  }

  if (msg.includes('invalid code')) {
    return 'Incorrect code. Please check and try again.';
  }

  if (msg.includes('invalid or expired verification link')) {
    return 'This verification link has expired or is invalid. Please sign up again.';
  }

  if (msg.includes('invalid reset session') || msg.includes('start over')) {
    return 'Your session has expired. Please start the password reset process again.';
  }

  if (msg.includes('invalid reset token')) {
    return 'Invalid reset link. Please start the password reset process again.';
  }

  if (msg.includes('user not found')) {
    return 'No account found with this email address.';
  }

  if (msg.includes('validation error')) {
    return error.message;
  }

  return error.message;
};

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

export const register = async (email, password, turnstileToken) => {
  try {
    return await otpFetch('/register', { email, password, turnstileToken });
  } catch (err) {
    throw new Error(getFriendlyOtpErrorMessage(err));
  }
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

export const sendOtp = async (email, purpose, turnstileToken) => {
  try {
    return await otpFetch('/send', { email, purpose, turnstileToken });
  } catch (err) {
    throw new Error(getFriendlyOtpErrorMessage(err));
  }
};

export const verifyOtp = async (email, code, purpose) => {
  try {
    return await otpFetch('/verify', { email, code, purpose });
  } catch (err) {
    throw new Error(getFriendlyOtpErrorMessage(err));
  }
};

export const resetPassword = async (email, resetToken, newPassword) => {
  try {
    return await otpFetch('/reset-password', { email, resetToken, newPassword });
  } catch (err) {
    throw new Error(getFriendlyOtpErrorMessage(err));
  }
};
