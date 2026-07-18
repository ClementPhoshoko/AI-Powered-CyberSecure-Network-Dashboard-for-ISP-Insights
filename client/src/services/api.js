import axios from 'axios';
import { supabase } from './supabase';
import { createFriendlyError } from './errorUtils';
import { getCachedSession } from './sessionCache';

const ANONYMOUS_ID_KEY = 'speedtest_anonymous_id';

function getOrCreateAnonymousId() {
  let id = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token or anonymous ID to requests
api.interceptors.request.use(
  async (config) => {
    let session = getCachedSession();
    
    if (!session) {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      session = freshSession;
    }
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      config.headers['X-Anonymous-Id'] = getOrCreateAnonymousId();
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
