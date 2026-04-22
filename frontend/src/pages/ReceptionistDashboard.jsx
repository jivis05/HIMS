import React, { useState } from 'react';
import { appointmentAPI, userAPI, invoiceAPI, inpatientAPI, inventoryAPI, labAPI } from '../services/api.service';
import { receptionistStats } from '../data/mockData';
import { Link } from 'react-router-dom';
import useAutoRefresh from '../hooks/useAutoRefresh';
import useMutation from '../hooks/useMutation';

export const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab ] = useState('overview'); // 'overview', 'billing', 'inpatient', 'inventory', 'lab'

  // Modal States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form States
  const [newInvoice, setNewInvoice] = useState({
    patient: '',
    items: [{ description: '', amount: '', type: 'Consultation' }],
    dueDate: ''
  });

  const [admissionData, setAdmissionData] = useState({
    patient: '', bedId: '', reason: '', initialObservations: ''
  });

  const [paymentData, setPaymentData] = useState({ amount: '', method: 'Cash' });
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [restockQty, setRestockQty] = useState('');

  const fetchDashboardData = async () => {
    const [apptRes, docsRes, invRes, patientsRes, bedsRes, admissionsRes, itemsRes, labRes] = await Promise.all([
      appointmentAPI.getAll(),
      userAPI.getDoctors(),
      invoiceAPI.getAll(),
      userAPI.getAll('PATIENT'),
      inpatientAPI.getBeds(),
      inpatientAPI.getAdmissions(),
      inventoryAPI.getAll(),
      labAPI.getOrgAppointments()
    ]);
    return {
      appointments: apptRes.data.data || [],
      doctors: docsRes.data.data || [],
      invoices: invRes.data.data || [],
      allPatients: patientsRes.data.data || [],
      beds: bedsRes.data.data || [],
      admissions: admissionsRes.data.data || [],
      inventory: itemsRes.data.data || [],
      labAppointments: labRes.data.data || []
    };
  };

  const { data, isLoading, refetch } = useAutoRefresh(fetchDashboardData);
  const { handleMutation, isLoading: isSubmitting } = useMutation();

  const appointments = data?.appointments || [];
  const doctors = data?.doctors || [];
  const invoices = data?.invoices || [];
  const allPatients = data?.allPatients || [];
  const beds = data?.beds || [];
  const admissions = data?.admissions || [];
  const inventory = data?.inventory || [];
  const labAppointments = data?.labAppointments || [];

  const handleStatusUpdate = async (id, newStatus) => {
    await handleMutation(
      () => appointmentAPI.updateStatus(id, { status: newStatus }),
      {
        refetch: refetch,
        onError: () => alert('Failed to update status')
      }
    );
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    await handleMutation(
      () => invoiceAPI.create(newInvoice),
      {
        refetch: refetch,
        onSuccess: () => {
          setShowInvoiceModal(false);
          setNewInvoice({ patient: '', items: [{ description: '', amount: '', type: 'Consultation' }], dueDate: '' });
          alert('Invoice created successfully!');
        },
        onError: () => alert('Failed to create invoice')
      }
    );
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    await handleMutation(
      () => invoiceAPI.pay(selectedInvoice._id, paymentData),
      {
        refetch: refetch,
        onSuccess: () => {
          setShowPaymentModal(false);
          setPaymentData({ amount: '', method: 'Cash' });
          alert('Payment recorded successfully!');
        },
        onError: () => alert('Failed to record payment')
      }
    );
  };

  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    await handleMutation(
      () => inpatientAPI.admit(admissionData),
      {
        refetch: refetch,
        onSuccess: () => {
          setShowAdmitModal(false);
          setAdmissionData({ patient: '', bedId: '', reason: '', initialObservations: '' });
          alert('Patient admitted successfully!');
        },
        onError: () => alert('Failed to admit patient')
      }
    );
  };

  const handleDischargePatient = async (e) => {
    e.preventDefault();
    await handleMutation(
      () => inpatientAPI.discharge(selectedAdmission._id, { dischargeSummary }),
      {
        refetch: refetch,
        onSuccess: () => {
          setShowDischargeModal(false);
          setDischargeSummary('');
          alert('Patient discharged successfully!');
        },
        onError: () => alert('Failed to discharge patient')
      }
    );
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    await handleMutation(
      () => inventoryAPI.updateStock(selectedItem._id, { quantity: restockQty, action: 'add' }),
      {
        refetch: refetch,
        onSuccess: () => {
          setShowRestockModal(false);
          setRestockQty('');
          alert('Stock updated successfully!');
        },
        onError: () => alert('Failed to restock')
      }
    );
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', amount: '', type: 'Consultation' }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index][field] = value;
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled': return 'badge-primary';
      case 'Checked In': return 'badge-success';
      case 'In Progress': return 'badge-warning';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-transparent';
      case 'Canceled': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 pb-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Daily Overview
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'billing' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Billing & Payments
        </button>
        <button 
          onClick={() => setActiveTab('inpatient')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'inpatient' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Inpatient / Wards
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Pharmacy & Inventory
        </button>
        <button 
          onClick={() => setActiveTab('lab')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'lab' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Lab & Diagnostics
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between clinical-card p-6">
            <div className="flex-1 w-full relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">person_search</span>
              <input 
                type="text" 
                placeholder="Search patient by Name, Phone, or ID..." 
                className="input-field pl-12"
              />
            </div>
            <Link to="/auth/register" className="btn-primary w-full md:w-auto h-full py-3 px-6 whitespace-nowrap flex items-center justify-center shadow-ambient shrink-0">
              <span className="material-symbols-outlined mr-2">person_add</span>
              New Registration
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {receptionistStats.map(stat => (
              <div key={stat.id} className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-4xl font-display font-extrabold text-gray-900">
                    {stat.id === 'stats-1' ? appointments.length : stat.value}
                  </span>
                  <span className="material-symbols-outlined text-gray-300 text-3xl">analytics</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1 clinical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-display">Today's Check-ins & Waitlist</h3>
                <button onClick={fetchData} className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh List
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-sm text-gray-400 border-b border-gray-100">
                      <th className="pb-3 font-medium px-2">Patient Name</th>
                      <th className="pb-3 font-medium px-2">Appt Time</th>
                      <th className="pb-3 font-medium px-2">Doctor</th>
                      <th className="pb-3 font-medium px-2">Status</th>
                      <th className="pb-3 font-medium text-right px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading appointments...</td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">No appointments found.</td></tr>
                    ) : appointments.map((appt, index) => (
                      <tr key={appt._id} className={`transition-colors ${index % 2 === 0 ? 'bg-surface/50' : 'bg-white'}`}>
                        <td className="py-4 font-medium text-gray-900 px-2">{appt.patient?.firstName} {appt.patient?.lastName}</td>
                        <td className="py-4 text-gray-500 font-medium px-2 text-primary">{appt.startTime || new Date(appt.date).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-500 px-2">{appt.doctor?.firstName} {appt.doctor?.lastName}</td>
                        <td className="py-4 px-2">
                           <span className={`status-pill ${getStatusColor(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-4 text-right px-2">
                          <div className="flex justify-end gap-2 items-center">
                            {appt.status === 'Scheduled' && (
                              <button onClick={() => handleStatusUpdate(appt._id, 'Checked In')} className="btn-secondary text-xs px-3 py-1.5 shadow-sm">
                                Check In
                              </button>
                            )}
                            {appt.status === 'Checked In' && (
                              <button onClick={() => handleStatusUpdate(appt._id, 'In Progress')} className="btn-secondary text-xs px-3 py-1.5 shadow-sm">
                                Send In
                              </button>
                            )}
                            <button onClick={() => handleStatusUpdate(appt._id, 'Canceled')} className="text-slate-400 hover:text-accent-rose transition-colors p-1 flex items-center" title="Cancel Appointment">
                              <span className="material-symbols-outlined text-lg">cancel</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-full xl:w-96 clinical-card-low p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold font-display mb-4">Doctor Availability</h3>
              <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-gray-500 text-sm">Loading doctors...</p>
                  ) : doctors.length === 0 ? (
                    <p className="text-gray-500 text-sm">No doctors found.</p>
                  ) : doctors.map((doc, i) => (
                    <div key={doc._id} className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">Dr. {doc.firstName} {doc.lastName}</span>
                        <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
                      </div>
                      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${Math.max(10, 100 - (i*20))}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{doc.specialty || 'General'} - Available</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold font-display text-slate-800">Billing Management</h3>
            <button onClick={() => setShowInvoiceModal(true)} className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined">add_card</span>
              Generate New Invoice
            </button>
          </div>

          <div className="clinical-card p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface border-b border-gray-100">
                <tr className="text-sm text-gray-500">
                  <th className="py-4 px-6 font-semibold">Invoice ID</th>
                  <th className="py-4 px-6 font-semibold">Patient</th>
                  <th className="py-4 px-6 font-semibold">Total Amount</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading invoices...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-400">No invoices found.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-6 text-xs font-mono text-gray-400">#{inv._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 px-6 font-medium text-slate-900">{inv.patient?.firstName} {inv.patient?.lastName}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">${inv.totalAmount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`status-pill ${inv.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      {inv.status !== 'Paid' && (
                        <button 
                          onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}
                          className="btn-secondary text-xs px-3 py-1.5"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inpatient' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold font-display text-slate-800">Inpatient Management</h3>
            <button onClick={() => setShowAdmitModal(true)} className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined">patient_list</span>
              Admit New Patient
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Admissions</h4>
               <div className="clinical-card p-0 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface border-b border-gray-100">
                      <tr className="text-xs text-gray-500 font-bold">
                        <th className="py-4 px-6">Patient</th>
                        <th className="py-4 px-6">Bed/Ward</th>
                        <th className="py-4 px-6">Admitted By</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {admissions.map(adm => (
                        <tr key={adm._id} className="hover:bg-surface/30 transition-colors">
                          <td className="py-4 px-6">
                             <div className="font-bold text-slate-900">{adm.patient?.firstName} {adm.patient?.lastName}</div>
                             <div className="text-xs text-gray-400">{new Date(adm.admissionDate).toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-6">
                             <div className="font-medium text-slate-700">Bed {adm.bed?.bedNumber}</div>
                             <div className="text-xs text-gray-500">{adm.bed?.ward}</div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">Dr. {adm.admittedBy?.lastName}</td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => { setSelectedAdmission(adm); setShowDischargeModal(true); }}
                              className="btn-secondary text-xs px-3 py-1.5"
                            >
                              Discharge
                            </button>
                          </td>
                        </tr>
                      ))}
                      {admissions.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-10 text-gray-400 italic">No active admissions.</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bed Availability</h4>
               <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {beds.map(bed => (
                    <div key={bed._id} className="clinical-card-low p-4 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bed.status === 'Available' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-50 text-red-500'}`}>
                           <span className="material-symbols-outlined text-sm">bed</span>
                         </div>
                         <div>
                            <div className="font-bold text-slate-800">Bed {bed.bedNumber}</div>
                            <div className="text-xs text-gray-500">{bed.ward} • {bed.type}</div>
                         </div>
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-tighter ${bed.status === 'Available' ? 'text-accent-emerald' : 'text-red-400'}`}>
                         {bed.status}
                       </span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold font-display text-slate-800">Pharmacy & Stock</h3>
              <p className="text-sm text-gray-400">Manage medicine stock and hospital inventories.</p>
            </div>
            <div className="clinical-card p-0 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-surface border-b">
                     <tr className="text-xs text-gray-500 font-black uppercase">
                        <th className="py-4 px-6">Item</th>
                        <th className="py-4 px-6">Available</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {inventory.map(item => (
                       <tr key={item._id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-6">
                             <div className="font-bold text-slate-900">{item.itemName}</div>
                             <div className="text-[10px] text-gray-400 font-bold">{item.category} • {item.unit}</div>
                          </td>
                          <td className="py-4 px-6 font-black text-slate-600">{item.stockQuantity}</td>
                          <td className="py-4 px-6">
                             {item.stockQuantity <= item.threshold ? (
                               <span className="text-[10px] bg-red-50 text-red-500 font-black uppercase px-2 py-0.5 rounded">Low Stock</span>
                             ) : (
                               <span className="text-[10px] bg-accent-emerald/10 text-accent-emerald font-black uppercase px-2 py-0.5 rounded">Stable</span>
                             )}
                          </td>
                          <td className="py-4 px-6 text-right">
                             <button 
                               onClick={() => { setSelectedItem(item); setShowRestockModal(true); }}
                               className="btn-secondary text-xs px-2 py-1"
                             >
                               Restock
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
      )}

      {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold font-display text-slate-800">Lab & Diagnostics</h3>
              <button onClick={fetchDashboardData} className="text-sm text-primary hover:text-primary-hover font-bold flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">refresh</span> Refresh
              </button>
            </div>
            <div className="clinical-card p-0 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-surface border-b">
                     <tr className="text-xs text-gray-500 font-black uppercase">
                        <th className="py-4 px-6">Patient</th>
                        <th className="py-4 px-6">Test Type</th>
                        <th className="py-4 px-6">Date/Time</th>
                        <th className="py-4 px-6">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {labAppointments.length === 0 ? (
                       <tr><td colSpan="4" className="py-8 text-center text-gray-500">No lab appointments found.</td></tr>
                     ) : labAppointments.map(appt => (
                       <tr key={appt._id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-6">
                             <div className="font-bold text-slate-900">{appt.patientId?.firstName} {appt.patientId?.lastName}</div>
                             <div className="text-[10px] text-gray-400 font-bold">{appt.patientId?.email}</div>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-700">{appt.testType}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                             {new Date(appt.date).toLocaleDateString()} • {appt.timeSlot}
                          </td>
                          <td className="py-4 px-6">
                             <span className={`status-pill ${getStatusColor(appt.status)}`}>{appt.status}</span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
      )}

      {/* Modals */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="glass-header px-6 py-4 flex justify-between items-center text-slate-800">
              <h3 className="font-bold text-lg font-display">Generate New Bill</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6 overflow-y-auto">
              <select value={newInvoice.patient} onChange={e => setNewInvoice({...newInvoice, patient: e.target.value})} className="input-field" required>
                <option value="">Select Patient...</option>
                {allPatients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
              </select>
              <input type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} className="input-field" required />
              <div className="space-y-3">
                 {newInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                       <input placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="input-field flex-1" required />
                       <input type="number" placeholder="Amount" value={item.amount} onChange={e => updateItem(idx, 'amount', e.target.value)} className="input-field w-24" required />
                    </div>
                 ))}
                 <button type="button" onClick={addItem} className="text-primary text-xs font-bold">+ Add Item</button>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="glass-header px-6 py-4 flex justify-between items-center text-slate-800">
              <h3 className="font-bold text-lg font-display">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-surface p-4 rounded-xl">
                 <p className="text-xs text-gray-500 font-bold uppercase">Total Due</p>
                 <p className="text-2xl font-black text-primary">${(selectedInvoice.totalAmount).toFixed(2)}</p>
              </div>
              <input type="number" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} className="input-field" placeholder="Amount to pay..." required />
              <select value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})} className="input-field" required>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
              </select>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">Process</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="glass-header px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg font-display">Admit Patient</h3>
              <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdmitPatient} className="p-6 space-y-4">
              <select value={admissionData.patient} onChange={e => setAdmissionData({...admissionData, patient: e.target.value})} className="input-field" required>
                <option value="">Select Patient...</option>
                {allPatients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
              </select>
              <select value={admissionData.bedId} onChange={e => setAdmissionData({...admissionData, bedId: e.target.value})} className="input-field" required>
                <option value="">Select Bed...</option>
                {beds.filter(b => b.status === 'Available').map(b => <option key={b._id} value={b._id}>Bed {b.bedNumber} - {b.ward}</option>)}
              </select>
              <textarea value={admissionData.reason} onChange={e => setAdmissionData({...admissionData, reason: e.target.value})} className="input-field h-24 pt-3" placeholder="Reason..." required />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAdmitModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDischargeModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="glass-header px-6 py-4 flex justify-between items-center text-slate-800">
              <h3 className="font-bold text-lg font-display">Discharge</h3>
              <button onClick={() => setShowDischargeModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleDischargePatient} className="p-6 space-y-4">
              <p className="font-bold text-slate-700">{selectedAdmission.patient?.firstName} {selectedAdmission.patient?.lastName}</p>
              <textarea value={dischargeSummary} onChange={e => setDischargeSummary(e.target.value)} className="input-field h-32 pt-3" placeholder="Summary..." required />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowDischargeModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">Discharge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="glass-header px-6 py-4 flex justify-between items-center text-slate-800">
              <h3 className="font-bold text-lg font-display">Restock</h3>
              <button onClick={() => setShowRestockModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleRestock} className="p-6 space-y-4">
               <div>
                  <p className="font-bold">{selectedItem.itemName}</p>
                  <p className="text-xs text-gray-400">Current: {selectedItem.stockQuantity} {selectedItem.unit}</p>
               </div>
               <input type="number" placeholder="Qty to Add" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="input-field" required />
               <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowRestockModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">Confirm</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
