import React, { useState } from 'react';
import { orgAPI } from '../services/api.service';
import useAutoRefresh from '../hooks/useAutoRefresh';
import useMutation from '../hooks/useMutation';

export const StaffManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', specialty: ''
  });
  const [success, setSuccess] = useState('');

  const fetchStaffData = async () => {
    const [staffRes, orgRes] = await Promise.all([
      orgAPI.getStaff(),
      orgAPI.getProfile()
    ]);
    return {
      staff: staffRes.data.staff || [],
      org: orgRes.data.organization
    };
  };

  const { data, isLoading, error: fetchError, refetch } = useAutoRefresh(fetchStaffData);
  const { handleMutation, isLoading: isMutating, error: mutationError } = useMutation();

  const staff = data?.staff || [];
  const org = data?.org || null;
  const error = fetchError || mutationError;

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!org?.isVerified) {
      // Technically, button is disabled anyway
      return;
    }
    setSuccess('');
    
    await handleMutation(
      () => orgAPI.createStaff(newStaff),
      {
        refetch: refetch,
        onSuccess: (responseData) => {
          setSuccess(responseData.message || 'Staff created successfully');
          setNewStaff({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', specialty: '' });
          setShowAddModal(false);
        }
      }
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">Synchronizing Staff Records...</p>
      </div>
    );
  }

  const isVerified = org?.isVerified;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tighter">Staff Management</h1>
          <p className="text-slate-500 font-medium">Manage clinical and administrative team for {org?.name}.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isVerified ? 'bg-accent-emerald/10' : 'bg-accent-amber/10'}`}>
            <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-accent-emerald' : 'bg-accent-amber animate-pulse'}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isVerified ? 'text-accent-emerald' : 'text-accent-amber'}`}>
              {isVerified ? 'Verified Facility' : 'Pending Verification'}
            </span>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={!isVerified}
            className={`btn-primary flex items-center space-x-2 px-6 py-2.5 shadow-lg transition-all ${!isVerified ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-primary/20'}`}
          >
            <span className="material-symbols-outlined">person_add</span>
            <span className="font-bold uppercase tracking-widest text-[10px]">Onboard Staff</span>
          </button>
        </div>
      </header>

      {!isVerified && (
        <div className="bg-accent-amber/5 border border-accent-amber/20 rounded-2xl p-6 flex gap-4 items-start animate-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/20 flex items-center justify-center flex-shrink-0 text-accent-amber">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <h3 className="text-accent-amber font-black uppercase text-xs tracking-widest mb-1">Verification Required</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your organization is currently under review by our medical board. <strong>Staff creation is disabled</strong> until your facility is verified. 
              This typically takes 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center space-x-3 text-red-700">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium text-sm">{error}</p>
          <button onClick={fetchData} className="ml-auto underline text-xs font-bold hover:text-red-900">Retry</button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 flex items-center animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined mr-2">check_circle</span>
          <p className="font-bold text-sm uppercase tracking-tight">{success}</p>
        </div>
      )}

      <div className="clinical-card bg-white overflow-hidden border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface border-b">
              <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Clinical Specialty</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member) => (
                <tr key={member._id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.firstName} {member.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      member.role === 'DOCTOR' ? 'bg-blue-50 text-blue-700' :
                      member.role === 'NURSE' ? 'bg-emerald-50 text-emerald-700' :
                      member.role === 'RECEPTIONIST' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                    {member.specialty ? (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary/40">medical_services</span>
                        {member.specialty}
                      </span>
                    ) : <span className="text-gray-300 italic">Non-clinical</span>}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-lg">edit_note</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-accent-error transition-all">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {staff.length === 0 && !error && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-gray-200">group_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Facility Roster Empty</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">You haven't onboarded any staff members to your organization yet.</p>
            {isVerified && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-8 px-8 py-3 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                Onboard First Staff Member
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-surface px-8 py-6 flex justify-between items-center border-b border-gray-50">
              <div>
                <h2 className="text-xl font-display font-black text-slate-900 flex items-center tracking-tight">
                  <span className="material-symbols-outlined mr-3 text-primary bg-primary/10 p-2 rounded-xl">person_add</span>
                  Staff Onboarding
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identity Management Console</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateStaff} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input type="text" required value={newStaff.firstName} 
                    onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                    placeholder="John"
                    className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent font-medium text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input type="text" required value={newStaff.lastName} 
                    onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                    placeholder="Doe"
                    className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent font-medium text-slate-700" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                <input type="email" required value={newStaff.email} 
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  placeholder="john.doe@hospital.com"
                  className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent font-medium text-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Organizational Role</label>
                  <select value={newStaff.role} 
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent font-bold text-slate-700 cursor-pointer appearance-none">
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                  <input type="password" required value={newStaff.password} 
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent font-medium text-slate-700" />
                </div>
              </div>

              {newStaff.role === 'DOCTOR' && (
                <div className="animate-in slide-in-from-left-2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization</label>
                  <input type="text" value={newStaff.specialty} 
                    onChange={(e) => setNewStaff({...newStaff, specialty: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent font-medium text-slate-700" placeholder="e.g. Cardiology" />
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95">
                  Initialize Staff Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
