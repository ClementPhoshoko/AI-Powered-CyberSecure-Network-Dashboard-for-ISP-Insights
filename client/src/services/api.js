import axios from 'axios';
import { supabase } from './supabase';
import { createFriendlyError } from './errorUtils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
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
