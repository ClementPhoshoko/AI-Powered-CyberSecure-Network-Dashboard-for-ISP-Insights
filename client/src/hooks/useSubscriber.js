import { useState, useEffect, useCallback } from 'react';
import { getSubscriber, subscribe as subscribeService, updateSubscription, unsubscribe as unsubscribeService } from '../services/subscriberService';
import { getFriendlyErrorMessage } from '../services/errorUtils';

export function useSubscriber(isAuthReady = true) {
  const [subscriber, setSubscriber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriber = useCallback(async () => {
    if (!isAuthReady) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getSubscriber();
      if (response && response.data !== undefined && response.data !== null) {
        setSubscriber(response.data);
      } else {
        setSubscriber(null);
      }
    } catch (err) {
      setSubscriber(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthReady]);

  const subscribe = useCallback(async (subscriberData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscribeService(subscriberData);
      if (response && response.data) {
        setSubscriber(response.data);
      }
      return response;
    } catch (err) {
      if (err.message?.includes('Already subscribed')) {
        await fetchSubscriber();
        return { status: 'success', data: subscriber };
      }
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSubscriber, subscriber]);

  const update = useCallback(async (subscriberData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateSubscription(subscriberData);
      if (response && response.data) {
        setSubscriber(response.data);
      }
      return response;
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await unsubscribeService();
      if (response && response.status === 'success') {
        setSubscriber(null);
      }
      return response;
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      fetchSubscriber();
    } else {
      setSubscriber(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchSubscriber, isAuthReady]);

  return {
    subscriber,
    loading,
    error,
    refetch: fetchSubscriber,
    subscribe,
    update,
    unsubscribe
  };
}

export default useSubscriber;
