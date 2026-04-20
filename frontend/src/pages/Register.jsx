import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'Patient'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/auth/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[10%] left-[60%] w-[50%] h-[50%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-[40%] right-[60%] w-[40%] h-[40%] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

      <div className="w-full max-w-xl clinical-card z-10 p-10 bg-white">
        <div className="mb-8 flex items-center space-x-4">
          <Link to="/auth/login" className="text-gray-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
            <p className="mt-1 text-sm text-gray-500">Join the HIMS network.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-start space-x-3">
            <span className="material-symbols-outlined text-accent-error text-lg shrink-0 mt-0.5">error</span>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">First Name</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange}
                className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="Arthur" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Last Name</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange}
                className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="Morgan" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 font-semibold mb-2">Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
              className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="arthur@example.com" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 font-semibold mb-2">Role / Affiliation</label>
            <select name="role" value={formData.role} onChange={handleInputChange}
              className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none appearance-none cursor-pointer">
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Lab_Technician">Lab Technician</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 font-semibold mb-2">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleInputChange}
              className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="Create a strong password" />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center text-sm uppercase tracking-wider font-bold shadow-ambient disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Registering...
                </>
              ) : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              Sign in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
