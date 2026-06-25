import { useState, useEffect, useCallback } from 'react';
import { getPingHistory } from '../services/pingService';
import { getFriendlyErrorMessage } from '../services/errorUtils';

export function useSpeedTestHistory(limit = 10, offset = 0, filters = {}, isAuthReady = true) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pingResponse = await getPingHistory(limit, offset, filters);
      
      if (pingResponse.data) {
        setHistory(pingResponse.data);
        setTotal(pingResponse.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch test history:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit, offset, filters]);

  useEffect(() => {
    if (isAuthReady) {
      fetchHistory();
    }
  }, [fetchHistory, isAuthReady]);

  return {
    history,
    loading,
    error,
    total,
    refetch: fetchHistory
  };
}

export default useSpeedTestHistory;
