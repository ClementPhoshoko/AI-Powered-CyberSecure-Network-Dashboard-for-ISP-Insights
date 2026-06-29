import { useState, useEffect, useCallback, useRef } from 'react';
import { getProfile, updateProfile as updateProfileService } from '../services/profileService';
import { getFriendlyErrorMessage } from '../services/errorUtils';

export function useProfile(isAuthReady = true) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuthReadyRef = useRef(isAuthReady);

  useEffect(() => {
    isAuthReadyRef.current = isAuthReady;
  }, [isAuthReady]);

  const fetchProfile = useCallback(async () => {
    if (!isAuthReadyRef.current) {
      return;
    }
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

      const response = await updateProfileService(profileData);
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
    } else {
      // Reset state when not authenticated
      setProfile(null);
      setLoading(false);
      setError(null);
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
