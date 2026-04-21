import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role to redirect path mapping
const ROLE_REDIRECTS = {
  PATIENT: '/dashboard',
  DOCTOR: '/doctor',
  NURSE: '/nurse',
  RECEPTIONIST: '/reception',
  PHARMACIST: '/pharmacy',
  LAB_TECHNICIAN: '/lab',
  ORG_ADMIN: '/org-dashboard',
  SUPER_ADMIN: '/super-admin',
  HOSPITAL_ADMIN: '/admin',
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      const redirectPath = ROLE_REDIRECTS[user.role] || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md clinical-card z-10 p-10 backdrop-blur-3xl bg-white/90">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-4 text-primary">
            <span className="material-symbols-outlined text-5xl">health_and_safety</span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">HIMS<span className="text-primary-container">.</span></h2>
          <p className="mt-2 text-sm text-gray-500 font-medium text-center max-w-xs mx-auto">
            Log in to the Clinical Sanctuary portal.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-start space-x-3">
            <span className="material-symbols-outlined text-accent-error text-lg shrink-0 mt-0.5">error</span>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none"
                placeholder="admin@hims.local"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-600 font-semibold">Password</label>
                <a href="#" className="font-semibold text-sm text-primary hover:text-primary-hover">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in to Dashboard'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an affiliate account?{' '}
            <Link to="/auth/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
