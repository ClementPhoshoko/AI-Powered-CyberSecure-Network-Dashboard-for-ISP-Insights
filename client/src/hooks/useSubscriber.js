import { useState, useEffect, useCallback } from 'react';
import { getSubscriber, subscribe as subscribeService, updateSubscription, unsubscribe as unsubscribeService } from '../services/subscriberService';
import { getFriendlyErrorMessage } from '../services/errorUtils';

export function useSubscriber(isAuthReady = true) {
  const [subscriber, setSubscriber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriber = useCallback(async () => {
    if (!isAuthReady) {
      console.log('useSubscriber: auth not ready');
      return;
    }
    try {
      console.log('useSubscriber: fetching subscriber');
      setLoading(true);
      setError(null);
      const response = await getSubscriber();
      console.log('useSubscriber: got response:', response);
      // response is { status: 'success', data: subscriber }
      if (response && response.data !== undefined && response.data !== null) {
        setSubscriber(response.data);
        console.log('useSubscriber: set subscriber:', response.data);
      } else {
        setSubscriber(null);
        console.log('useSubscriber: no subscriber found, set to null');
      }
    } catch (err) {
      console.error('Failed to fetch subscriber:', err);
      // Don't set error for 404 (not subscribed yet)
      setSubscriber(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthReady]);

  const subscribe = useCallback(async (subscriberData) => {
    try {
      console.log('useSubscriber: subscribing with data:', subscriberData);
      setLoading(true);
      setError(null);
      const response = await subscribeService(subscriberData);
      console.log('useSubscriber: subscribe response:', response);
      if (response && response.data) {
        setSubscriber(response.data);
        console.log('useSubscriber: set subscriber after subscribe:', response.data);
      }
      return response;
    } catch (err) {
      console.error('Failed to subscribe:', err);
      // If already subscribed, refetch to get the existing subscriber
      if (err.message?.includes('Already subscribed')) {
        console.log('useSubscriber: already subscribed, refetching...');
        await fetchSubscriber();
        // Don't set error or throw in this case
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
      console.log('useSubscriber: updating subscription with data:', subscriberData);
      setLoading(true);
      setError(null);
      const response = await updateSubscription(subscriberData);
      console.log('useSubscriber: update response:', response);
      if (response && response.data) {
        setSubscriber(response.data);
      }
      return response;
    } catch (err) {
      console.error('Failed to update subscription:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      console.log('useSubscriber: unsubscribing');
      setLoading(true);
      setError(null);
      const response = await unsubscribeService();
      console.log('useSubscriber: unsubscribe response:', response);
      if (response && response.status === 'success') {
        setSubscriber(null);
        console.log('useSubscriber: set subscriber to null after unsubscribe');
      }
      return response;
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('useSubscriber: useEffect running, isAuthReady:', isAuthReady);
    if (isAuthReady) {
      fetchSubscriber();
    } else {
      // Reset state when not authenticated
      console.log('useSubscriber: resetting state');
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
