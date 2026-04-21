import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'Doctor', specialty: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/org/staff');
      setStaff(response.data.staff);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/org/users', newStaff);
      setSuccess(response.data.message);
      setNewStaff({ firstName: '', lastName: '', email: '', password: '', role: 'Doctor', specialty: '' });
      setShowAddModal(false);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff account.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading staff roster...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage clinical and administrative staff for your facility.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 px-6 py-2.5"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Add New Staff</span>
        </button>
      </header>

      {success && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg border border-emerald-100 flex items-center">
          <span className="material-symbols-outlined mr-2">check_circle</span>
          {success}
        </div>
      )}

      <div className="clinical-card bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Member</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Specialty</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((member) => (
              <tr key={member._id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{member.firstName} {member.lastName}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.role === 'Doctor' ? 'bg-blue-50 text-blue-700' :
                    member.role === 'Nurse' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{member.email}</td>
                <td className="px-6 py-4 text-gray-500 italic">{member.specialty || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No staff members found. Add your first staff member to get started.
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-surface-container-low px-6 py-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800">Add New Staff</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">First Name</label>
                  <input type="text" required value={newStaff.firstName} 
                    onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                    className="w-full px-4 py-2 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Last Name</label>
                  <input type="text" required value={newStaff.lastName} 
                    onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                    className="w-full px-4 py-2 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email Address</label>
                <input type="email" required value={newStaff.email} 
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full px-4 py-2 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Role</label>
                  <select value={newStaff.role} 
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    className="w-full px-4 py-2 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary">
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Lab_Technician">Lab Technician</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Password</label>
                  <input type="password" required value={newStaff.password} 
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    className="w-full px-4 py-2 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {newStaff.role === 'Doctor' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Specialization</label>
                  <input type="text" value={newStaff.specialty} 
                    onChange={(e) => setNewStaff({...newStaff, specialty: e.target.value})}
                    className="w-full px-4 py-2 bg-surface rounded-lg outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Cardiology" />
                </div>
              )}

              <button type="submit" className="w-full btn-primary py-3 font-bold mt-4 uppercase tracking-widest text-xs">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
