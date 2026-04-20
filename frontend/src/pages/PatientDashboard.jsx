import React, { useState, useEffect } from 'react';
import { appointmentAPI, prescriptionAPI, labReportAPI, userAPI, inpatientAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';

export const PatientDashboard = () => {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [admission, setAdmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Form State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [apptRes, rxRes, labRes, docRes, admRes] = await Promise.all([
        appointmentAPI.getAll(),
        prescriptionAPI.getAll(),
        labReportAPI.getAll(),
        userAPI.getDoctors(),
        inpatientAPI.getAdmissions()
      ]);
      setAppointments(apptRes.data.appointments || []);
      setPrescriptions(rxRes.data.prescriptions || []);
      setLabReports(labRes.data.labReports || []);
      setDoctors(docRes.data.doctors || []);
      
      // Find my active admission
      const myAdmission = (admRes.data.admissions || []).find(a => a.patient?._id === user?._id);
      setAdmission(myAdmission);
    } catch (error) {
      console.error('Failed to fetch patient data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await appointmentAPI.create({
        doctor: selectedDoctor,
        date: date,
        startTime: startTime,
        type: 'General Checkup',
        chiefComplaint: chiefComplaint
      });
      setShowBookingModal(false);
      setSelectedDoctor('');
      setDate('');
      setStartTime('');
      setChiefComplaint('');
      alert('Appointment booked successfully!');
      fetchData();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Canceled');

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
              <button onClick={fetchData} className="text-primary hover:text-primary-hover font-semibold text-sm">Refresh</button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-gray-500 py-4">Loading appointments...</p>
              ) : activeAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No upcoming appointments.</p>
              ) : activeAppointments.map((apt) => (
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
                </div>
              ))}
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
                <div key={rx._id} className="p-4 rounded-md border border-gray-100 hover:border-primary-container transition-colors flex flex-col justify-between">
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{rx.medications[0]?.name || 'Medication'}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{rx.instructions}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-gray-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                    <span className={`status-pill ${rx.status === 'Active' ? 'badge-success' : 'badge-primary'}`}>
                      {rx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full xl:w-96 clinical-card-low p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-display">Lab Reports</h3>
          </div>
          <div className="space-y-0">
            {isLoading ? (
              <p className="text-gray-500 text-sm text-center">Loading...</p>
            ) : labReports.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No lab reports yet.</p>
            ) : labReports.map((lab, i) => (
              <div key={lab._id} className={`p-4 transition-colors flex items-center justify-between group cursor-pointer ${i % 2 === 0 ? 'bg-transparent' : 'bg-white rounded-md shadow-sm'}`}>
                <div>
                   <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{lab.testType}</h4>
                   <p className="text-xs text-gray-500">{new Date(lab.createdAt).toLocaleDateString()}</p>
                   <span className={`status-pill mt-1 ${lab.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{lab.status}</span>
                </div>
                {lab.resultFileUrl && (
                  <a href={lab.resultFileUrl} target="_blank" rel="noreferrer" className="material-symbols-outlined text-gray-400 hover:text-primary p-2">download</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-slate-800">
            <div className="glass-header px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event</span>
                Book Appointment
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Doctor</label>
                <select 
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="input-field" 
                  required
                >
                  <option value="" disabled>-- Choose a Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>Dr. {doc.firstName} {doc.lastName} ({doc.specialty || 'General'})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Complaint</label>
                <textarea 
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="input-field min-h-[100px] pt-3" 
                  placeholder="e.g. Fever..." 
                  required
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Booking...' : 'Confirm'}
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
