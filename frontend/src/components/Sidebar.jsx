import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Menu as MenuIcon, 
  BarChart2, 
  Settings as SettingsIcon, 
  LogOut, 
  Wallet,
  PiggyBank,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await logout();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/home', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: MenuIcon },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1E194B] text-white flex flex-col justify-between select-none shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Navigation */}
        <div className="p-6">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                <Wallet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-lg tracking-tight text-white">Expense</span>
                <span className="block font-bold text-lg tracking-tight text-white -mt-1">Tracker</span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="md:hidden text-indigo-200 hover:text-white p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-600/30'
                        : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-indigo-200/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 text-left mt-2"
            >
              <LogOut className="w-5 h-5 stroke-[2]" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Bottom decorative section matching mockup */}
        <div className="relative overflow-hidden pt-8 pb-7 px-6">
          {/* Subtle curved background wave shape */}
          <div className="absolute inset-0 bg-[#161238] rounded-t-[32px] -z-0">
            <svg 
              className="absolute top-0 left-0 w-full text-[#1E194B] fill-current" 
              viewBox="0 0 256 48" 
              preserveAspectRatio="none"
            >
              <path d="M0,0 C80,35 180,4 256,24 L256,0 L0,0 Z"></path>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-start gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner">
              <PiggyBank className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-white font-bold text-base tracking-tight leading-tight">Save Smart.</p>
              <p className="text-white font-bold text-base tracking-tight leading-tight">Live Better.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
