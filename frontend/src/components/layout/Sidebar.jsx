import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sidebarLinks } from '../../data/mockData';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const userInitial = user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : '?';

  const filteredLinks = sidebarLinks.filter(link => {
    const userRole = user?.role?.toUpperCase() || '';
    
    // Platform-wide management
    if (link.id === 'superadmin') return userRole === 'SUPER_ADMIN';
    if (link.id === 'admin') return userRole === 'HOSPITAL_ADMIN' || userRole === 'SUPER_ADMIN';
    
    // Clinical & Administrative roles
    if (link.id === 'doctor') return userRole === 'DOCTOR';
    if (link.id === 'nurse') return userRole === 'NURSE';
    if (link.id === 'reception') return userRole === 'RECEPTIONIST' || userRole === 'HOSPITAL_ADMIN';
    if (link.id === 'pharmacy') return userRole === 'PHARMACIST' || userRole === 'HOSPITAL_ADMIN';
    if (link.id === 'lab') return userRole === 'LAB_TECH' || userRole === 'LAB_TECHNICIAN' || userRole === 'DOCTOR' || userRole === 'HOSPITAL_ADMIN';
    if (link.id === 'bloodbank') return userRole === 'LAB_TECH' || userRole === 'LAB_TECHNICIAN' || userRole === 'HOSPITAL_ADMIN';
    
    // Patient access
    if (link.id === 'patient') return userRole === 'PATIENT';
    
    // Organization management (Tenant specific)
    if (link.id === 'org' || link.id === 'org-staff') return userRole === 'ORG_ADMIN';
    
    return true; // Default show if no specific rule (like Profile)
  });

  return (
    <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">health_and_safety</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-slate-800 tracking-tight">HIMS</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Antigravity</p>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-semibold'
                    : 'text-gray-500 hover:bg-surface-container-low hover:text-gray-900'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <div className="flex items-center space-x-3 mb-6 p-2 rounded-xl bg-surface-container-low">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {userInitial}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase truncate tracking-wider">{user?.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 hover:text-accent-error hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
