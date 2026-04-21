import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useMutation hook
 * Handles API mutations with automatic refetching and session synchronization.
 * Enforces the rule that UI must reflect backend truth immediately after actions.
 */
export const useMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshUserSession } = useAuth();

  const handleMutation = async (apiCall, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      
      // If mutation affects the current user's profile/auth state
      if (options.refreshSession) {
        await refreshUserSession();
      }

      // If mutation affects a list or dashboard data
      if (options.refetch) {
        if (Array.isArray(options.refetch)) {
            await Promise.all(options.refetch.map(fn => fn()));
        } else if (typeof options.refetch === 'function') {
            await options.refetch();
        }
      }
      
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during mutation';
      setError(errorMessage);
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleMutation, isLoading, error };
};

export default useMutation;
