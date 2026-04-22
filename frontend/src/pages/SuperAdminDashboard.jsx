import React, { useState, useEffect } from 'react';
import { superAdminAPI, userAPI, analyticsAPI } from '../services/api.service';
import AnalyticsChart from '../components/common/AnalyticsChart';

export const SuperAdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orgs', 'logs', 'users'
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await superAdminAPI.getStats();
      const nexusData = res.data.data;
      
      setStats(nexusData.stats || {});
      setLogs(nexusData.logs || []);
      setUsers(nexusData.users || []);
      setOrgs(nexusData.orgs || []);
      // Optional: if analytics are still separate, keep them, but here we merged them
      setAnalytics(nexusData.analytics || null);
    } catch (error) {
      console.error('Error fetching superadmin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (id) => {
    setActionLoading(id);
    try {
      await superAdminAPI.verifyOrg(id);
      await fetchData(); // Refresh
    } catch (error) {
      alert('Verification failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this organization?')) return;
    setActionLoading(id);
    try {
      await superAdminAPI.rejectOrg(id);
      await fetchData(); // Refresh
    } catch (error) {
      alert('Rejection failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading && !stats) return <div className="p-20 text-center font-display font-black text-primary animate-pulse italic text-2xl uppercase tracking-tighter">Initializing System Nexus...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tighter">System Nexus</h1>
          <p className="text-slate-500 font-medium">Root level access to HIMS infrastructure.</p>
        </div>
        <div className="bg-accent-emerald/10 px-4 py-2 rounded-full flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping"></span>
           <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="clinical-card p-6 bg-slate-900 text-white border-none shadow-2xl hover:translate-y-[-4px] transition-all duration-300">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Users</p>
            <h3 className="text-3xl font-display font-black mt-2">{Number(stats?.totalUsers) || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-accent-emerald font-bold">
               <span className="material-symbols-outlined text-sm">group</span> Global Directory
            </div>
         </div>
         <div className="clinical-card p-6 border-l-4 border-l-primary hover:shadow-xl transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Appointments</p>
            <h3 className="text-3xl font-display font-black text-slate-800 mt-2">{Number(stats?.totalAppointments) || 0}</h3>
            <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-tighter">Doctor + Lab Tests</p>
         </div>
         <div className="clinical-card p-6 border-l-4 border-l-accent-indigo hover:shadow-xl transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Organizations</p>
            <h3 className="text-3xl font-display font-black text-slate-800 mt-2">{Number(stats?.totalOrgs) || 0}</h3>
            <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-tighter">Hospitals, Clinics, Labs</p>
         </div>
         <div className="clinical-card p-6 border-l-4 border-l-accent-emerald hover:shadow-xl transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">System Health</p>
            <h3 className="text-3xl font-display font-black text-slate-800 mt-2">100%</h3>
            <div className="mt-4 flex items-center gap-2">
               {['API', 'DB', 'Auth', 'File'].map(node => (
                 <span key={node} className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-400">{node}</span>
               ))}
            </div>
         </div>
      </div>

      <div className="flex items-center gap-8 border-b border-gray-100">
        {['overview', 'users', 'orgs', 'logs'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-1 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'orgs' ? 'Organizations' : tab === 'overview' ? 'Operational Health' : tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="clinical-card p-8">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Revenue Velocity (30 Days)
              </h3>
              <AnalyticsChart data={analytics?.revenueTrend} color="#0ea5e9" />
           </div>
           <div className="clinical-card p-8">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-indigo"></span>
                Consultation Volume Trend
              </h3>
              <AnalyticsChart data={analytics?.appointmentVolume} color="#6366f1" />
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="clinical-card p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 border-b border-gray-50 bg-surface/30">
              <h3 className="font-bold text-slate-900">Global User Directory</h3>
              <p className="text-xs text-gray-500">All registered users across all organizations.</p>
           </div>
           <table className="w-full text-left text-sm">
             <thead className="bg-surface text-gray-500 text-xs uppercase tracking-widest">
               <tr>
                 <th className="p-4 font-bold">User</th>
                 <th className="p-4 font-bold">Role</th>
                 <th className="p-4 font-bold">Organization</th>
                 <th className="p-4 font-bold">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {users.map(user => (
                 <tr key={user._id} className="hover:bg-primary/5 transition-colors">
                   <td className="p-4">
                     <div className="font-bold text-slate-800">{user.firstName} {user.lastName}</div>
                     <div className="text-xs text-gray-400">{user.email}</div>
                   </td>
                   <td className="p-4 font-bold text-slate-600">{user.role}</td>
                   <td className="p-4 text-xs font-bold text-primary">{user.organizationId?.name || 'Global'}</td>
                   <td className="p-4">
                     {user.isActive ? <span className="text-xs text-accent-emerald font-black uppercase">Active</span> : <span className="text-xs text-red-500 font-black uppercase">Inactive</span>}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'orgs' && (
        <div className="clinical-card p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-surface/30">
              <div>
                <h3 className="font-bold text-slate-900">Organization Verification</h3>
                <p className="text-xs text-gray-500 mt-1">Review and approve facility registrations</p>
              </div>
              <button onClick={fetchData} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-xl">refresh</span>
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-surface border-b">
                    <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                       <th className="py-4 px-6">Organization</th>
                       <th className="py-4 px-6">Type</th>
                       <th className="py-4 px-6">Admin Identity</th>
                       <th className="py-4 px-6">Status</th>
                       <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {orgs.map(org => (
                      <tr key={org._id} className="hover:bg-primary/5 transition-colors group">
                        <td className="py-5 px-6">
                           <div className="font-bold text-slate-900">{org.name}</div>
                           <div className="text-[10px] text-gray-500 font-medium">{org.email}</div>
                        </td>
                        <td className="py-5 px-6">
                           <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-600 tracking-wider">{org.type}</span>
                        </td>
                        <td className="py-5 px-6">
                           <div className="text-xs font-bold text-slate-700">{org.admin?.firstName} {org.admin?.lastName}</div>
                           <div className="text-[10px] text-gray-400 font-medium">{org.admin?.email}</div>
                        </td>
                        <td className="py-5 px-6">
                           <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center w-fit gap-1.5 ${
                             org.verificationStatus === 'APPROVED' ? 'bg-accent-emerald/10 text-accent-emerald' : 
                             org.verificationStatus === 'REJECTED' ? 'bg-accent-rose/10 text-accent-rose' : 
                             'bg-accent-amber/10 text-accent-amber'
                           }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                org.verificationStatus === 'APPROVED' ? 'bg-accent-emerald' : 
                                org.verificationStatus === 'REJECTED' ? 'bg-accent-rose' : 
                                'bg-accent-amber animate-pulse'
                              }`}></span>
                              {org.verificationStatus}
                           </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                           {org.verificationStatus === 'PENDING' ? (
                             <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleVerify(org._id)}
                                  disabled={actionLoading === org._id}
                                  className="h-8 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                  {actionLoading === org._id ? '...' : 'Verify'}
                                </button>
                                <button 
                                  onClick={() => handleReject(org._id)}
                                  disabled={actionLoading === org._id}
                                  className="h-8 px-4 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-50"
                                >
                                  {actionLoading === org._id ? '...' : 'Reject'}
                                </button>
                             </div>
                           ) : (
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Managed</span>
                           )}
                        </td>
                      </tr>
                    ))}
                    {orgs.length === 0 && (
                      <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">No organizations found in registry.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="clinical-card p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-surface/30">
              <h3 className="font-bold text-slate-800">Operational Audit Trail</h3>
              <button onClick={fetchData} className="material-symbols-outlined text-gray-400 hover:text-primary transition-colors">refresh</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-surface border-b">
                    <tr className="text-[10px] text-gray-400 font-black uppercase">
                       <th className="py-4 px-6">Timestamp</th>
                       <th className="py-4 px-6">Identity</th>
                       <th className="py-4 px-6">Action</th>
                       <th className="py-4 px-6">Resource</th>
                       <th className="py-4 px-6">Severity</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {logs.map(log => (
                      <tr key={log._id} className="hover:bg-primary/5 transition-colors group">
                        <td className="py-4 px-6 text-[10px] font-mono text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-6">
                           <div className="text-xs font-bold text-slate-700">{log.user?.firstName} {log.user?.lastName}</div>
                           <div className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{log.user?.role}</div>
                        </td>
                        <td className="py-4 px-6">
                           <span className="text-[10px] font-black text-slate-800 uppercase group-hover:text-primary transition-colors">{log.action}</span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">{log.resource}</td>
                        <td className="py-4 px-6">
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${log.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                               {log.severity}
                           </span>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">No activity logs recorded.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="clinical-card p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <table className="w-full text-left">
              <thead className="bg-surface border-b">
                 <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <th className="py-4 px-6">Identity</th>
                    <th className="py-4 px-6">Standardized Role</th>
                    <th className="py-4 px-6">Access Status</th>
                    <th className="py-4 px-6 text-right">Verification</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {users.map(u => (
                   <tr key={u._id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-5 px-6">
                        <div className="font-bold text-slate-900">{u.firstName} {u.lastName}</div>
                        <div className="text-[10px] text-gray-500">{u.email}</div>
                      </td>
                      <td className="py-5 px-6">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                           u.role === 'SUPER_ADMIN' ? 'bg-accent-rose/10 text-accent-rose' : 
                           u.role === 'ORG_ADMIN' ? 'bg-primary/10 text-primary' :
                           'bg-slate-100 text-slate-600'
                         }`}>
                            {u.role.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="py-5 px-6">
                         <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-accent-emerald">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
                            Verified
                         </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                         <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors ml-auto">
                            <span className="material-symbols-outlined text-lg text-gray-400">shield_with_heart</span>
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
