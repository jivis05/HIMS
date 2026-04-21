import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { sidebarLinks } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  const filteredLinks = sidebarLinks.filter(link => {
    if (link.id === 'superadmin') return user?.role === 'Super_Admin';
    if (link.id === 'admin') return ['Super_Admin', 'Hospital_Admin'].includes(user?.role);
    if (link.id === 'reception') return ['Super_Admin', 'Hospital_Admin', 'Receptionist'].includes(user?.role);
    if (link.id === 'doctor') return user?.role === 'Doctor';
    if (link.id === 'patient') return user?.role === 'Patient';
    if (link.id === 'pharmacy') return ['Super_Admin', 'Hospital_Admin', 'Pharmacist'].includes(user?.role);
    if (link.id === 'lab') return ['Super_Admin', 'Hospital_Admin', 'Lab_Technician', 'Doctor'].includes(user?.role);
    if (link.id === 'bloodbank') return ['Super_Admin', 'Hospital_Admin'].includes(user?.role);
    if (link.id === 'orgadmin' || link.id === 'orgstaff') return user?.role === 'ORG_ADMIN';
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-dark text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-display font-bold text-white tracking-wide">
          HIMS<span className="text-primary-container">.</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Healthcare Portal</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span className="material-symbols-outlined text-lg">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`
          }
        >
          <span className="material-symbols-outlined text-lg">account_circle</span>
          <span className="font-medium">My Profile</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary-hover font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
