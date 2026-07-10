import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getSession, logout } from '../services/authService';
import { setCachedSession } from '../services/sessionCache';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setCachedSession(currentSession);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setCachedSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    logout,
    isLoggingOut,
    setIsLoggingOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
