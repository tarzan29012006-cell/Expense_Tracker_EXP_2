import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, Utensils, Car, ShoppingBag, MoreHorizontal, Check } from 'lucide-react';

export const AddExpenseForm = ({ categories, onAddExpense, loading }) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Set default category once categories load
  React.useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const selectedCategory = categories?.find(c => String(c.id) === String(categoryId)) || categories?.[0];

  const getCategoryIcon = (name) => {
    switch (name?.toLowerCase()) {
      case 'food': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'travel': return <Car className="w-4 h-4 text-blue-500" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'others': return <MoreHorizontal className="w-4 h-4 text-purple-500" />;
      default: return <Utensils className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0.';
    }

    if (!categoryId) {
      newErrors.category = 'Please select a category.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      await onAddExpense({
        amount: parseFloat(amount),
        category_id: categoryId,
        description: description.trim(),
        type: 'expense',
      });
      // Reset form
      setAmount('');
      setDescription('');
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Failed to add expense.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Calendar className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Add Expense</h2>
      </div>

      {errors.form && (
        <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Field 1: Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
            }}
            placeholder="Enter amount"
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none transition-all ${
              errors.amount
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
          />
          {errors.amount && (
            <p className="text-rose-500 text-xs font-semibold mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Field 2: Category Dropdown */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
          >
            <div className="flex items-center gap-2.5">
              {getCategoryIcon(selectedCategory?.name)}
              <span>{selectedCategory?.name || 'Select category'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      setIsDropdownOpen(false);
                      if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                      String(categoryId) === String(cat.id)
                        ? 'bg-indigo-50/70 text-indigo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {getCategoryIcon(cat.name)}
                      <span>{cat.name}</span>
                    </div>
                    {String(categoryId) === String(cat.id) && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          {errors.category && (
            <p className="text-rose-500 text-xs font-semibold mt-1">{errors.category}</p>
          )}
        </div>

        {/* Field 3: Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Lunch at cafe"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-[#5046E5] hover:bg-[#4338CA] active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
