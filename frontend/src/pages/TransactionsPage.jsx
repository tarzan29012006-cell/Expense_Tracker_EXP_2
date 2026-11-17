import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Utensils, 
  Car, 
  ShoppingBag, 
  MoreHorizontal, 
  Receipt,
  ArrowUpDown,
  Calendar,
  X
} from 'lucide-react';
import { trackerAPI } from '../api/client';
import { EditTransactionModal } from '../components/EditTransactionModal';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // New Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('expense');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [addLoading, setAddLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;
      if (selectedPeriod && selectedPeriod !== 'all') params.period = selectedPeriod;

      const [txnRes, catRes] = await Promise.all([
        trackerAPI.getTransactions(params),
        trackerAPI.getCategories(),
      ]);
      setTransactions(txnRes);
      setCategories(catRes);
      if (catRes.length > 0 && !newCatId) setNewCatId(catRes[0].id);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedType, selectedPeriod, newCatId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddNew = async (e) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) return;
    if (newType === 'expense' && !newCatId) return;

    setAddLoading(true);
    try {
      await trackerAPI.addTransaction({
        amount: parseFloat(newAmount),
        category_id: newType === 'expense' ? newCatId : null,
        description: newDesc.trim(),
        type: newType,
        date: newDate,
      });
      setIsAddModalOpen(false);
      setNewAmount('');
      setNewDesc('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await trackerAPI.deleteTransaction(id);
      await loadData();
    }
  };

  const handleSaveEdit = async (id, data) => {
    await trackerAPI.updateTransaction(id, data);
    await loadData();
  };

  const getCategoryStyles = (catName) => {
    switch (catName?.toLowerCase()) {
      case 'food':
        return { icon: Utensils, iconBg: 'bg-[#FFEDD5] text-[#EA580C]', tagBg: 'bg-[#FFEDD5] text-[#EA580C]' };
      case 'travel':
        return { icon: Car, iconBg: 'bg-[#E0F2FE] text-[#0284C7]', tagBg: 'bg-[#E0F2FE] text-[#0284C7]' };
      case 'shopping':
        return { icon: ShoppingBag, iconBg: 'bg-[#DCFCE7] text-[#16A34A]', tagBg: 'bg-[#DCFCE7] text-[#16A34A]' };
      case 'others':
        return { icon: MoreHorizontal, iconBg: 'bg-[#F3E8FF] text-[#9333EA]', tagBg: 'bg-[#F3E8FF] text-[#9333EA]' };
      default:
        return { icon: Receipt, iconBg: 'bg-slate-100 text-slate-600', tagBg: 'bg-slate-100 text-slate-700' };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Transactions
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            Search, filter, edit and track every expense and income entry.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 text-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
          >
            <option value="">All Types (Income & Expense)</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>{transactions.length} Transactions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No transactions match your criteria.</div>
          ) : (
            transactions.map((txn) => {
              const catName = txn.category_detail?.name || (txn.type === 'income' ? 'Income' : 'Others');
              const { icon: CatIcon, iconBg, tagBg } = getCategoryStyles(catName);
              const isMenuOpen = activeMenuId === txn.id;

              return (
                <div
                  key={txn.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors relative"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <CatIcon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {txn.description || catName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-medium">
                          {formatDate(txn.date)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${tagBg}`}>
                          {catName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    <span
                      className={`font-bold text-base sm:text-lg ${
                        txn.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {txn.type === 'income' ? '+' : '-'} ₹{Number(txn.amount).toLocaleString('en-IN')}
                    </span>

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : txn.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setEditingTransaction(txn);
                                setIsEditModalOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDelete(txn.id);
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

      {/* Edit Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        transaction={editingTransaction}
        categories={categories}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Add New Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Add New Transaction</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNew} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      newType === 'expense'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('income')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      newType === 'income'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {newType === 'expense' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Grocery shopping"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60"
                >
                  <span>{addLoading ? 'Adding...' : 'Add Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
