import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, PieChart, ShieldCheck, Target } from 'lucide-react';
import { trackerAPI, authAPI } from '../api/client';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [period, setPeriod] = useState('this_month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sum, exp, prof] = await Promise.all([
          trackerAPI.getSummary(period),
          trackerAPI.getExpensesByCategory(period),
          authAPI.getMe(),
        ]);
        setSummary(sum);
        setExpenseData(exp);
        setUserProfile(prof);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  const budget = userProfile?.monthly_budget ? Number(userProfile.monthly_budget) : 40000;
  const spent = summary?.total_expenses || 0;
  const budgetPercent = Math.min(Math.round((spent / budget) * 100), 100);
  const isOverBudget = spent > budget;

  const savings = (summary?.total_income || 0) - spent;
  const savingsRate = summary?.total_income > 0 ? Math.round((savings / summary.total_income) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            Deep dive into your financial habits and budget performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['this_month', 'last_month', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p === 'this_month' ? 'This Month' : p === 'last_month' ? 'Last Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Row: Budget & Savings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Tracker Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Monthly Budget Target</h3>
                <p className="text-xs text-slate-400 font-medium">Budget: {formatINR(budget)}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isOverBudget ? 'Exceeded' : 'On Track'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Spent: {formatINR(spent)}</span>
              <span>{budgetPercent}% used</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-rose-500' : budgetPercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {isOverBudget
                ? `You have exceeded your budget by ${formatINR(spent - budget)}.`
                : `You still have ${formatINR(budget - spent)} safe to spend this month.`}
            </p>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Net Savings</h3>
                <p className="text-xs text-slate-400 font-medium">Income minus Expenses</p>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-600">{savingsRate}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Saved this period</span>
              <span className="font-bold text-slate-900">{formatINR(savings)}</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              A 20%+ savings rate is recommended for financial freedom.
            </p>
          </div>
        </div>
      </div>

      {/* Category Spend Distribution Bars */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Category Spending Breakdown</h2>
            <p className="text-xs text-slate-400 font-medium">Comparison of spend distribution</p>
          </div>
        </div>

        <div className="space-y-4">
          {expenseData?.categories?.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs md:text-sm font-semibold">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="text-slate-900">
                  {formatINR(cat.amount)}{' '}
                  <span className="text-xs text-slate-400 font-normal">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
