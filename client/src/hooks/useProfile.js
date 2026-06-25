import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile } from '../services/profileService';
import { getFriendlyErrorMessage } from '../services/errorUtils';

export function useProfile(isAuthReady = true) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProfile();
      if (response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateProfile(profileData);
      if (response.data) {
        setProfile(response.data);
      }
      return response;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthReady]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile: updateUserProfile
  };
}

export default useProfile;
