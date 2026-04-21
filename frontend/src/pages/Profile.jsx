import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api.service';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '../hooks/useMutation';

const Profile = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    bio: '',
    specialty: '',
    degree: '',
    experience: '',
    hospitalName: '',
    bloodGroup: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const { handleMutation, isLoading } = useMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        specialty: user.specialty || '',
        degree: user.degree || '',
        experience: user.experience || '',
        hospitalName: user.hospitalName || '',
        bloodGroup: user.bloodGroup || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    await handleMutation(
      () => userAPI.update(user.id, formData),
      {
        refreshSession: true,
        onSuccess: () => {
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
          setIsEditing(false);
        },
        onError: (errMessage) => {
          setMessage({ type: 'error', text: errMessage || 'Failed to update profile.' });
        }
      }
    );
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This will permanently delete your account and all associated data.')) {
      try {
        await userAPI.delete(user.id);
        alert('Account deleted successfully.');
        logout();
        navigate('/auth/login');
      } catch (err) {
        alert('Failed to delete account.');
      }
    }
  };

  const handleImageUpload = (e) => {
     const file = e.target.files[0];
     if (file) {
        // In a real app, we'd upload to S3/Cloudinary and get a URL
        // For this demo, we'll convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
           setFormData(prev => ({ ...prev, profileImage: reader.result }));
        };
        reader.readAsDataURL(file);
     }
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Your Profile</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your personal information and security settings.</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="clinical-card p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 bg-surface flex items-center justify-center text-4xl font-display font-black text-primary">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.firstName[0]}{formData.lastName[0]}</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="material-symbols-outlined text-white">photo_camera</span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{formData.firstName} {formData.lastName}</h2>
            <p className="text-sm font-black text-primary uppercase tracking-widest mt-1">{user.role.replace('_', ' ')}</p>
            <div className="mt-8 pt-6 border-t border-gray-100 w-full space-y-4">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-black uppercase">Member Since</span>
                  <span className="text-slate-600 font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="clinical-card p-8">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Basic Information</h3>
               {!isEditing && (
                 <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-primary hover:underline">Edit Details</button>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                     <input 
                       disabled={!isEditing} 
                       name="firstName"
                       value={formData.firstName}
                       onChange={handleChange}
                       className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                     <input 
                       disabled={!isEditing} 
                       name="lastName"
                       value={formData.lastName}
                       onChange={handleChange}
                       className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    disabled={!isEditing} 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60" 
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                  <input 
                    disabled={!isEditing} 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60" 
                    placeholder="+91 99999 99999"
                  />
               </div>

               {/* Role-Specific Professional Fields */}
               <div className="pt-4 space-y-6">
                  {(user.role === 'Doctor' || user.role === 'Hospital_Admin') && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hospital Name</label>
                       <input 
                         disabled={!isEditing} 
                         name="hospitalName"
                         value={formData.hospitalName}
                         onChange={handleChange}
                         className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60 font-display" 
                         placeholder="e.g. City Central Hospital"
                       />
                    </div>
                  )}

                  {user.role === 'Doctor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialization</label>
                          <input 
                            disabled={!isEditing} 
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60" 
                            placeholder="e.g. Cardiology"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Degrees / Qualifications</label>
                          <input 
                            disabled={!isEditing} 
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60" 
                            placeholder="e.g. MBBS, MD"
                          />
                       </div>
                    </div>
                  )}

                  {user.role === 'Patient' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Blood Group</label>
                       <select 
                         disabled={!isEditing} 
                         name="bloodGroup"
                         value={formData.bloodGroup}
                         onChange={handleChange}
                         className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60"
                       >
                         <option value="">Select Blood Group</option>
                         {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                           <option key={bg} value={bg}>{bg}</option>
                         ))}
                       </select>
                    </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professional Bio</label>
                     <textarea 
                       disabled={!isEditing} 
                       name="bio"
                       value={formData.bio}
                       onChange={handleChange}
                       className="w-full bg-surface border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-bold text-slate-700 disabled:opacity-60 min-h-[100px]" 
                       placeholder="Tell us about yourself..."
                     />
                  </div>
               </div>

               {isEditing && (
                 <div className="pt-6 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Saving...' : 'Sync Changes'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="text-sm font-bold text-gray-400 hover:text-gray-600 px-4"
                    >
                      Discard
                    </button>
                 </div>
               )}
            </form>
          </div>

          <div className="clinical-card p-8 mt-8 border-l-4 border-l-red-100">
             <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
             <p className="text-xs text-gray-400 mb-6 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
             <button 
               onClick={handleDeleteAccount}
               className="bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-black uppercase transition-colors"
             >
               Permanently Deactivate Account
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
