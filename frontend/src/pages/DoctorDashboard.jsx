import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, prescriptionAPI, labReportAPI, inpatientAPI, shiftAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'appointments', 'inpatients', 'schedule'
  const [isLoading, setIsLoading] = useState(true);
  
  // Prescription Form State
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: 'Daily', duration: '', notes: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lab Order Form State
  const [showLabModal, setShowLabModal] = useState(false);
  const [testType, setTestType] = useState('');
  const [priority, setPriority] = useState('Routine');

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [apptRes, admRes, shiftRes] = await Promise.all([
        appointmentAPI.getAll(),
        inpatientAPI.getAdmissions(),
        shiftAPI.getAll()
      ]);
      setAppointments(apptRes.data.appointments || []);
      setAdmissions(admRes.data.admissions || []);
      setShifts(shiftRes.data.shifts || []);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartConsultation = async (appt) => {
    try {
      if (appt.status !== 'In Progress' && appt.status !== 'Completed') {
        await appointmentAPI.updateStatus(appt._id, { status: 'In Progress' });
        fetchData();
      }
      setSelectedAppointment(appt);
      setShowModal(true);
    } catch (error) {
      alert('Failed to start consultation.');
    }
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    
    try {
      setIsSubmitting(true);
      await prescriptionAPI.create({
        patient: selectedAppointment.patient._id,
        appointment: selectedAppointment._id,
        medications: medications.map(m => ({
          name: m.name,
          dosage: m.dosage || 'As prescribed',
          frequency: m.frequency || 'Daily',
          duration: m.duration,
          notes: m.notes
        }))
      });
      await appointmentAPI.updateStatus(selectedAppointment._id, { status: 'Completed' });
      
      setShowModal(false);
      setMedications([{ name: '', dosage: '', frequency: 'Daily', duration: '', notes: '' }]);
      fetchData();
      alert('Prescription created successfully!');
    } catch (error) {
      console.error('Failed to create prescription', error);
      alert('Failed to create prescription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderLabSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      await labReportAPI.order({
        patient: selectedAppointment.patient._id,
        testType: testType,
        testCode: 'GEN-01',
        sampleType: 'Blood',
        priority: priority
      });
      setShowLabModal(false);
      setTestType('');
      setPriority('Routine');
      alert('Lab Test ordered successfully!');
    } catch (error) {
      console.error('Failed to order lab test', error);
      alert('Failed to order lab test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Canceled');
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="flex items-center gap-6 border-b border-gray-100 mb-2">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'appointments' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          My Appointments
        </button>
        <button 
          onClick={() => setActiveTab('inpatients')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'inpatients' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Inpatient Rounds
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'schedule' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          My Schedule
        </button>
      </div>

      {activeTab === 'appointments' ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Dr. {user?.lastName}'s Schedule</h2>
              <p className="text-gray-500 mt-1">{new Date().toLocaleDateString()} - {user?.specialty || 'General'} Department</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-sm font-medium text-gray-500">Pending Patients</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-4xl font-display font-extrabold text-gray-900">{pendingAppointments.length}</span>
                </div>
              </div>
              <div className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-4xl font-display font-extrabold text-gray-900">{completedCount}</span>
                </div>
              </div>
              <div className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-sm font-medium text-gray-500">Total Consultations</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-4xl font-display font-extrabold text-gray-900">{appointments.length}</span>
                </div>
              </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1 clinical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-display">Appointments</h3>
                <button onClick={fetchData} className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                </button>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-gray-500 text-center py-4">Loading appointments...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No appointments found.</p>
                ) : appointments.map((apt, index) => (
                  <div key={apt._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg transition-colors border ${apt.status === 'Completed' ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="flex items-start space-x-4">
                      <div className="font-medium text-primary-hover w-20 pt-1">{apt.startTime || new Date(apt.date).toLocaleDateString()}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{apt.patient?.firstName} {apt.patient?.lastName}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{apt.chiefComplaint || 'No complaint specified'}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="status-pill badge-warning">{apt.status}</span>
                           <button 
                             onClick={() => navigate(`/patient/${apt.patient?._id}/emr`)}
                             className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                           >
                              <span className="material-symbols-outlined text-[10px]">history_edu</span>
                              VIEW EMR
                           </button>
                        </div>
                      </div>
                    </div>
                    {apt.status !== 'Completed' && apt.status !== 'Canceled' && (
                      <div className="flex gap-2 mt-4 sm:mt-0 items-center">
                        <button onClick={() => { setSelectedAppointment(apt); setShowLabModal(true); }} className="btn-secondary text-sm px-4 py-2 shadow-sm border-transparent hover:border-primary/20 text-primary-hover whitespace-nowrap">
                          Order Lab Test
                        </button>
                        <button onClick={() => handleStartConsultation(apt)} className="btn-primary text-sm px-4 py-2 shadow-sm whitespace-nowrap">
                          {apt.status === 'In Progress' ? 'Resume Consultation' : 'Start Consultation'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'schedule' ? (
         <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">My Shift Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {shifts.map(shift => (
                 <div key={shift._id} className="clinical-card p-6 border-t-4 border-t-primary">
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${shift.type === 'Night' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                          {shift.type}
                       </span>
                       <span className="text-[10px] text-gray-400 font-bold uppercase">{shift.department}</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                          <span className="font-bold text-slate-800">{new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-300 text-sm">calendar_month</span>
                          <span className="text-sm text-gray-500">{new Date(shift.startTime).toLocaleDateString()}</span>
                       </div>
                    </div>
                    {shift.notes && (
                      <div className="mt-4 p-3 bg-surface rounded-lg text-xs italic text-gray-500">
                         "{shift.notes}"
                      </div>
                    )}
                 </div>
               ))}
               {shifts.length === 0 && (
                 <div className="col-span-full py-20 text-center text-gray-400 italic">No shifts assigned.</div>
               )}
            </div>
         </div>
      ) : (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Active Inpatients</h2>
              <p className="text-gray-500 mt-1">Patients admitted under your care or hospital-wide rounds.</p>
            </div>
            <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined">refresh</span>
              Refresh Rounds
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admissions.map(adm => (
              <div key={adm._id} className="clinical-card p-6 border-l-4 border-l-primary flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{adm.patient?.firstName} {adm.patient?.lastName}</h4>
                      <p className="text-sm text-gray-500">Bed {adm.bed?.bedNumber} • {adm.bed?.ward} Ward</p>
                    </div>
                  </div>
                  
                  <div className="bg-surface p-3 rounded-lg text-sm italic text-slate-600">
                    "{adm.reason}"
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs text-gray-400">
                    <span>Admitted: {new Date(adm.admissionDate).toLocaleDateString()}</span>
                    <button 
                      onClick={() => navigate(`/patient/${adm.patient?._id}/emr`)}
                      className="text-primary font-bold hover:underline"
                    >
                      View Medical Chart
                    </button>
                  </div>
              </div>
            ))}
            {admissions.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400 clinical-card border-dashed">
                <span className="material-symbols-outlined text-4xl mb-2">clinical_notes</span>
                <p>No active inpatients currently assigned or recorded.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-slate-800">
            <div className="glass-header px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_document</span>
                Write Prescription
              </h3>
              <button onClick={() => { setShowModal(false); setMedications([{ name: '', dosage: '', frequency: 'Daily', duration: '', notes: '' }]); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handlePrescribe} className="p-6 space-y-4 text-left">
              <div className="bg-surface p-3 rounded-md text-sm mb-4">
                <p><span className="font-semibold text-slate-700">Patient:</span> {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                <p><span className="font-semibold text-slate-700">Complaint:</span> {selectedAppointment.chiefComplaint}</p>
              </div>

              {medications.map((med, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medication {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Drug Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => setMedications(medications.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))}
                        className="input-field text-sm"
                        placeholder="e.g. Amoxicillin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => setMedications(medications.map((m, i) => i === idx ? { ...m, dosage: e.target.value } : m))}
                        className="input-field text-sm"
                        placeholder="e.g. 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => setMedications(medications.map((m, i) => i === idx ? { ...m, frequency: e.target.value } : m))}
                        className="input-field text-sm"
                      >
                        <option>Once daily</option>
                        <option>Twice daily</option>
                        <option>Three times daily</option>
                        <option>As needed</option>
                        <option>Daily</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => setMedications(medications.map((m, i) => i === idx ? { ...m, duration: e.target.value } : m))}
                        className="input-field text-sm"
                        placeholder="e.g. 7 days"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                    <input
                      type="text"
                      value={med.notes}
                      onChange={(e) => setMedications(medications.map((m, i) => i === idx ? { ...m, notes: e.target.value } : m))}
                      className="input-field text-sm"
                      placeholder="e.g. Take with food"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setMedications([...medications, { name: '', dosage: '', frequency: 'Daily', duration: '', notes: '' }])}
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add another medication
              </button>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLabModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-slate-800">
            <div className="glass-header px-6 py-4 flex justify-between items-center text-slate-800">
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">science</span>
                Order Lab Test
              </h3>
              <button onClick={() => setShowLabModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleOrderLabSubmit} className="p-6 space-y-4 text-left">
              <div className="bg-surface p-3 rounded-md text-sm mb-4">
                <p><span className="font-semibold text-slate-700">Patient:</span> {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Test Type</label>
                <input 
                  type="text" 
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. CBC, Lipid Profile" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field" 
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="STAT">STAT</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowLabModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">Order Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
