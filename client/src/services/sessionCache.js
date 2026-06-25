// Session cache to avoid calling supabase.auth.getSession() on every request
let cachedSession = null;

export const setCachedSession = (session) => {
  cachedSession = session;
};

export const getCachedSession = () => cachedSession;
