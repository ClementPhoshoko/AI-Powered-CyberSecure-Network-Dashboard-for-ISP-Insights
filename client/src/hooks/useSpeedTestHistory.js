import { useState, useEffect, useCallback } from 'react';
import { getPingHistory } from '../services/pingService';

export function useSpeedTestHistory(limit = 10, offset = 0, filters = {}) {
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
      setError(err.message || 'Failed to fetch test history');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, filters]);

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
