import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const OrgRegister = () => {
  const [formData, setFormData] = useState({
    orgName: '', 
    orgType: 'HOSPITAL', 
    orgEmail: '', 
    orgPhone: '',
    orgAddress: { street: '', city: '', state: '', zip: '' },
    adminFirstName: '', 
    adminLastName: '', 
    adminEmail: '', 
    adminPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await axios.post('/api/org/register', formData);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('orgAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        orgAddress: { ...prev.orgAddress, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[10%] left-[60%] w-[50%] h-[50%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-[40%] right-[60%] w-[40%] h-[40%] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

      <div className="w-full max-w-2xl clinical-card z-10 p-10 bg-white">
        <div className="mb-8 flex items-center space-x-4">
          <Link to="/auth/login" className="text-gray-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Organization Enrollment</h2>
            <p className="mt-1 text-sm text-gray-500">Register your hospital, clinic, or pharmacy.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-start space-x-3">
            <span className="material-symbols-outlined text-accent-error text-lg shrink-0 mt-0.5">error</span>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 flex items-start space-x-3">
            <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
            <p className="text-sm text-emerald-700 font-medium">{success} Redirecting to login...</p>
          </div>
        )}

        <form className="space-y-8" onSubmit={handleRegister}>
          {/* Organization Details Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">1. Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Organization Name</label>
                <input type="text" name="orgName" required value={formData.orgName} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="City General Hospital" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Facility Type</label>
                <select name="orgType" value={formData.orgType} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none appearance-none cursor-pointer">
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="LAB">Laboratory</option>
                  <option value="PHARMACY">Pharmacy</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Business Email</label>
                <input type="email" name="orgEmail" required value={formData.orgEmail} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="admin@hospital.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Contact Phone</label>
                <input type="text" name="orgPhone" required value={formData.orgPhone} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </section>

          {/* Admin Details Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">2. Primary Administrator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">First Name</label>
                <input type="text" name="adminFirstName" required value={formData.adminFirstName} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="Arthur" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Last Name</label>
                <input type="text" name="adminLastName" required value={formData.adminLastName} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="Morgan" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Admin Email</label>
                <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="admin@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-semibold mb-2">Admin Password</label>
                <input type="password" name="adminPassword" required value={formData.adminPassword} onChange={handleInputChange}
                  className="w-full px-4 py-3 border-none bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 transition-all outline-none" placeholder="••••••••" />
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button type="submit" disabled={isLoading}
              className="w-full btn-primary py-4 flex justify-center items-center text-sm uppercase tracking-wider font-bold shadow-ambient disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Processing...' : 'Register Organization & Admin'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an organization?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              Sign in to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrgRegister;
