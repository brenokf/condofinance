import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
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
  Legend
} from 'recharts';

const Comparative = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Comparativo...</div>;

  const entries = data?.entries || [];
  const accountPlan = data?.accountPlan || [];

  // Monthly Data: Triple Bar (Income, Expense, Balance)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i; // 0-11
    const monthEntries = entries.filter((e: any) => new Date(e.date).getMonth() === monthIndex);
    const receita = monthEntries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const despesa = monthEntries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
    return {
      name: new Date(2026, i).toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      receita,
      despesa,
      saldo: receita - despesa,
    };
  });

  // Fundo de Reserva Calculation
  const totalIncome = entries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const fundoReserva = entries.filter((e: any) => {
    const category = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
    return category?.code?.startsWith('9');
  }).reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const fundoReservaPercent = (fundoReserva / (totalIncome || 1)) * 100;

  const getStatusFiscal = () => {
    if (fundoReservaPercent >= 10) return { label: 'Saudável', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2, desc: 'Fundo de reserva acima de 10% da receita.' };
    if (fundoReservaPercent >= 5) return { label: 'Atenção', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle, desc: 'Fundo de reserva entre 5% e 10%.' };
    return { label: 'Crítico', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle, desc: 'Fundo de reserva abaixo de 5%.' };
  };
  const status = getStatusFiscal();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Comparativo Mensal</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Análise de Performance 2026</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 ${status.bg}`}>
          <status.icon className={status.color} size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Fiscal</span>
            <span className={`text-sm font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Fluxo de Caixa Consolidado</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Comparativo de Receitas, Despesas e Saldo Mensal</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <LegendItem color="#10b981" label="Receitas" />
            <LegendItem color="#f43f5e" label="Despesas" />
            <LegendItem color="#6366f1" label="Saldo" />
          </div>
        </div>

        <div className="h-[450px] w-full">
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
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.5rem', padding: '1.5rem' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
              />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="saldo" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnalysisCard 
          title="Variação de Receita" 
          value="+R$ 12.450" 
          desc="Em comparação ao mês anterior"
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <AnalysisCard 
          title="Eficiência Operacional" 
          value="84.2%" 
          desc="Média de execução orçamentária"
          icon={Activity}
          color="text-indigo-400"
          bg="bg-indigo-500/10"
        />
        <AnalysisCard 
          title="Aporte Fundo Reserva" 
          value={`R$ ${fundoReserva.toLocaleString('pt-BR')}`} 
          desc={status.desc}
          icon={Wallet}
          color={status.color}
          bg={status.bg}
        />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const AnalysisCard = ({ title, value, desc, icon: Icon, color, bg }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} mb-6`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
    <p className={`text-3xl font-black ${color} tracking-tighter mb-2`}>{value}</p>
    <p className="text-xs font-bold text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default Comparative;
