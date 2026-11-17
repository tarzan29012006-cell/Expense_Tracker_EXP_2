import React from 'react';
import { Wallet, Receipt, PiggyBank, Smile } from 'lucide-react';

export const SummaryCards = ({ summary }) => {
  const formatINR = (val) => {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  };

  const incomeChange = summary?.income_change_pct ?? 5.0;
  const expenseChange = summary?.expense_change_pct ?? 8.0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-7">
      {/* 1. Total Income Card */}
      <div className="relative overflow-hidden bg-[#E8F8F0] border border-emerald-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Wallet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-slate-600 font-medium text-xs md:text-sm">Total Income</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight">
                {formatINR(summary?.total_income ?? 50000)}
              </span>
              <span className="text-emerald-600 font-bold text-xs flex items-center">
                ↑ +{incomeChange}%
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Sparkline in bottom right corner */}
        <div className="absolute right-0 bottom-1 pointer-events-none opacity-40">
          <svg width="110" height="40" viewBox="0 0 110 40" fill="none">
            <path
              d="M0 35 C30 38, 50 15, 80 20 C95 22, 100 5, 110 8"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* 2. Total Expenses Card */}
      <div className="relative overflow-hidden bg-[#FDECEF] border border-rose-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#EF4444] flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            <Receipt className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-slate-600 font-medium text-xs md:text-sm">Total Expenses</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight">
                {formatINR(summary?.total_expenses ?? 32450)}
              </span>
              <span className="text-rose-600 font-bold text-xs flex items-center">
                ↑ +{expenseChange}%
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Sparkline in bottom right corner */}
        <div className="absolute right-0 bottom-1 pointer-events-none opacity-40">
          <svg width="110" height="40" viewBox="0 0 110 40" fill="none">
            <path
              d="M0 30 C25 28, 45 38, 70 25 C90 15, 100 8, 110 12"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* 3. Remaining Balance Card */}
      <div className="relative overflow-hidden bg-[#EBF0FE] border border-indigo-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <PiggyBank className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-slate-600 font-medium text-xs md:text-sm">Remaining Balance</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight">
                {formatINR(summary?.remaining_balance ?? 17550)}
              </span>
              <span className="text-indigo-600 text-lg leading-none" title="Looking healthy!">
                😊
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Sparkline in bottom right corner */}
        <div className="absolute right-0 bottom-1 pointer-events-none opacity-40">
          <svg width="110" height="40" viewBox="0 0 110 40" fill="none">
            <path
              d="M0 32 C20 36, 45 18, 75 22 C95 24, 105 10, 110 6"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
