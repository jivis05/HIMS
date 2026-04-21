import { useState, useEffect, useCallback } from 'react';

/**
 * useAutoRefresh hook
 * Enforces automatic fetching of data on mount and dependency changes.
 * Ensures consistent loading, empty, and error states across the UI.
 * 
 * @param {Function} fetchFn - The API call function that returns data
 * @param {Array} dependencies - Array of dependencies to trigger refetch
 * @returns {Object} { data, isLoading, error, refetch, isEmpty }
 */
export const useAutoRefresh = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('AutoRefresh Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // Re-run when dependencies change

  const isEmpty = !data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    isEmpty
  };
};

export default useAutoRefresh;
