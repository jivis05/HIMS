import React, { useState, useEffect } from 'react';
import { bloodBankAPI } from '../services/api.service';

export const BloodBankDashboard = () => {
  const [stock, setStock] = useState([]);
  const [donors, setDonors] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'donors'
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Form States
  const [donorData, setDonorData] = useState({
    name: '', bloodGroup: 'O+', phone: '', email: '', units: 1
  });
  const [updateData, setUpdateData] = useState({ units: '', action: 'add' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stockRes, donorsRes] = await Promise.all([
        bloodBankAPI.getStock(),
        bloodBankAPI.getDonors()
      ]);
      setStock(stockRes.data.stock || []);
      setDonors(donorsRes.data.donors || []);
    } catch (error) {
      console.error('Error fetching blood bank data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await bloodBankAPI.addDonor(donorData);
      setShowDonorModal(false);
      setDonorData({ name: '', bloodGroup: 'O+', phone: '', email: '', units: 1 });
      alert('Donor registered and stock updated!');
      fetchData();
    } catch (error) {
      console.error('Failed to add donor', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await bloodBankAPI.updateStock({ 
        bloodGroup: selectedGroup.bloodGroup, 
        units: updateData.units, 
        action: updateData.action 
      });
      setShowUpdateModal(false);
      setUpdateData({ units: '', action: 'add' });
      alert('Stock updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to update stock', error);
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-800">Blood Bank Command</h1>
          <p className="text-slate-500">Monitor life-saving supplies and donor records.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowDonorModal(true)} 
             className="btn-primary flex items-center gap-2"
           >
             <span className="material-symbols-outlined">volunteer_activism</span>
             Register Donation
           </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-100 pb-1">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Blood Inventory
        </button>
        <button 
          onClick={() => setActiveTab('donors')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'donors' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Donor Registry
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {stock.map(item => (
             <div key={item._id} className="clinical-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-black text-xl">
                      {item.bloodGroup}
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Units</p>
                      <p className={`text-3xl font-display font-black ${item.units < item.threshold ? 'text-red-500' : 'text-slate-800'}`}>
                        {item.units}
                      </p>
                   </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-50 flex justify-between items-center">
                   <span className={`text-[10px] font-bold uppercase ${item.units < item.threshold ? 'text-red-400 animate-pulse' : 'text-accent-emerald'}`}>
                      {item.units < item.threshold ? 'Low Stock' : 'Optimized'}
                   </span>
                   <button 
                     onClick={() => { setSelectedGroup(item); setShowUpdateModal(true); }}
                     className="text-primary text-xs font-bold hover:underline"
                   >
                     Adjust Stock
                   </button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="clinical-card p-0 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-surface border-b">
                 <tr className="text-xs text-gray-500 font-black uppercase tracking-wider">
                    <th className="py-4 px-6">Donor Name</th>
                    <th className="py-4 px-6">Group</th>
                    <th className="py-4 px-6">Last Donation</th>
                    <th className="py-4 px-6">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {donors.map(donor => (
                   <tr key={donor._id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-700">{donor.name}</td>
                      <td className="py-4 px-6 font-black text-red-500">{donor.bloodGroup}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{new Date(donor.lastDonationDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                         <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-black uppercase">Active Donor</span>
                      </td>
                   </tr>
                 ))}
                 {donors.length === 0 && (
                   <tr><td colSpan="4" className="py-20 text-center text-gray-400 italic">No donors registered yet.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      )}

      {/* Modals */}
      {showDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="glass-header px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-display">Register Donation</h3>
                 <button onClick={() => setShowDonorModal(false)} className="text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <form onSubmit={handleDonorSubmit} className="p-6 space-y-4">
                 <input placeholder="Donor Name" value={donorData.name} onChange={e => setDonorData({...donorData, name: e.target.value})} className="input-field" required />
                 <div className="grid grid-cols-2 gap-4">
                    <select value={donorData.bloodGroup} onChange={e => setDonorData({...donorData, bloodGroup: e.target.value})} className="input-field" required>
                       {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <input placeholder="Units Donated" type="number" value={donorData.units} onChange={e => setDonorData({...donorData, units: e.target.value})} className="input-field" required />
                 </div>
                 <input placeholder="Phone Number" value={donorData.phone} onChange={e => setDonorData({...donorData, phone: e.target.value})} className="input-field" required />
                 <input type="email" placeholder="Email (Optional)" value={donorData.email} onChange={e => setDonorData({...donorData, email: e.target.value})} className="input-field" />
                 <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setShowDonorModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary tracking-wide">Complete Donation</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showUpdateModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="glass-header px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-display">Adjust {selectedGroup.bloodGroup} Stock</h3>
                 <button onClick={() => setShowUpdateModal(false)} className="text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
                 <div className="flex gap-2 p-1 bg-surface rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setUpdateData({...updateData, action: 'add'})}
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${updateData.action === 'add' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                    >
                      ADD UNITS
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUpdateData({...updateData, action: 'subtract'})}
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${updateData.action === 'subtract' ? 'bg-white shadow-sm text-accent-rose' : 'text-gray-400'}`}
                    >
                      REMOVE UNITS
                    </button>
                 </div>
                 <input 
                   placeholder="Enter quantity..." 
                   type="number" 
                   value={updateData.units} 
                   onChange={e => setUpdateData({...updateData, units: e.target.value})} 
                   className="input-field text-center text-xl font-bold" 
                   required 
                 />
                 <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setShowUpdateModal(false)} className="btn-secondary text-xs">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary text-xs">Update Supply</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BloodBankDashboard;
