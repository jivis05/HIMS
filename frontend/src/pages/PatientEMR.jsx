import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api.service';

export const PatientEMR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emrData, setEmrData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeHistoryTab, setActiveHistoryTab] = useState('timeline'); // 'timeline', 'labs', 'meds', 'admissions'

  useEffect(() => {
    const fetchEMR = async () => {
      try {
        setIsLoading(true);
        const res = await userAPI.getEMR(id);
        setEmrData(res.data.emr);
      } catch (error) {
        console.error('Error fetching EMR', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEMR();
  }, [id]);

  if (isLoading) return <div className="p-20 text-center text-primary font-bold animate-pulse italic">Retrieving Clinical Archive...</div>;
  if (!emrData) return <div className="p-20 text-center text-gray-400">Patient records not found.</div>;

  const { profile, appointments, prescriptions, labReports, admissions } = emrData;

  // Combine all for timeline
  const timeline = [
    ...appointments.map(a => ({ ...a, eventType: 'Appointment', date: a.date })),
    ...prescriptions.map(p => ({ ...p, eventType: 'Prescription', date: p.date })),
    ...labReports.map(l => ({ ...l, eventType: 'Lab Report', date: l.createdAt })),
    ...admissions.map(adm => ({ ...adm, eventType: 'Admission', date: adm.admissionDate }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
         <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
         </button>
         <div>
            <h1 className="text-3xl font-display font-black text-slate-800">Electronic Medical Record</h1>
            <p className="text-slate-500 font-medium">Comprehensive clinical history for {profile.firstName} {profile.lastName}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Patient Brief Sidebar */}
         <div className="lg:col-span-1 space-y-6">
            <div className="clinical-card p-6 border-t-4 border-t-primary">
               <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-black mb-4">
                     {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Patient ID: {profile._id.slice(-6)}</p>
               </div>
               
               <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-xs font-bold text-gray-400 uppercase">Blood Group</span>
                     <span className="text-sm font-black text-red-500">{profile.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-xs font-bold text-gray-400 uppercase">Age / Gender</span>
                     <span className="text-sm font-bold text-slate-700">
                        {profile.dateOfBirth ? Math.floor((new Date() - new Date(profile.dateOfBirth)) / 31557600000) : '--'} yrs / {profile.gender}
                     </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                     <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                     <span className="text-sm font-medium text-slate-600">{profile.phone}</span>
                  </div>
               </div>
            </div>

            <div className="clinical-card p-6 bg-slate-900 text-white border-none">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Emergency Contact</h4>
               <div>
                  <p className="font-bold text-lg">{profile.emergencyContact?.name || 'Not Provided'}</p>
                  <p className="text-sm text-slate-400 mt-1">{profile.emergencyContact?.phone || '--'}</p>
               </div>
            </div>
         </div>

         {/* Main Record Area */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-6 border-b border-gray-100 pb-1">
               {['timeline', 'labs', 'meds', 'admissions'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveHistoryTab(tab)}
                   className={`pb-3 px-1 text-xs font-black uppercase tracking-widest transition-all ${activeHistoryTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            {activeHistoryTab === 'timeline' ? (
              <div className="space-y-4">
                 {timeline.map((event, idx) => (
                   <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                         <div className={`w-3 h-3 rounded-full mt-1.5 ${
                            event.eventType === 'Prescription' ? 'bg-orange-400' :
                            event.eventType === 'Lab Report' ? 'bg-indigo-400' :
                            event.eventType === 'Admission' ? 'bg-red-400' : 'bg-primary'
                         }`}></div>
                         {idx !== timeline.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-1"></div>}
                      </div>
                      <div className="flex-1 pb-8">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 px-1.5 py-0.5 rounded">
                               {event.eventType}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">{new Date(event.date).toLocaleDateString()}</span>
                         </div>
                         <h4 className="font-bold text-slate-800">
                            {event.eventType === 'Appointment' ? event.type : 
                             event.eventType === 'Prescription' ? 'Medication Dispensed' :
                             event.eventType === 'Lab Report' ? event.testName : 'Hospital Admission'}
                         </h4>
                         <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {event.eventType === 'Appointment' ? event.chiefComplaint :
                             event.eventType === 'Prescription' ? event.medications?.[0]?.name + '...' :
                             event.eventType === 'Lab Report' ? 'Result: ' + (event.result || 'Pending') : 
                             'Ward: ' + (event.bed?.ward || '--')}
                         </p>
                      </div>
                   </div>
                 ))}
                 {timeline.length === 0 && <div className="py-20 text-center text-gray-400 italic">No clinical history recorded.</div>}
              </div>
            ) : activeHistoryTab === 'labs' ? (
               <div className="clinical-card p-0 overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-surface border-b">
                        <tr className="text-[10px] text-gray-400 font-black uppercase">
                           <th className="py-4 px-6">Test</th>
                           <th className="py-4 px-6">Date</th>
                           <th className="py-4 px-6">Result</th>
                           <th className="py-4 px-6">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {labReports.map(report => (
                          <tr key={report._id}>
                             <td className="py-4 px-6 font-bold text-slate-700">{report.testName}</td>
                             <td className="py-4 px-6 text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                             <td className="py-4 px-6 text-xs font-medium text-slate-600 truncate max-w-[150px]">{report.result || '--'}</td>
                             <td className="py-4 px-6">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${report.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                   {report.status}
                                </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : activeHistoryTab === 'meds' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {prescriptions.map(p => (
                    p.medications.map((m, midx) => (
                      <div key={p._id + midx} className="clinical-card p-4 border-l-4 border-l-orange-400">
                         <div className="flex justify-between items-start">
                            <h5 className="font-bold text-slate-800">{m.name}</h5>
                            <span className="text-[8px] font-black uppercase text-gray-400">{new Date(p.date).toLocaleDateString()}</span>
                         </div>
                         <p className="text-xs text-gray-500 mt-1">{m.dosage} - {m.frequency}</p>
                         <p className="text-[10px] italic text-gray-400 mt-2">By: Dr. {p.doctor?.lastName}</p>
                      </div>
                    ))
                 ))}
              </div>
            ) : (
              <div className="space-y-4">
                 {admissions.map(adm => (
                   <div key={adm._id} className="clinical-card p-6 border-l-4 border-l-red-400">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h5 className="font-bold text-slate-800">{adm.diagnosis || 'General Admission'}</h5>
                            <p className="text-xs text-gray-500">Ward {adm.bed?.ward} | Bed {adm.bed?.bedNumber}</p>
                         </div>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${adm.status === 'Active' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                            {adm.status}
                         </span>
                      </div>
                      <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                         <div>
                            Admission: <span className="text-slate-800 ml-1">{new Date(adm.admissionDate).toLocaleString()}</span>
                         </div>
                         {adm.dischargeDate && (
                           <div>
                              Discharge: <span className="text-slate-800 ml-1">{new Date(adm.dischargeDate).toLocaleString()}</span>
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PatientEMR;
