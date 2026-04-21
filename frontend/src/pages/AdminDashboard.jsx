import React, { useState, useEffect } from 'react';
import { userAPI, bedAPI, inventoryAPI, shiftAPI, analyticsAPI, authAPI } from '../services/api.service';
import AnalyticsChart from '../components/common/AnalyticsChart';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [beds, setBeds] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'beds', 'inventory', 'shifts', 'users'
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [showRegModal, setShowRegModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Form States
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Doctor' });
  const [newBed, setNewBed] = useState({ bedNumber: '', ward: 'General', type: 'General' });
  const [newInv, setNewInv] = useState({ itemName: '', category: 'Pharmacy', stockQuantity: '', unit: 'pcs', threshold: 5 });
  const [newShift, setNewShift] = useState({ staff: '', startTime: '', endTime: '', type: 'Morning', department: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [userRes, bedRes, invRes, shiftRes, analyticsRes] = await Promise.all([
        userAPI.getAll(),
        bedAPI.getAll(),
        inventoryAPI.getAll(),
        shiftAPI.getAll(),
        analyticsAPI.getStats()
      ]);
      setUsers(userRes.data.users || []);
      setBeds(bedRes.data.beds || []);
      setInventory(invRes.data.inventory || []);
      setShifts(shiftRes.data.shifts || []);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await authAPI.register({ ...newUser, lastName: newUser.lastName || '.' });
      setShowRegModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'Doctor' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await bedAPI.create(newBed);
      setShowBedModal(false);
      setNewBed({ bedNumber: '', ward: 'General', type: 'General' });
      fetchData();
    } catch (err) {
      alert('Failed to add bed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await inventoryAPI.create(newInv);
      setShowInvModal(false);
       setNewInv({ itemName: '', category: 'Pharmacy', stockQuantity: '', unit: 'pcs', threshold: 5 });
       fetchData();
    } catch (err) {
       alert('Failed to add inventory');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleScheduleShift = async (e) => {
    e.preventDefault();
    try {
       setIsSubmitting(true);
       await shiftAPI.create(newShift);
       setShowShiftModal(false);
       setNewShift({ staff: '', startTime: '', endTime: '', type: 'Morning', department: 'General' });
       fetchData();
    } catch (err) {
       alert('Failed to schedule shift');
    } finally {
       setIsSubmitting(false);
    }
  };

  const deleteShift = async (id) => {
     if (window.confirm('Delete this shift?')) {
        try {
           await shiftAPI.delete(id);
           fetchData();
        } catch (err) {
           alert('Failed to delete shift');
        }
     }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Operation Central</h1>
          <p className="text-slate-500 font-medium tracking-tight">Control center for HIMS hospital management.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowRegModal(true)} className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined">person_add</span>
              Staff Onboarding
           </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-100 pb-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          System Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('beds')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'beds' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Bed Management
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('shifts')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'shifts' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Staff Rosters
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="clinical-card p-6">
               <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Medical Staff</p>
               <h3 className="text-3xl font-display font-black text-slate-800 mt-2">{users.filter(u => u.role === 'Doctor').length}</h3>
            </div>
            <div className="clinical-card p-6">
               <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Available Beds</p>
               <h3 className="text-3xl font-display font-black text-slate-800 mt-2">{beds.filter(b => b.status === 'Available').length}</h3>
            </div>
            <div className="clinical-card p-6">
               <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Active Shifts</p>
               <h3 className="text-3xl font-display font-black text-slate-800 mt-2">{shifts.length}</h3>
            </div>
            <div className="clinical-card p-6">
               <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Supply Alerts</p>
               <h3 className="text-3xl font-display font-black text-red-500 mt-2">{inventory.filter(i => i.stockQuantity < i.threshold).length}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="clinical-card p-6 border-l-4 border-l-primary">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 italic">Supply Health Distribution</h3>
                <div className="flex gap-4 items-center">
                   <div className="flex-1">
                      <AnalyticsChart 
                        data={analytics?.inventoryHealth?.map(h => ({ _id: h._id ? 'LOW' : 'GOOD', count: h.count }))} 
                        color="#f43f5e" 
                        height={120} 
                      />
                   </div>
                   <div className="w-1/3 space-y-2">
                      {analytics?.inventoryHealth?.map(h => (
                        <div key={h._id} className="flex justify-between items-center text-[10px] font-bold">
                           <span className={h._id ? 'text-red-500' : 'text-emerald-500'}>{h._id ? 'LOW STOCK' : 'OPTIMIZED'}</span>
                           <span className="text-slate-400">{h.count} units</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             <div className="clinical-card p-6 border-l-4 border-l-indigo-400">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 italic">Staff Role Allocation</h3>
                <div className="flex flex-wrap gap-2">
                   {analytics?.userDistribution?.map(u => (
                      <div key={u._id} className="bg-surface px-3 py-1.5 rounded-lg border border-gray-50">
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{u._id}</p>
                         <p className="text-lg font-display font-black text-indigo-600">{u.count}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="clinical-card p-0 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-surface border-b">
                 <tr className="text-[10px] text-gray-400 font-black uppercase">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Joined</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {users.map(u => (
                   <tr key={u._id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-700">{u.firstName} {u.lastName}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === 'Doctor' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                           {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">{u.email}</td>
                      <td className="py-4 px-6 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'beds' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Bed Inventory</h2>
              <button onClick={() => setShowBedModal(true)} className="btn-secondary text-xs">Register New Bed</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {beds.map(bed => (
                <div key={bed._id} className={`clinical-card p-4 border-t-4 ${bed.status === 'Available' ? 'border-t-emerald-400' : 'border-t-red-400'}`}>
                   <p className="text-2xl font-display font-black text-slate-800">{bed.bedNumber}</p>
                   <p className="text-[10px] font-black text-gray-400 uppercase mt-1">{bed.ward} Ward</p>
                   <p className="mt-4 text-[10px] font-bold text-gray-500">{bed.type}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Hospital Pharmacy & Lab Stock</h2>
              <button onClick={() => setShowInvModal(true)} className="btn-secondary text-xs flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">inventory_2</span>
                 Add Item
              </button>
           </div>
           <div className="clinical-card p-0 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-surface border-b">
                    <tr className="text-[10px] text-gray-400 font-black uppercase">
                       <th className="py-4 px-6">Item</th>
                       <th className="py-4 px-6">Category</th>
                       <th className="py-4 px-6">Stock Level</th>
                       <th className="py-4 px-6">Safety Floor</th>
                       <th className="py-4 px-6">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {inventory.map(item => (
                      <tr key={item._id} className="hover:bg-primary/5 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-700">{item.itemName}</td>
                        <td className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">{item.category}</td>
                        <td className="py-4 px-6 font-display font-black text-slate-800">{item.stockQuantity} {item.unit}</td>
                        <td className="py-4 px-6 text-xs text-gray-400">{item.threshold}</td>
                        <td className="py-4 px-6">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.stockQuantity < item.threshold ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                              {item.stockQuantity < item.threshold ? 'Restock Required' : 'Optimal'}
                           </span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Staff Rosters & Scheduling</h2>
              <button onClick={() => setShowShiftModal(true)} className="btn-secondary text-xs flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">event_repeat</span>
                 Schedule Shift
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shifts.map(shift => (
                <div key={shift._id} className="clinical-card p-6 border-t-4 border-t-primary relative group">
                   <button 
                     onClick={() => deleteShift(shift._id)}
                     className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <span className="material-symbols-outlined text-sm">delete</span>
                   </button>
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{shift.type} Shift</p>
                   <h4 className="font-bold text-slate-800 mt-2">{shift.staff?.firstName} {shift.staff?.lastName}</h4>
                   <p className="text-[10px] text-primary font-bold">{shift.department}</p>
                   <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {new Date(shift.startTime).toLocaleString()}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Modals */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="glass-header px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-display">Staff Onboarding</h3>
                 <button onClick={() => setShowRegModal(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleRegister} className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="First Name" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="input-field" required />
                    <input placeholder="Last Name" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="input-field" />
                 </div>
                 <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="input-field" required />
                 <input type="password" placeholder="Temporal Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="input-field" required />
                 <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="input-field">
                    {['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab_Technician', 'Hospital_Admin'].map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
                 <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">Complete Access Grant</button>
              </form>
           </div>
        </div>
      )}

      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="glass-header px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-display">Inventory Entry</h3>
                 <button onClick={() => setShowInvModal(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleAddInventory} className="p-6 space-y-4">
                 <input placeholder="Item Name" value={newInv.itemName} onChange={e => setNewInv({...newInv, itemName: e.target.value})} className="input-field" required />
                 <div className="grid grid-cols-2 gap-4">
                    <select value={newInv.category} onChange={e => setNewInv({...newInv, category: e.target.value})} className="input-field">
                       {['Medicine', 'Lab Supply', 'Surgical', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input placeholder="Stock Quantity" type="number" value={newInv.stockQuantity} onChange={e => setNewInv({...newInv, stockQuantity: e.target.value})} className="input-field" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Unit (pcs, ml, etc)" value={newInv.unit} onChange={e => setNewInv({...newInv, unit: e.target.value})} className="input-field" required />
                    <input placeholder="Low Stock Floor" type="number" value={newInv.threshold} onChange={e => setNewInv({...newInv, threshold: e.target.value})} className="input-field" required />
                 </div>
                 <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">Confirm Entry</button>
              </form>
           </div>
        </div>
      )}

      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="glass-header px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-display">Shift Scheduler</h3>
                 <button onClick={() => setShowShiftModal(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleScheduleShift} className="p-6 space-y-4">
                 <select value={newShift.staff} onChange={e => setNewShift({...newShift, staff: e.target.value})} className="input-field" required>
                    <option value="">Select Staff Member</option>
                    {users.filter(u => u.role !== 'Patient').map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="datetime-local" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} className="input-field" required />
                    <input type="datetime-local" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} className="input-field" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select value={newShift.type} onChange={e => setNewShift({...newShift, type: e.target.value})} className="input-field">
                       <option value="Day">Day</option>
                       <option value="Night">Night</option>
                       <option value="On-Call">On-Call</option>
                    </select>
                    <input placeholder="Department" value={newShift.department} onChange={e => setNewShift({...newShift, department: e.target.value})} className="input-field" required />
                 </div>
                 <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">Publish Roster</button>
              </form>
           </div>
        </div>
      )}

      {showBedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="glass-header px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-display text-slate-800">Register New Bed</h3>
                 <button onClick={() => setShowBedModal(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleAddBed} className="p-6 space-y-4">
                 <input placeholder="Bed Number (e.g. B-101)" value={newBed.bedNumber} onChange={e => setNewBed({...newBed, bedNumber: e.target.value})} className="input-field" required />
                 <select value={newBed.ward} onChange={e => setNewBed({...newBed, ward: e.target.value})} className="input-field">
                    {['General', 'Emergency', 'ICU', 'Pediatrics', 'Maternity'].map(w => <option key={w} value={w}>{w} Ward</option>)}
                 </select>
                 <select value={newBed.type} onChange={e => setNewBed({...newBed, type: e.target.value})} className="input-field">
                    {['Standard', 'ICU', 'Emergency', 'VIP'].map(t => <option key={t} value={t}>{t} Bed</option>)}
                 </select>
                 <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">Confirm Bed Activation</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
