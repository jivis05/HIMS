import React, { useState, useEffect } from 'react';
import { prescriptionAPI } from '../services/api.service';
import { inventoryAlerts } from '../data/mockData';

export const PharmacyDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true);
      const res = await prescriptionAPI.getAll();
      setPrescriptions(res.data.prescriptions || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleDispense = async (id) => {
    try {
      await prescriptionAPI.dispense(id);
      fetchPrescriptions();
      alert('Medication marked as dispensed.');
    } catch (error) {
      console.error('Failed to dispense', error);
      alert('Failed to dispense medication.');
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx._id.includes(searchQuery) ||
    rx.patient?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.patient?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingCount = prescriptions.filter(rx => rx.status === 'Active').length;
  const dispensedCount = prescriptions.filter(rx => rx.status === 'Dispensed').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="clinical-card p-6 bg-gradient-to-br from-white to-surface-container-low border border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">Prescription Processing</h2>
            <p className="text-gray-500 mt-1">Search by Patient Name, Medication, or RX-ID.</p>
          </div>
          <div className="flex-1 w-full relative max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search term..." 
              className="input-field pl-12 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clinical-card p-6 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-sm font-medium text-gray-500">Pending Fulfillment</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-display font-extrabold text-gray-900">{pendingCount}</span>
            </div>
          </div>
          <div className="clinical-card p-6 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-sm font-medium text-gray-500">Dispensed Today</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-display font-extrabold text-gray-900">{dispensedCount}</span>
            </div>
          </div>
          <div className="clinical-card p-6 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-display font-extrabold text-gray-900">{inventoryAlerts.length}</span>
              <span className="material-symbols-outlined text-accent-error bg-red-50 p-1.5 rounded-md">warning</span>
            </div>
          </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 clinical-card p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-display">Fulfillment Queue</h3>
            <button onClick={fetchPrescriptions} className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium px-2">Patient</th>
                  <th className="pb-3 font-medium px-2">Medication</th>
                  <th className="pb-3 font-medium px-2">Doctor</th>
                  <th className="pb-3 font-medium px-2">Status</th>
                  <th className="pb-3 font-medium text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading prescriptions...</td></tr>
                ) : filteredPrescriptions.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No prescriptions found.</td></tr>
                ) : filteredPrescriptions.map((rx, index) => (
                  <tr key={rx._id} className={`transition-colors ${index % 2 === 0 ? 'bg-surface/50' : 'bg-white'}`}>
                    <td className="py-4 font-medium text-gray-900 px-2">{rx.patient?.firstName} {rx.patient?.lastName}</td>
                    <td className="py-4 text-gray-700 font-medium px-2">
                       <div className="font-semibold text-sm">{rx.medications[0]?.name}</div>
                       <div className="text-xs text-gray-500">{rx.instructions}</div>
                    </td>
                    <td className="py-4 text-gray-500 px-2">Dr. {rx.appointment?.doctor?.lastName || 'Unknown'}</td>
                    <td className="py-4 px-2">
                      <span className={`status-pill ${rx.status === 'Dispensed' ? 'badge-success' : 'badge-warning'}`}>
                        {rx.status === 'Dispensed' ? <span className="material-symbols-outlined text-[14px]">check_circle</span> : <span className="material-symbols-outlined text-[14px]">pending</span>}
                        {rx.status}
                      </span>
                    </td>
                    <td className="py-4 text-right px-2">
                      {rx.status === 'Active' && (
                        <button onClick={() => handleDispense(rx._id)} className="btn-primary text-xs px-4 py-2 inline-flex">
                          Dispense
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full xl:w-96 clinical-card-low p-6 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold font-display mb-4 text-accent-error flex items-center">
            <span className="material-symbols-outlined mr-2">inventory_2</span>
            Low Stock Alerts
          </h3>
          <div className="space-y-4">
            {inventoryAlerts.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-md shadow-sm border border-red-100">
                 <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="text-xs font-bold text-accent-error bg-red-50 px-2 py-0.5 rounded">{item.stock} left</span>
                 </div>
                 <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-accent-error h-full" style={{ width: `${(item.stock / item.total) * 100}%` }}></div>
                 </div>
              </div>
            ))}
          </div>
          <button className="mt-8 text-primary hover:text-primary-hover font-semibold text-sm text-center w-full transition-colors">
            Order Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
