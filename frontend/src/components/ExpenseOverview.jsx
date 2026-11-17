import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';

export const ExpenseOverview = ({ expenseData }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = expenseData?.categories || [
    { name: 'Food', amount: 12000, percentage: 37, color: '#FB923C' },
    { name: 'Travel', amount: 8500, percentage: 26, color: '#3B82F6' },
    { name: 'Shopping', amount: 7200, percentage: 22, color: '#10B981' },
    { name: 'Others', amount: 4750, percentage: 15, color: '#A855F7' },
  ];

  const totalSpent = expenseData?.total_spent ?? 32450;

  // Format currency
  const formatINR = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // SVG Donut calculation
  // Radius = 65, Circumference = 2 * PI * 65 = 408.407
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5">
          <div className="text-slate-700">
            <BarChart2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Expense Overview</h2>
        </div>

        {/* Top Legend */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-600">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-1.5 cursor-pointer"
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className={hoveredCategory === cat.name ? 'font-bold text-slate-900' : ''}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart & Category List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-6 flex justify-center items-center relative py-2">
          <div className="relative w-48 h-48 md:w-52 md:h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 170 170">
              {/* Background ring */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="24"
              />

              {/* Category arcs */}
              {categories.map((cat) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += cat.percentage;

                const isHovered = hoveredCategory === cat.name;

                return (
                  <circle
                    key={cat.name}
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isHovered ? 28 : 24}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {formatINR(totalSpent)}
              </span>
              <span className="text-xs text-slate-400 font-semibold mt-1">
                Total Spent
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Details */}
        <div className="md:col-span-6 space-y-3.5 pl-0 md:pl-4">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.name;
            return (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-50 scale-[1.02]' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-900">
                    {formatINR(cat.amount)}
                  </span>
                  <span className="text-xs font-medium text-slate-400 w-11 text-right">
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
