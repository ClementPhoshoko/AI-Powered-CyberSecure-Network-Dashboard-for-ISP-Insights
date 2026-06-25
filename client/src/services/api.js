import axios from 'axios';
import { supabase } from './supabase';
import { createFriendlyError } from './errorUtils';
import { getCachedSession } from './sessionCache';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    let session = getCachedSession();
    
    if (!session) {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      session = freshSession;
    }
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(createFriendlyError(error))
);

// Response interceptor to transform errors to friendly messages
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(createFriendlyError(error))
);

export default api;
