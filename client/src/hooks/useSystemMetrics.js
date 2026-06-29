import { useState, useEffect, useCallback } from 'react';
import { getSystemMetrics, refreshSystemMetrics } from '../services/systemMetricsService';

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState({
    total_users: 0,
    countries_count: 0,
    uptime_percentage: 0,
    founded_year: 2026
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async (shouldRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = shouldRefresh ? await refreshSystemMetrics() : await getSystemMetrics();
      setMetrics(response.data);
    } catch (err) {
      console.error('Failed to fetch system metrics:', err);
      setError('Failed to load metrics');
      // On error, set uptime to 0% (server offline)
      setMetrics(prev => ({
        ...prev,
        uptime_percentage: 0
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: () => fetchMetrics(true)
  };
}

export default useSystemMetrics;
