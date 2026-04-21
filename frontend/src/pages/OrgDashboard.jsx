import React from 'react';
import { orgAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import useAutoRefresh from '../hooks/useAutoRefresh';

export const OrgDashboard = () => {
  const { user } = useAuth();

  const fetchOrgProfile = async () => {
    const response = await orgAPI.getProfile();
    return response.data.organization;
  };

  const { data: org, isLoading, error } = useAutoRefresh(fetchOrgProfile);

  if (isLoading && !org) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Organization Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="clinical-card p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Verification Status</h3>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${org?.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className={`font-bold ${org?.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
              {org?.isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
          {!org?.isVerified && (
            <p className="mt-2 text-xs text-amber-600 italic">
              Your organization must be verified by a system admin before you can create staff.
            </p>
          )}
        </div>

        <div className="clinical-card p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Facility Type</h3>
          <p className="text-2xl font-bold text-primary">{org?.type}</p>
        </div>

        <div className="clinical-card p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Staff Members</h3>
          <p className="text-2xl font-bold text-gray-900">Manage via Staff Portal</p>
        </div>
      </div>

      <div className="clinical-card p-8 bg-white mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="material-symbols-outlined mr-2">business</span>
          Facility Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Organization Name</label>
            <p className="text-lg font-medium text-gray-900 mb-4">{org?.name}</p>
            
            <label className="text-xs font-bold text-gray-400 uppercase">Contact Email</label>
            <p className="text-lg font-medium text-gray-900 mb-4">{org?.email}</p>
            
            <label className="text-xs font-bold text-gray-400 uppercase">Contact Phone</label>
            <p className="text-lg font-medium text-gray-900 mb-4">{org?.phone}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
            <p className="text-lg font-medium text-gray-900">
              {org?.address?.street}<br />
              {org?.address?.city}, {org?.address?.state} {org?.address?.zip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
