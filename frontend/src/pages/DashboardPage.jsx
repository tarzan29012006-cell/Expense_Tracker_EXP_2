import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/Header';
import { SummaryCards } from '../components/SummaryCards';
import { ExpenseOverview } from '../components/ExpenseOverview';
import { RecentTransactions } from '../components/RecentTransactions';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { QuickInsights } from '../components/QuickInsights';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { trackerAPI } from '../api/client';

export const DashboardPage = () => {
  const outletCtx = useOutletContext() || {};
  const onToggleSidebar = outletCtx.onToggleSidebar;
  const [period, setPeriod] = useState('this_month');
  const [summary, setSummary] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  // Edit Modal state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async (currentPeriod) => {
    try {
      const [sumRes, expRes, txnRes, catRes, insRes] = await Promise.all([
        trackerAPI.getSummary(currentPeriod),
        trackerAPI.getExpensesByCategory(currentPeriod),
        trackerAPI.getTransactions({ limit: 4, period: currentPeriod }),
        trackerAPI.getCategories(),
        trackerAPI.getInsights(currentPeriod),
      ]);

      setSummary(sumRes);
      setExpenseData(expRes);
      setTransactions(txnRes);
      setCategories(catRes);
      setInsights(insRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  // FR-12: After a successful add, cards, chart, list and insights refresh without page reload
  const handleAddExpense = async (formData) => {
    setAddLoading(true);
    try {
      await trackerAPI.addTransaction(formData);
      await loadData(period);
      showToast('Expense added successfully!');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditClick = (txn) => {
    setEditingTransaction(txn);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id, updatedData) => {
    await trackerAPI.updateTransaction(id, updatedData);
    await loadData(period);
    showToast('Transaction updated successfully!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await trackerAPI.deleteTransaction(id);
      await loadData(period);
      showToast('Transaction deleted successfully!');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        period={period}
        onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
        onToggleSidebar={onToggleSidebar}
      />

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Main 2-column Grid replicating the mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Expense Overview & Recent Transactions */}
        <div className="lg:col-span-8 space-y-7">
          <ExpenseOverview expenseData={expenseData} />
          <RecentTransactions
            transactions={transactions}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>

        {/* Right Column: Add Expense & Quick Insights */}
        <div className="lg:col-span-4 space-y-7">
          <AddExpenseForm
            categories={categories}
            onAddExpense={handleAddExpense}
            loading={addLoading}
          />
          <QuickInsights insights={insights} />
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
    </div>
  );
};
