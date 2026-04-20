import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps any dashboard route. If not authenticated, redirects to /auth/login.
 * Optionally accepts `allowedRoles` to further restrict access by role.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While AuthContext validates the token, show a loading pulse
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
        </div>
        <p className="text-sm text-gray-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  // Not logged in → send to login, preserving the desired path for after auth
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Logged in but not the right role → 403 Forbidden view
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4 p-8">
        <span className="material-symbols-outlined text-6xl text-accent-error">gpp_bad</span>
        <h1 className="text-2xl font-display font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500 text-center max-w-sm">
          Your account role (<strong>{user.role}</strong>) does not have permission to access this page.
        </p>
        <button onClick={() => window.history.back()} className="btn-primary px-6 py-2 text-sm mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return children;
};
