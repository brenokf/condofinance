import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Download, 
  Printer, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { getDashboardData, resetAccountPlan } from '../api';
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

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetAccountPlan();
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Dashboard...</div>;

  const entries = data?.entries || [];
  const accountPlan = data?.accountPlan || [];

  // Calculations
  const totalIncome = entries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpense = entries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const saldoAnterior = 0; // In a real app, this would come from the previous year's closing
  const saldoFinal = saldoAnterior + totalIncome - totalExpense;

  // Fundo de Reserva (Category 10)
  const fundoReserva = entries.filter((e: any) => {
    const category = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
    return category?.code?.startsWith('10');
  }).reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const fundoReservaPercent = (fundoReserva / (totalIncome || 1)) * 100;

  // Status Fiscal
  const getStatusFiscal = () => {
    if (fundoReservaPercent >= 10) return { label: 'Saudável', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
    if (fundoReservaPercent >= 5) return { label: 'Atenção', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle };
    return { label: 'Crítico', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle };
  };
  const status = getStatusFiscal();

  // Top 5 Expenses
  const expenseByCategory = entries
    .filter((e: any) => e.type === 'expense')
    .reduce((acc: any, curr: any) => {
      const category = accountPlan.find((ap: any) => ap.id === curr.account_plan_id);
      const name = category ? category.name : 'Outros';
      acc[name] = (acc[name] || 0) + curr.amount;
      return acc;
    }, {});
  
  const topExpenses = Object.entries(expenseByCategory)
    .map(([name, value]: any) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Chart Data: Monthly
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i; // 0-11
    const monthEntries = entries.filter((e: any) => new Date(e.date).getMonth() === monthIndex);
    return {
      name: new Date(2026, i).toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      receita: monthEntries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0),
      despesa: monthEntries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0),
    };
  });

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard Síndico</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Visão Geral do Exercício 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
          >
            <RefreshCcw size={16} className={resetting ? 'animate-spin' : ''} />
            {resetting ? 'Resetando...' : 'Resetar Plano'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800 transition-all">
            <Download size={16} />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Printer size={16} />
            Relatório
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Saldo Anterior" 
          value={`R$ ${saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={Wallet} 
          color="text-slate-400"
          bg="bg-slate-500/10"
        />
        <StatCard 
          title="Total Receitas" 
          value={`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={TrendingUp} 
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          trend="+12.5%"
        />
        <StatCard 
          title="Total Despesas" 
          value={`R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={TrendingDown} 
          color="text-rose-400"
          bg="bg-rose-500/10"
          trend="-3.2%"
        />
        <StatCard 
          title="Saldo Final" 
          value={`R$ ${saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={Activity} 
          color="text-indigo-400"
          bg="bg-indigo-500/10"
        />
        <StatCard 
          title="Adimplência" 
          value="94.2%" 
          subValue="Cotas recebidas"
          icon={CheckCircle2} 
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          trend="+1.2%"
        />
      </div>

      {/* Indicators Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Fluxo de Caixa Mensal</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Despesa</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(value) => `R$ ${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Indicators Column */}
        <div className="space-y-8">
          {/* Status Fiscal */}
          <div className={`p-8 rounded-[2.5rem] border border-slate-800 ${status.bg}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Status Fiscal</h3>
              <status.icon className={status.color} size={24} />
            </div>
            <p className={`text-4xl font-black ${status.color} tracking-tighter mb-2`}>{status.label}</p>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Baseado no percentual de aporte ao Fundo de Reserva acumulado em 2026.
            </p>
          </div>

          {/* Fundo de Reserva */}
          <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Fundo de Reserva</h3>
            <div className="flex items-end justify-between mb-4">
              <p className="text-3xl font-black text-white tracking-tighter">R$ {fundoReserva.toLocaleString('pt-BR')}</p>
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">{fundoReservaPercent.toFixed(1)}%</p>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, fundoReservaPercent)}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Expenses */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8">Top 5 Despesas</h3>
          <div className="space-y-6">
            {topExpenses.map((expense: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                  0{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-200">{expense.name}</span>
                    <span className="text-sm font-black text-white">R$ {expense.value.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(expense.value / (totalExpense || 1)) * 100}%` }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Plan Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8">Plano de Contas Consolidado</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Código</th>
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {accountPlan.filter((ap: any) => ap.parent_id === null).map((cat: any) => {
                  const catTotal = entries
                    .filter((e: any) => {
                      const category = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
                      return category?.code?.startsWith(cat.code);
                    })
                    .reduce((acc: number, curr: any) => acc + curr.amount, 0);
                  
                  return (
                    <tr key={cat.id} className="group hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 text-xs font-black text-slate-500">{cat.code}</td>
                      <td className="py-4 text-xs font-bold text-slate-200">{cat.name}</td>
                      <td className="py-4 text-xs font-black text-white text-right">R$ {catTotal.toLocaleString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color, bg, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8"
  >
    <div className="flex items-center justify-between mb-6">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
    {subValue && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{subValue}</p>}
  </motion.div>
);

export default AdminDashboard;
