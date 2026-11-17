import React, { useState } from 'react';
import { 
  Clock, 
  ArrowRight, 
  MoreVertical, 
  Utensils, 
  Car, 
  ShoppingBag, 
  MoreHorizontal, 
  Edit2, 
  Trash2,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentTransactions = ({ transactions, onEdit, onDelete }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const getCategoryStyles = (catName) => {
    switch (catName?.toLowerCase()) {
      case 'food':
        return {
          icon: Utensils,
          iconBg: 'bg-[#FFEDD5] text-[#EA580C]',
          tagBg: 'bg-[#FFEDD5] text-[#EA580C]',
        };
      case 'travel':
        return {
          icon: Car,
          iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
          tagBg: 'bg-[#E0F2FE] text-[#0284C7]',
        };
      case 'shopping':
        return {
          icon: ShoppingBag,
          iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
          tagBg: 'bg-[#DCFCE7] text-[#16A34A]',
        };
      case 'others':
        return {
          icon: MoreHorizontal,
          iconBg: 'bg-[#F3E8FF] text-[#9333EA]',
          tagBg: 'bg-[#F3E8FF] text-[#9333EA]',
        };
      default:
        return {
          icon: Receipt,
          iconBg: 'bg-slate-100 text-slate-600',
          tagBg: 'bg-slate-100 text-slate-700',
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (txn) => {
    const num = Number(txn.amount) || 0;
    const formatted = '₹' + num.toLocaleString('en-IN');
    if (txn.type === 'income') {
      return `+ ${formatted}`;
    }
    return `- ${formatted}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="text-slate-700">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Transactions</h2>
        </div>

        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Transaction list */}
      <div className="divide-y divide-slate-100">
        {!transactions || transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No transactions found for this period.
          </div>
        ) : (
          transactions.slice(0, 4).map((txn) => {
            const catName = txn.category_detail?.name || 'Others';
            const { icon: CatIcon, iconBg, tagBg } = getCategoryStyles(catName);
            const isMenuOpen = activeMenuId === txn.id;

            return (
              <div
                key={txn.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors relative"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <CatIcon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {txn.description || catName}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {formatDate(txn.date)}
                    </p>
                  </div>
                </div>

                {/* Right: Tag, Amount, Menu */}
                <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                  {/* Category Pill */}
                  <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold ${tagBg}`}>
                    {catName}
                  </span>

                  {/* Amount */}
                  <span
                    className={`font-bold text-sm sm:text-base ${
                      txn.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {formatAmount(txn)}
                  </span>

                  {/* Three-dot menu button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : txn.id);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Dropdown */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onEdit(txn);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete(txn.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
