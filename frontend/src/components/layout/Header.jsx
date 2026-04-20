import React from 'react';

export const Header = () => {
  return (
    <header className="glass-header sticky top-0 z-10 w-full h-20 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input 
            type="text" 
            placeholder="Search patients, doctors, or ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 ml-4">
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
          <span className="text-sm font-medium">City Central Hospital</span>
          <span className="material-symbols-outlined text-sm text-gray-400">expand_more</span>
        </div>

        <button className="relative text-gray-500 hover:text-primary transition-colors">
          <span className="material-symbols-outlined pb-1">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent-error rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
