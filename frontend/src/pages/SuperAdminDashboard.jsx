import React, { useState, useEffect } from 'react';
import { superAdminAPI, userAPI, analyticsAPI } from '../services/api.service';
import AnalyticsChart from '../components/common/AnalyticsChart';

export const SuperAdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'logs', 'users'
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, logsRes, usersRes, analyticsRes] = await Promise.all([
        superAdminAPI.getStats(),
        superAdminAPI.getLogs(),
        userAPI.getAll(),
        analyticsAPI.getStats()
      ]);
      setStats(statsRes.data.stats);
      setLogs(logsRes.data.logs || []);
      setUsers(usersRes.data.users || []);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error fetching superadmin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading && !stats) return <div className="p-20 text-center font-display font-black text-primary animate-pulse italic">Accessing System Core...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="clinical-card p-6 bg-slate-900 text-white border-none shadow-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Revenue</p>
            <h3 className="text-4xl font-display font-black mt-2">${stats?.totalRevenue?.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-accent-emerald font-bold">
               <span className="material-symbols-outlined text-sm">trending_up</span> +8.2% from last month
            </div>
         </div>
         <div className="clinical-card p-6 border-l-4 border-l-primary">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active nodes</p>
            <h3 className="text-4xl font-display font-black text-slate-800 mt-2">{stats?.activePatients + stats?.doctorsOnStaff}</h3>
            <p className="text-[10px] text-gray-500 mt-4 font-medium uppercase tracking-tighter">Total registered entities across modules</p>
         </div>
         <div className="clinical-card p-6 border-l-4 border-l-accent-emerald">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">System Health</p>
            <h3 className="text-4xl font-display font-black text-slate-800 mt-2">100%</h3>
            <div className="mt-4 flex items-center gap-2">
               {['API', 'DB', 'Auth', 'File'].map(node => (
                 <span key={node} className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-400">{node}</span>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="clinical-card p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Revenue Velocity (30 Days)</h3>
            <AnalyticsChart data={analytics?.revenueTrend} color="#0ea5e9" />
         </div>
         <div className="clinical-card p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Consultation Volume Trend</h3>
            <AnalyticsChart data={analytics?.appointmentVolume} color="#6366f1" />
         </div>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-100 pb-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Audit Logs
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Identity Access
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="clinical-card p-0 overflow-hidden">
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
      ) : (
        <div className="clinical-card p-0 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-surface border-b">
                 <tr className="text-[10px] text-gray-400 font-black uppercase">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {users.map(u => (
                   <tr key={u._id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-700">{u.firstName} {u.lastName}</td>
                      <td className="py-4 px-6">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === 'Super_Admin' ? 'bg-accent-rose/10 text-accent-rose' : 'bg-slate-100 text-slate-600'}`}>
                            {u.role}
                         </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">{u.email}</td>
                      <td className="py-4 px-6">
                         <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-accent-emerald">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
                            Active
                         </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                         <button className="text-gray-400 hover:text-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-sm">more_vert</span>
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
