import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.service';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire application and exposes:
 *  - user       : the logged-in user object (or null)
 *  - loading    : true while validating token on first load
 *  - login()    : calls backend, stores token, sets user
 *  - register() : calls backend registration endpoint
 *  - logout()   : clears storage and resets state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate any existing token and restore session
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('hims_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
      } catch {
        // Token is invalid or expired — clear storage
        localStorage.removeItem('hims_token');
        localStorage.removeItem('hims_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('hims_token', data.token);
    localStorage.setItem('hims_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hims_token');
    localStorage.removeItem('hims_user');
    setUser(null);
  };

  const refreshUserSession = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem('hims_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user session:', error);
      // If we get 401 Unauthorized, we should probably logout
      if (error.response?.status === 401) {
        logout();
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Custom hook for easy consumption across components */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
};
