import React, { useState, useMemo } from 'react';
import { 
  Trash2, Edit3, Plus, Search, LayoutDashboard, 
  Wallet, X,  TrendingUp, Heart
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
}

const App: React.FC = () => {
  const todayDate = new Date().toISOString().split('T')[0];

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    date: todayDate,
    category: ''
  });

  const totalAmount = useMemo(() => 
    expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

  const highestCategory = useMemo(() => {
    if (expenses.length === 0) return { name: 'None', amount: 0 };
    const totals: Record<string, number> = {};
    expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    const topEntry = Object.entries(totals).reduce((a, b) => (a[1] > b[1] ? a : b));
    return { name: topEntry[0], amount: topEntry[1] };
  }, [expenses]);

  const chartData = useMemo(() => {
    const categories = [
      { name: 'Bills', color: '#8b5cf6' },
      { name: 'Food', color: '#f59e0b' },
      { name: 'Travel', color: '#3b82f6' },
      { name: 'Other', color: '#ec4899' },
    ];
    return categories.map(cat => ({
      ...cat,
      value: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0)
    })).filter(item => item.value > 0);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.date.includes(searchQuery)
    );
  }, [expenses, searchQuery]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;
    const newExpense: Expense = {
      id: Date.now(),
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount)
    };
    setExpenses([newExpense, ...expenses]);
    setFormData({ amount: '', date: todayDate, category: '' });
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setFormData({ amount: exp.amount.toString(), date: exp.date, category: exp.category });
  };

  const saveEdit = () => {
    setExpenses(expenses.map(e => e.id === editingId ? 
      { ...e, amount: parseFloat(formData.amount), date: formData.date, category: formData.category } : e
    ));
    setEditingId(null);
    setFormData({ amount: '', date: todayDate, category: '' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      <header className="bg-[#1e293b] border-b border-slate-700/50 px-4 py-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <div className="flex items-center gap-3">
            <Wallet className="text-blue-400" size={26} />
            <h1 className="text-xl font-bold tracking-[0.2em] text-white uppercase text-center">
              Smart Expense Tracker Dashboard
            </h1>
          </div>
        </div>
      </header>

      <main className="bg-[#f5f2f0] mx-auto w-full p-4 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        <aside className="lg:col-span-3">
          <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-xl lg:sticky lg:top-32">
            <h2 className="text-sm font-black text-stone-800 mb-8 uppercase tracking-widest border-b border-stone-100 pb-4">
              {editingId ? 'Modify Record' : 'New Entry'}
            </h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-semibold text-black-800 mb-1.5 block  text-[16px]">Amount (₹)</label>
                <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-stone-900 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-black-800 mb-1.5 block  text-[16px]">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-stone-900 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-black-800 mb-1.5 block  text-[16px]">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-stone-900 outline-none cursor-pointer focus:border-blue-400 transition-all">
                  <option value="" disabled hidden>Choose Category</option>
                  <option value="Food">Food</option><option value="Travel">Travel</option><option value="Bills">Bills</option><option value="Other">Other</option>
                </select>
              </div>
              {editingId ? (
                <div className="flex gap-3">
                  <button onClick={saveEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all">Save</button>
                  <button onClick={() => {setEditingId(null); setFormData({amount: '', date: todayDate, category: ''})}} className="bg-stone-100 text-stone-500 px-5 rounded-2xl hover:bg-stone-200 transition-all"><X size={20}/></button>
                </div>
              ) : (
                <button onClick={handleAddExpense} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Plus size={20}/> Add Entry
                </button>
              )}
            </form>
          </div>
        </aside>

        <section className="lg:col-span-9 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div><p className="text-black-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Total Amount</p><h3 className="text-2xl font-black text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</h3></div>
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-400"><Wallet size={24} /></div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div><p className="text-black-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Top Spending</p><h3 className="text-2xl font-black text-emerald-600">{highestCategory.name}</h3></div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-400"><TrendingUp size={24} /></div>
            </div>
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
                <div><p className="text-black-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Entries</p><h3 className="text-2xl font-black text-stone-800">{expenses.length}</h3></div>
                <div className="p-3 bg-stone-50 rounded-2xl text-stone-400"><LayoutDashboard size={24} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-7 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                <h2 className="font-black text-black-800 uppercase text-xXs tracking-widest">Transactions</h2>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input type="text" placeholder="Filter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-stone-50 border border-stone-100 rounded-full pl-11 pr-5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-stone-200 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-black-400 text-[13px] uppercase font-semibold border-b border-stone-50 bg-stone-50/30">
                    <tr><th className="px-7 py-5">Date</th><th className="px-7 py-5">Category</th><th className="px-7 py-5 text-center">Amount</th><th className="px-7 py-5 text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 text-sm">
                    {filteredExpenses.length === 0 ? (
                      <tr><td colSpan={4} className="px-7 py-16 text-center text-stone-300 italic">No entries yet.</td></tr>
                    ) : (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-7 py-5 text-stone-500 font-medium whitespace-nowrap">{exp.date}</td>
                          <td className="px-7 py-5">
                            <span className="text-[10px] font-black uppercase text-black-600 tracking-wider">
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-7 py-5 font-black text-stone-900 text-center">₹{exp.amount.toLocaleString('en-IN')}</td>
                          <td className="px-7 py-5 text-center flex justify-center gap-4">
                              <button onClick={() => startEdit(exp)} className="text-blue-500 cursor-pointer transition-transform active:scale-90"><Edit3 size={18}/></button>
                              <button onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))} className="text-rose-500 cursor-pointer transition-transform active:scale-90"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm flex flex-col items-center">
              <h2 className="font-black text-stone-800 mb-8 self-start uppercase tracking-widest text-xxs">Distribution</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="#fff" strokeWidth={4} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '15px', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                      itemStyle={{ color: '#1c1917', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-5 mt-6 border-t border-stone-100 pt-8 w-full">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-tighter">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span> {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-[#1e293b] border-t border-slate-700/50 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            © 2026 Smart Tracker <Heart size={12} className="text-rose-500 fill-rose-500" /> <p className="text-black-600 text-sm">Email: <a href="mailto:support@smarttracker.com" className="text-cyan-600 font-medium hover:underline">support@smarttracker.com</a></p>
          </p>
          <div className="flex items-center gap-8 bg-slate-800/40 px-8 py-3 rounded-full border border-slate-700/30 shadow-inner">
             <div className="flex flex-col items-center leading-tight border-r border-slate-700/50 pr-8">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Base Currency</span>
               <span className="text-sm font-black text-blue-400 text-center">INR (₹)</span>
             </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">Thank you for your business!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
