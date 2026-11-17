import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Menu as MenuIcon, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ period, onPeriodChange, onToggleSidebar }) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.first_name || user?.username || 'Kirthick';

  const periods = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'All Time', value: 'all' },
  ];

  const currentLabel = periods.find(p => p.value === period)?.label || 'This Month';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
      {/* Left: Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Toggle Navigation"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Hello, {displayName}! <span className="inline-block animate-wiggle">👋</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-0.5">
            Track your expenses, take control of your finances.
          </p>
        </div>
      </div>

      {/* Right: Period Filter & Avatar */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Period dropdown button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-slate-300 transition-all font-semibold text-xs md:text-sm text-slate-700"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{currentLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Period
              </div>
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    onPeriodChange(p.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs md:text-sm font-medium transition-colors ${
                    period === p.value
                      ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{p.label}</span>
                  {period === p.value && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User avatar circle */}
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full ring-2 ring-white shadow-sm overflow-hidden bg-slate-200 flex-shrink-0 cursor-pointer hover:ring-indigo-300 transition-all">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150&q=80"
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
