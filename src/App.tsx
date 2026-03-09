import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Plus, Wallet, PieChart as ChartIcon, Edit3, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type Category = 'Food' | 'Travel' | 'Bills' | 'Others';
interface Expense { id: string; amount: number; category: Category; date: string; note: string; }

const CATEGORIES: Category[] = ['Food', 'Travel', 'Bills', 'Others'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

const formatCurrency = (val: number): string => {
  if (val >= 1e9) return `₹${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `₹${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `₹${(val / 1e3).toFixed(1)}K`;
  return `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
};

export default function SmartExpenseTracker() {
  const today = new Date().toISOString().split('T')[0];
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { const saved = localStorage.getItem('smart_expense_data'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });

  const [formData, setFormData] = useState({ amount: '', category: 'Food' as Category, date: today, note: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'recent' | 'highest'>('recent');

  useEffect(() => { localStorage.setItem('smart_expense_data', JSON.stringify(expenses)); }, [expenses]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!formData.amount || !formData.date || amount <= 0) return;

    if (editingId) {
      setExpenses(prev => prev.map(exp => exp.id === editingId ? { ...exp, ...formData, amount } : exp));
      setEditingId(null);
    } else {
      setExpenses([{ id: crypto.randomUUID(), amount, category: formData.category, date: formData.date, note: formData.note }, ...expenses]);
    }
    setFormData({ amount: '', category: 'Food', date: today, note: '' });
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setFormData({ amount: exp.amount.toString(), category: exp.category, date: exp.date, note: exp.note });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => { if (window.confirm("Delete all transactions?")) setExpenses([]); };
  const handleDelete = (id: string) => setExpenses(prev => prev.filter(exp => exp.id !== id));

  const processedExpenses = useMemo(() => {
    let result = [...expenses];
    if (filter !== 'All') result = result.filter(e => e.category === filter);
    return result.sort((a, b) => sortOrder === 'recent' ? new Date(b.date).getTime() - new Date(a.date).getTime() : b.amount - a.amount);
  }, [expenses, filter, sortOrder]);

  const chartData = useMemo(() => CATEGORIES.map(cat => ({
    name: cat, value: expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
  })).filter(item => item.value > 0), [expenses]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3"><Wallet size={42} /> SmartTracker</h1>
            <p className="text-indigo-100 mt-2">Managing your daily budget with precision.</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase font-bold text-indigo-200">Total Spent</p>
            <div className="text-5xl font-black">{formatCurrency(totalSpent)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border shadow-sm h-[400px]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ChartIcon className="text-indigo-600"/> Spending by Category</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, bottom: 40 }}>
                <Pie data={chartData} cx="50%" cy="45%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                {/* Properly typed tooltip without 'any' */}
                <Tooltip 
  formatter={(value: number | string | undefined) => {
    // Ensure we are working with a valid number before formatting
    const numericValue = typeof value === 'number' ? value : parseFloat(value || '0');
    return [formatCurrency(numericValue), 'Amount'];
  }} 
/>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              {editingId ? <Edit3 className="text-amber-500"/> : <Plus className="text-indigo-600"/>} 
              {editingId ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="number" required placeholder="Amount (₹)" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
  <select 
    className="p-3 bg-slate-50 border rounded-xl" 
    value={formData.category} 
    onChange={e => setFormData({...formData, category: e.target.value as Category})}
  >
    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
  </select>
  
  <input 
    type="date" 
    required 
    max={today} // Restricts to today or past dates
    className="p-3 bg-slate-50 border rounded-xl" 
    value={formData.date} 
    onChange={e => setFormData({...formData, date: e.target.value})} 
  />
</div>
              <textarea placeholder="Note" rows={3} className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
              <button className={`w-full py-3 rounded-xl font-bold text-white ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                {editingId ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border flex justify-between items-center">
            <div className="flex items-center gap-4">
              <select className="font-bold p-2 bg-slate-50 rounded-lg" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={clearAll} className="text-red-500 text-sm font-bold flex items-center gap-1"><XCircle size={16}/> Clear All</button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setSortOrder('recent')} className={`px-4 py-1 text-xs font-bold rounded ${sortOrder === 'recent' ? 'bg-white shadow' : ''}`}>Recent</button>
              <button onClick={() => setSortOrder('highest')} className={`px-4 py-1 text-xs font-bold rounded ${sortOrder === 'highest' ? 'bg-white shadow' : ''}`}>Highest</button>
            </div>
          </div>

          <div className="space-y-3">
            {processedExpenses.map(exp => (
              <div key={exp.id} className="bg-white p-5 rounded-2xl border flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{exp.category}</h4>
                  <p className="text-xs text-slate-500">{exp.date} • {exp.note}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-xl">{formatCurrency(exp.amount)}</span>
                  <button onClick={() => startEdit(exp)} className="text-slate-400 hover:text-amber-500"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}