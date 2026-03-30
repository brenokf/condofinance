import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  PieChart, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { getDashboardData } from '../api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

const ResidentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Resumo...</div>;

  const entries = data?.entries || [];
  const accountPlan = data?.accountPlan || [];
  
  // Calculations
  const totalIncome = entries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpense = entries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // Monthly Data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i; // 0-11
    const monthEntries = entries.filter((e: any) => new Date(e.date).getMonth() === monthIndex);
    return {
      name: new Date(2026, i).toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      receita: monthEntries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0),
      despesa: monthEntries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0),
    };
  });

  // Category Data for Pie Chart (Current Month)
  const monthEntries = entries.filter((e: any) => {
    const d = new Date(e.date);
    return (d.getMonth() + 1) === selectedMonth && e.type === 'expense';
  });
  const expenseByCategory = monthEntries.reduce((acc: any, curr: any) => {
    const category = accountPlan.find((ap: any) => ap.id === curr.account_plan_id);
    const name = category ? category.name : 'Outros';
    acc[name] = (acc[name] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expenseByCategory)
    .map(([name, value]: any) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Resumo para Moradores</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Transparência Financeira 2026</p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-indigo-600 rounded-[3rem] p-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2">Saldo Atual do Condomínio</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Receitas</p>
              <p className="text-xl font-black text-white">R$ {totalIncome.toLocaleString('pt-BR')}</p>
            </div>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Despesas</p>
              <p className="text-xl font-black text-white">R$ {totalExpense.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8">Evolução Mensal</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem' }} />
                <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Uso da Conta</h3>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2026, i).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full h-[250px] md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {pieData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">R$ {item.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
              {pieData.length > 5 && (
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center pt-2">
                  + {pieData.length - 5} outras categorias
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="p-8 bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] flex items-start gap-6">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Nota de Transparência</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Este painel apresenta dados agregados para garantir a transparência e privacidade. 
            Abaixo você pode conferir os lançamentos mais recentes do condomínio.
          </p>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">Lançamentos Recentes</h3>
          <Calendar size={20} className="text-slate-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {entries.slice(0, 10).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry: any) => {
                const category = accountPlan.find((ap: any) => ap.id === entry.account_plan_id);
                return (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-4 text-xs font-bold text-slate-400">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-4 text-xs font-black text-white uppercase tracking-tight">
                      {entry.description}
                    </td>
                    <td className="px-8 py-4">
                      {category ? (
                        <div className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl shadow-inner shadow-white/5 hover:border-indigo-500/50 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] transition-all cursor-default overflow-hidden" title={category.name}>
                          <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors" />
                          <span className="relative z-10 px-2 py-0.5 bg-black/40 border border-white/5 rounded-md text-[9px] font-black text-indigo-300 shadow-sm">
                            {category.code}
                          </span>
                          <span className="relative z-10 text-[10px] font-bold text-slate-300 truncate max-w-[150px] group-hover:text-white transition-colors">
                            {category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          ---
                        </span>
                      )}
                    </td>
                    <td className={`px-8 py-4 text-xs font-black text-right ${entry.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
