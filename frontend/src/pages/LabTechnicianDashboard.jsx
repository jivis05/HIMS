import React, { useState, useEffect } from 'react';
import { labReportAPI } from '../services/api.service';

export const LabTechnicianDashboard = () => {
  const [labReports, setLabReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [observations, setObservations] = useState('');
  const [resultFileUrl, setResultFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await labReportAPI.getAll();
      setLabReports(res.data.labReports || []);
    } catch (error) {
      console.error('Error fetching lab reports', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUploadClick = (report) => {
    if (report.status !== 'Pending') {
      alert('This report is already completed.');
      return;
    }
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setIsSubmitting(true);
      await labReportAPI.uploadResult(selectedReport._id, {
        reportFileUrl: resultFileUrl,
        remarks: observations
      });
      setShowModal(false);
      setObservations('');
      setResultFileUrl('');
      fetchReports();
      alert('Lab results uploaded successfully!');
    } catch (error) {
      console.error('Error uploading results', error);
      alert('Failed to upload results.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingSamples = labReports.filter(r => r.status === 'Pending');
  const recentResults = labReports.filter(r => r.status === 'Completed').slice(0, 5); // top 5 recent

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Laboratory Operations</h2>
          <p className="text-gray-500 mt-1">Manage sample analysis and diagnostics publishing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-sm font-medium text-gray-500">Pending Samples</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-display font-extrabold text-gray-900">{pendingSamples.length}</span>
              <span className="material-symbols-outlined text-gray-300 text-3xl">science</span>
            </div>
          </div>
          <div className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-display font-extrabold text-gray-900">{recentResults.length}</span>
              <span className="material-symbols-outlined text-gray-300 text-3xl">biotech</span>
            </div>
          </div>
          <div className="clinical-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-display font-extrabold text-gray-900">{labReports.length}</span>
              <span className="material-symbols-outlined text-gray-300 text-3xl">assignment</span>
            </div>
          </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 clinical-card p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-display">Pending Sample Analysis</h3>
            <button onClick={fetchReports} className="text-gray-400 hover:text-primary transition-colors p-1 text-sm flex items-center">
              <span className="material-symbols-outlined mr-1 text-lg">refresh</span> Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium px-2">Date</th>
                  <th className="pb-3 font-medium px-2">Patient</th>
                  <th className="pb-3 font-medium px-2">Test Type</th>
                  <th className="pb-3 font-medium px-2">Status</th>
                  <th className="pb-3 font-medium text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading requests...</td></tr>
                ) : pendingSamples.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No pending samples.</td></tr>
                ) : pendingSamples.map((sample, index) => (
                  <tr key={sample._id} className={`transition-colors ${index % 2 === 0 ? 'bg-surface/50' : 'bg-white'} hover:bg-gray-50`}>
                    <td className="py-4 font-mono text-sm text-gray-500 px-2">{new Date(sample.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 font-medium text-gray-900 px-2">{sample.patient?.firstName} {sample.patient?.lastName}</td>
                    <td className="py-4 text-gray-900 font-medium px-2 group-hover:text-primary transition-colors">{sample.testType}</td>
                    <td className="py-4 px-2">
                       <span className="status-pill badge-warning uppercase text-[11px]">
                        {sample.status}
                      </span>
                    </td>
                    <td className="py-4 text-right px-2">
                      <button onClick={() => handleUploadClick(sample)} className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center shadow-sm">
                        <span className="material-symbols-outlined text-sm mr-1">upload</span>
                        Upload Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full xl:w-96 clinical-card-low p-6 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold font-display mb-4 flex items-center">
            <span className="material-symbols-outlined mr-2 text-primary">feed</span>
            Recent Uploads
          </h3>
          <div className="space-y-3">
            {recentResults.length === 0 ? (
              <p className="text-sm text-gray-500">No recent results.</p>
            ) : recentResults.map((result) => (
              <div key={result._id} className="bg-white p-4 rounded-md shadow-sm border border-transparent hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-medium font-mono">
                    {new Date(result.updatedAt).toLocaleDateString()}
                  </span>
                  {result.resultFileUrl && (
                    <a href={result.resultFileUrl} target="_blank" rel="noreferrer" className="material-symbols-outlined text-sm text-gray-300 hover:text-primary transition-colors cursor-pointer">download</a>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{result.testType}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{result.observations}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="glass-header px-6 py-4 flex justify-between items-center text-slate-800">
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                Upload Lab Results
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleResultSubmit} className="p-6 space-y-4 text-left">
              <div className="bg-surface-container-low p-3 rounded-md text-sm mb-4">
                <p><span className="font-semibold text-slate-700">Patient:</span> {selectedReport.patient?.firstName} {selectedReport.patient?.lastName}</p>
                <p><span className="font-semibold text-slate-700">Test Type:</span> {selectedReport.testType}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Observations / Notes</label>
                <textarea 
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="input-field min-h-[100px]" 
                  placeholder="e.g. Hemoglobin levels normal..." 
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Result File URL (Document/PDF link)</label>
                <input 
                  type="url" 
                  value={resultFileUrl}
                  onChange={(e) => setResultFileUrl(e.target.value)}
                  className="input-field" 
                  placeholder="https://example.com/result.pdf" 
                  required 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Uploading...' : 'Submit Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LabTechnicianDashboard;
