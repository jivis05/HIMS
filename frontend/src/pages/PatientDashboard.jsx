import React, { useState } from 'react';
import { appointmentAPI, prescriptionAPI, labReportAPI, userAPI, inpatientAPI, labAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import useAutoRefresh from '../hooks/useAutoRefresh';
import useMutation from '../hooks/useMutation';

export const PatientDashboard = () => {
  const { user } = useAuth();
  
  // Booking Form State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('Doctor'); // 'Doctor' or 'Lab'
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [testType, setTestType] = useState('Blood Test');

  const fetchDashboardData = async () => {
    const [apptRes, rxRes, labRes, docRes, admRes, myLabRes] = await Promise.all([
      appointmentAPI.getAll(),
      prescriptionAPI.getAll(),
      labReportAPI.getAll(),
      userAPI.getDoctors(),
      inpatientAPI.getAdmissions(),
      labAPI.getMyAppointments()
    ]);
    
    // Find my active admission
    const myAdmission = (admRes.data.admissions || []).find(a => a.patient?._id === user?._id);

    return {
      appointments: apptRes.data.appointments || [],
      prescriptions: rxRes.data.prescriptions || [],
      labReports: labRes.data.labReports || [],
      doctors: docRes.data.doctors || [],
      admission: myAdmission,
      labAppointments: myLabRes.data.labAppointments || []
    };
  };

  const { data, isLoading, refetch } = useAutoRefresh(fetchDashboardData);
  const { handleMutation, isLoading: isSubmitting } = useMutation();

  const appointments = data?.appointments || [];
  const prescriptions = data?.prescriptions || [];
  const labReports = data?.labReports || [];
  const doctors = data?.doctors || [];
  const admission = data?.admission || null;
  const labAppointments = data?.labAppointments || [];

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (bookingType === 'Doctor') {
      const selectedDocObj = doctors.find(d => d._id === selectedDoctor);
      await handleMutation(
        () => appointmentAPI.create({
          doctor: selectedDoctor,
          organizationId: selectedDocObj?.organizationId?._id || selectedDocObj?.organizationId,
          date: date,
          startTime: startTime,
          type: 'General Checkup',
          chiefComplaint: chiefComplaint
        }),
        {
          refetch: refetch,
          onSuccess: () => {
            setShowBookingModal(false);
            setSelectedDoctor('');
            setDate('');
            setStartTime('');
            setChiefComplaint('');
            alert('Appointment booked successfully!');
          },
          onError: () => alert('Failed to book appointment. Make sure the doctor belongs to an organization.')
        }
      );
    } else {
      await handleMutation(
        () => labAPI.book({
          testType,
          date,
          timeSlot: startTime,
          organizationId: selectedOrgId // Patients must specify an Org, usually we'd have them select from a list. Let's just use the first doctor's org for simplicity in demo if not selected
        }),
        {
          refetch: refetch,
          onSuccess: () => {
            setShowBookingModal(false);
            setTestType('Blood Test');
            setDate('');
            setStartTime('');
            setSelectedOrgId('');
            alert('Lab appointment booked successfully!');
          },
          onError: () => alert('Failed to book lab appointment.')
        }
      );
    }
  };

  const handleCancelAppt = async (id, isLab) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    await handleMutation(
      () => isLab ? labAPI.cancel(id, { reason: 'Cancelled by patient' }) : appointmentAPI.cancel(id, { reason: 'Cancelled by patient' }),
      {
        refetch: refetch,
        onSuccess: () => alert('Appointment cancelled successfully.')
      }
    );
  };

  const activeAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const activeLabAppts = labAppointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="bg-gradient-to-br from-slate-900 via-primary-hover to-primary rounded-2xl p-8 text-white shadow-ambient flex flex-col md:flex-row items-center justify-between relative overflow-hidden animate-slide-up">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold tracking-tight mb-2">Welcome back, {user?.firstName}</h2>
          <p className="text-white/80 max-w-md">Find specialists, general practitioners, and diagnostic centers within the City Central Hospital network.</p>
        </div>
        <button onClick={() => setShowBookingModal(true)} className="mt-6 md:mt-0 relative z-10 btn-secondary border-none shadow-md text-primary-hover inline-flex items-center">
          <span className="material-symbols-outlined mr-2">event_available</span>
          Book Appointment
        </button>
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {admission && (
        <div className="bg-accent-emerald/5 border border-accent-emerald/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in shadow-sm">
           <div className="w-16 h-16 rounded-full bg-accent-emerald/10 text-accent-emerald flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl font-black">bed</span>
           </div>
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-900">Active Admission</h3>
              <p className="text-slate-600">You are currently admitted to <span className="font-bold">{admission.bed?.ward}</span>, Bed <span className="font-bold">#{admission.bed?.bedNumber}</span></p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                 <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">calendar_today</span> Admitted: {new Date(admission.admissionDate).toLocaleDateString()}
                 </span>
                 <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">medical_services</span> Care of: Dr. {admission.admittedBy?.lastName}
                 </span>
              </div>
           </div>
           <div className="px-6 py-2 bg-accent-emerald text-white rounded-full text-sm font-bold shadow-sm">
              Current Patient
           </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div className="clinical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-display">Upcoming Appointments</h3>
              <button onClick={fetchDashboardData} className="text-primary hover:text-primary-hover font-semibold text-sm">Refresh</button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-gray-500 py-4">Loading appointments...</p>
              ) : activeAppointments.length === 0 && activeLabAppts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No upcoming appointments.</p>
              ) : (
                <>
                  {activeAppointments.map((apt) => (
                    <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-md border border-gray-100">
                      <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase">
                          {new Date(apt.date).getDate()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Dr. {apt.doctor?.lastName}</h4>
                          <p className="text-sm text-gray-500">{apt.doctor?.specialty} &bull; {apt.startTime || new Date(apt.date).toLocaleDateString()}</p>
                          <span className="status-pill badge-primary mt-2">{apt.status}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleCancelAppt(apt._id, false)} className="btn-secondary text-sm">Cancel</button>
                      </div>
                    </div>
                  ))}
                  {activeLabAppts.map((apt) => (
                    <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-md border border-gray-100">
                      <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                        <div className="h-12 w-12 rounded-lg bg-accent-indigo/10 text-accent-indigo flex items-center justify-center font-bold text-xl uppercase">
                          {new Date(apt.date).getDate()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{apt.testType}</h4>
                          <p className="text-sm text-gray-500">{apt.organizationId?.name || 'Lab'} &bull; {apt.timeSlot}</p>
                          <span className="status-pill badge-primary mt-2">{apt.status}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleCancelAppt(apt._id, true)} className="btn-secondary text-sm">Cancel</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="clinical-card p-6">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-display">My Prescriptions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : prescriptions.length === 0 ? (
                <p className="text-gray-500 text-sm">No prescriptions found.</p>
              ) : prescriptions.map(rx => (
                <div key={rx._id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-gray-800">{rx.medications[0]?.name || 'Medication'}</h4>
                     <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${rx.status === 'Dispensed' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-amber-100 text-amber-700'}`}>
                        {rx.status}
                     </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rx.medications[0]?.dosage} - {rx.medications[0]?.frequency}</p>
                  <p className="text-xs text-gray-400">Prescribed by Dr. {rx.doctor?.lastName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:w-1/3 space-y-8">
           <div className="clinical-card p-6 bg-slate-900 text-white border-none relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-accent-indigo">science</span>
                 Latest Lab Results
               </h3>
               {labReports.length === 0 ? (
                 <p className="text-sm text-slate-400">No lab reports available.</p>
               ) : (
                 <div className="space-y-4">
                   {labReports.slice(0, 3).map(report => (
                     <div key={report._id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                        <div>
                          <p className="font-bold text-sm text-white">{report.testName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${report.status === 'Completed' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-amber-500/20 text-amber-400'}`}>
                          {report.status}
                        </span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
             <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent-indigo/20 rounded-full blur-2xl"></div>
           </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold font-display">Book Appointment</h3>
                <p className="text-primary-100 text-sm mt-1">Select a service and time</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-white/70 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              <div className="flex gap-4 mb-4">
                 <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="radio" checked={bookingType === 'Doctor'} onChange={() => setBookingType('Doctor')} className="text-primary focus:ring-primary h-4 w-4" />
                    Doctor Consultation
                 </label>
                 <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="radio" checked={bookingType === 'Lab'} onChange={() => setBookingType('Lab')} className="text-primary focus:ring-primary h-4 w-4" />
                    Lab Test
                 </label>
              </div>

              {bookingType === 'Doctor' ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Doctor</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a Specialist --</option>
                    {doctors.map(doc => (
                      <option key={doc._id} value={doc._id}>
                        Dr. {doc.firstName} {doc.lastName} - {doc.specialty || 'General'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Test Type</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      value={testType}
                      onChange={(e) => setTestType(e.target.value)}
                      required
                    >
                      <option value="Blood Test">Blood Test (CBC, Lipid, etc)</option>
                      <option value="Urinalysis">Urinalysis</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="MRI">MRI Scan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Organization ID</label>
                    <input
                      type="text"
                      placeholder="Enter specific Org ID or leave blank to auto-assign"
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      value={selectedOrgId}
                      onChange={(e) => setSelectedOrgId(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {bookingType === 'Doctor' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Chief Complaint</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    rows="2"
                    placeholder="Briefly describe your symptoms..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                  ></textarea>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center justify-center min-w-[120px]">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin text-lg">autorenew</span> : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
