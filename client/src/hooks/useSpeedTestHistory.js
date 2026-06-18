import { useState, useEffect, useCallback } from 'react';
import { getPingHistory } from '../services/pingService';

export function useSpeedTestHistory(limit = 20, offset = 0) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get ping history as the main test result container
      const pingResponse = await getPingHistory(limit, offset);
      
      if (pingResponse.data) {
        setHistory(pingResponse.data);
        setTotal(pingResponse.pagination?.total || pingResponse.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch test history:', err);
      setError(err.message || 'Failed to fetch test history');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    total,
    refetch: fetchHistory
  };
}

export default useSpeedTestHistory;
