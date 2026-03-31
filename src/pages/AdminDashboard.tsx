import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Download, 
  Printer, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  Receipt,
  Target
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
  PieChart,
  Pie
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (code: string) => {
    setExpandedCats(prev => ({ ...prev, [code]: !prev[code] }));
  };

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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Calculando Índices do Condomínio...</div>;

  const entries = data?.entries || [];
  const accountPlan = data?.accountPlan || [];

  // Base Calculations
  const totalIncome = entries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpense = entries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const saldoFinal = totalIncome - totalExpense;

  // Condominium Core Indexes
  const QTDE_UNIDADES = 60; // Simulated units for index metrics
  const monthsActive = new Set(entries.map((e: any) => new Date(e.date).getMonth())).size || 1;
  const avgMonthlyExpense = totalExpense / monthsActive;
  const custoPorUnidadeMes = avgMonthlyExpense / QTDE_UNIDADES;
  
  // Health Metrics
  const fundoReserva = entries.filter((e: any) => {
    const category = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
    return category?.code?.startsWith('10');
  }).reduce((acc: number, curr: any) => acc + curr.amount, 0);
  
  const targetReserva = totalIncome * 0.10; // Meta de 10%
  const reservaHealthPercent = Math.min((fundoReserva / (targetReserva || 1)) * 100, 100);

  const getStatusFiscal = () => {
    if (reservaHealthPercent >= 100) return { label: 'Saudável', desc: 'Metas fiscais em dia', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
    if (reservaHealthPercent >= 50) return { label: 'Atenção', desc: 'Reserva abaixo da meta', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle };
    return { label: 'Crítico', desc: 'Vulnerabilidade alta', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle };
  };
  const status = getStatusFiscal();

  // Top Area Data (Pie and List)
  const expenseByCategoryAllTime = entries
    .filter((e: any) => e.type === 'expense')
    .reduce((acc: any, curr: any) => {
      const category = accountPlan.find((ap: any) => ap.id === curr.account_plan_id);
      let parentName = 'Outros';
      if (category) {
         const parentCode = category.code.split('.')[0];
         const parent = accountPlan.find((ap: any) => ap.code === parentCode && ap.parent_id === null);
         parentName = parent ? parent.name : category.name;
      }
      acc[parentName] = (acc[parentName] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategoryAllTime)
    .map(([name, value]: any) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const pieColors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

  // Monthly Flow Data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = entries.filter((e: any) => new Date(e.date).getMonth() === i);
    return {
      name: new Date(2026, i).toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      receita: monthEntries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0),
      despesa: monthEntries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0),
    };
  });

  const getCategoryTotal = (code: string) => {
    return entries.filter((e: any) => {
      const cat = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
      return cat?.code?.startsWith(code);
    }).reduce((acc: number, curr: any) => acc + curr.amount, 0);
  };

  return (
    <>
      {/* PERFECT A4 DRE REPORT (Only visible in Print Dialog) */}
      <div className="hidden print:block w-full bg-white text-black font-sans p-8 absolute top-0 left-0 min-h-screen z-[99999]">
        <div className="text-center border-b-2 border-black pb-6 mb-6">
           <h1 className="text-2xl font-black uppercase text-black tracking-tighter">Demonstração do Resultado do Exercício - DRE</h1>
           <p className="text-sm font-bold uppercase mt-1 text-black">CondoFinance - Simplificada Fiscal 2026</p>
        </div>
        
        <div className="flex justify-between items-end mb-4 border-b border-gray-300 pb-2">
           <div className="text-xs font-bold uppercase text-gray-600">Período de Apuração: 01/Jan a 31/Dez</div>
           <div className="text-xs font-bold uppercase text-gray-600">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-xs uppercase text-black font-black">
              <th className="py-2 w-24">Código</th>
              <th className="py-2">Rubrica Contábil</th>
              <th className="py-2 text-right">Saldo Realizado (R$)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100 border-b border-gray-300 text-sm">
               <td className="py-3 px-2 font-bold" colSpan={2}>(=) RECEITA BRUTA ARRECADADA</td>
               <td className="py-3 px-2 font-black text-right text-emerald-700">R$ {totalIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            </tr>
            {accountPlan.filter((ap: any) => ap.parent_id === null && ap.type === 'expense')
               .sort((a: any, b: any) => a.code.localeCompare(b.code, undefined, { numeric: true }))
               .map((parent: any) => {
                  const parentTotal = getCategoryTotal(parent.code);
                  const children = accountPlan.filter((ap: any) => ap.code.startsWith(parent.code + '.') && ap.id !== parent.id);
                  return (
                     <React.Fragment key={parent.id}>
                        <tr className="border-b border-gray-300 bg-gray-50">
                           <td className="py-2 pl-2 text-xs font-black text-gray-800">{parent.code}</td>
                           <td className="py-2 text-xs font-black uppercase text-gray-800">{parent.name}</td>
                           <td className="py-2 pr-2 text-right text-xs font-bold text-rose-700">(-) R$ {parentTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        </tr>
                        {children.map((child: any) => {
                           const childTotal = getCategoryTotal(child.code);
                           if (childTotal === 0) return null;
                           return (
                             <tr key={child.id} className="border-b border-gray-100">
                               <td className="py-1.5 pl-6 text-[10px] text-gray-600">{child.code}</td>
                               <td className="py-1.5 text-[10px] text-gray-700 uppercase">{child.name}</td>
                               <td className="py-1.5 pr-2 text-right text-[10px] text-gray-700">R$ {childTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                             </tr>
                           );
                        })}
                     </React.Fragment>
                  )
            })}
          </tbody>
          <tfoot className="border-t-2 border-black">
            <tr className="text-sm font-black uppercase">
              <td className="py-4 px-2" colSpan={2}>(=) RESULTADO LÍQUIDO DO EXERCÍCIO</td>
              <td className={`py-4 px-2 text-right ${saldoFinal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>R$ {saldoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            </tr>
          </tfoot>
        </table>
        
        <div className="mt-20 pt-8 grid grid-cols-2 gap-12 text-center text-xs font-bold text-gray-600 uppercase">
           <div>
             <div className="w-48 mx-auto border-b border-black mb-2"></div>
             Assinatura do Síndico
           </div>
           <div>
             <div className="w-48 mx-auto border-b border-black mb-2"></div>
             Conselho Fiscal
           </div>
        </div>
      </div>

      <div className="space-y-6 pb-12 print:hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <Target className="text-indigo-500" size={32} /> Central de Controle
          </h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Análise de Desempenho do Condomínio • 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCcw size={16} className={resetting ? 'animate-spin' : ''} />
            {resetting ? 'Resetando...' : 'Resetar Demo'}
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Printer size={16} /> Emitir DRE
          </button>
        </div>
      </div>

      {/* Grid 1: Primary Economic Indicators (Bento Blocks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Saldo em Caixa" 
          value={`R$ ${saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={Wallet} 
          color="text-indigo-400" bg="bg-indigo-500/10" 
          border="border-indigo-500/20"
        />
        <StatCard 
          title="Arrecadação Bruta" 
          value={`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={TrendingUp} 
          color="text-emerald-400" bg="bg-emerald-500/10" 
          border="border-emerald-500/20"
        />
        <StatCard 
          title="Despesas Pagas" 
          value={`R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={TrendingDown} 
          color="text-rose-400" bg="bg-rose-500/10" 
          border="border-rose-500/20"
        />
        <StatCard 
          title="Custo Médio / Unidade" 
          value={`R$ ${custoPorUnidadeMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          subValue="Média Mensal"
          icon={Building2} 
          color="text-amber-400" bg="bg-amber-500/10" 
          border="border-amber-500/20"
        />
      </div>

      {/* Grid 2: Charts and Health Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow BarChart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-inner shadow-white/5 relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Evolução de Fluxo de Caixa</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Acúmulo de Receitas vs Despesas</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Saídas</span>
              </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Indexes Column */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className={`flex-1 p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden flex flex-col justify-center ${status.bg} border-[color:var(--tw-border-opacity)]`} style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="absolute top-0 right-0 p-6 opacity-20"><status.icon size={100} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <status.icon className={status.color} size={20} />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saúde Financeira</h3>
              </div>
              <p className={`text-4xl font-black ${status.color} tracking-tighter uppercase drop-shadow-md`}>{status.label}</p>
              <p className="text-xs font-bold text-slate-400 mt-2 max-w-[80%]">{status.desc}</p>
            </div>
          </div>

          <div className="flex-1 p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 shadow-inner flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
              Meta Fundo Reserva <Target size={14} className="text-indigo-400" />
            </h3>
            <div className="flex items-end gap-3 mb-4 mt-2">
              <p className="text-3xl font-black text-white tracking-tighter">R$ {fundoReserva.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] text-slate-400 font-bold mb-1.5 line-through">R$ {targetReserva.toLocaleString('pt-BR')}</p>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${reservaHealthPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full relative overflow-hidden ${reservaHealthPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-[-45deg] animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
            <p className="text-[9px] font-black uppercase text-indigo-400 mt-3 tracking-widest text-right">
              {reservaHealthPercent.toFixed(1)}% do previsto
            </p>
          </div>
        </div>
      </div>

      {/* Grid 3: Macro Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Component */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-inner flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
            <PieChartIcon size={16} className="text-purple-400"/> Distribuição de Despesas
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Mapeamento Macroeconômico</p>
          
          <div className="flex-1 min-h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="rgba(0,0,0,0)"
                >
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
             {/* Center icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                  <Activity size={20} className="text-slate-500" />
               </div>
            </div>
          </div>
        </div>

        {/* Top Expenses List */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-inner overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Receipt size={16} className="text-rose-400" /> Top Centros de Custo
                 </h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Nível Hierárquico Pai</p>
               </div>
               <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base 100% = R$ {totalExpense.toLocaleString('pt-BR')}</span>
               </div>
            </div>

            <div className="flex flex-col gap-6 flex-1 justify-center">
              {pieData.slice(0, 5).map((expense: any, idx: number) => {
                const percent = (expense.value / (totalExpense || 1)) * 100;
                const dotColor = pieColors[idx % pieColors.length];
                return (
                  <div key={idx} className="flex items-center gap-5 group">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-slate-700 transition-colors shadow-inner">
                      0{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: dotColor, backgroundColor: dotColor }} />
                          <span className="text-xs font-bold text-slate-200">{expense.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-white">R$ {expense.value.toLocaleString('pt-BR')}</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{percent.toFixed(1)}% do Bolo</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: dotColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>

      {/* Grid 4: Full Interactive Account Plan */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mb-8 border-b border-slate-800/80 pb-6">
          <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
             <Building2 className="text-indigo-400" size={24} /> Desmembramento de Planto de Contas
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Detalhamento Hierárquico completo e interativo.</p>
        </div>
        
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 pb-2 border-b border-slate-800/50">
             <span>Classificação de Conta</span>
             <span>Volume Financeiro Realizado</span>
          </div>

          {accountPlan
            .filter((ap: any) => ap.parent_id === null)
            .sort((a: any, b: any) => a.code.localeCompare(b.code, undefined, { numeric: true }))
            .map((parent: any) => {
              const parentEntries = entries.filter((e: any) => {
                const category = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
                return category?.code?.startsWith(parent.code);
              });
              const parentTotal = parentEntries.reduce((acc: number, curr: any) => acc + curr.amount, 0);
              
              const children = accountPlan
                .filter((ap: any) => ap.code.startsWith(parent.code + '.') && ap.id !== parent.id)
                .sort((a: any, b: any) => a.code.localeCompare(b.code, undefined, { numeric: true }));
              
              const isExpanded = expandedCats[parent.code];

              // Color mapping for parent bars based on type
              const isIncome = parent.type === 'income';

              return (
                <motion.div 
                  layout
                  key={parent.id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-slate-800/60 border-indigo-500/40 shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)]' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'}`}
                >
                  <button 
                    onClick={() => toggleCat(parent.code)}
                    className="w-full flex items-center justify-between p-5 outline-none"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${isExpanded ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800 border border-slate-700 text-slate-400'}`}>
                         {children.length > 0 ? (
                           <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                             <ChevronRight size={20} strokeWidth={3} />
                           </motion.div>
                         ) : <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />}
                      </div>
                      <div className="flex flex-col items-start leading-tight text-left">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">{parent.code}</span>
                        <span className={`${isExpanded ? 'text-indigo-100' : 'text-slate-200'} text-sm font-black tracking-wide transition-colors`}>{parent.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-black ${isExpanded ? 'text-white drop-shadow-md' : 'text-slate-300'}`}>
                        R$ {parentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                         Total {isIncome ? 'Receitado' : 'Despesado'}
                      </span>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && children.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20"
                      >
                        <div className="p-3">
                          {children.map((child: any) => {
                             const childTotal = entries
                               .filter((e: any) => {
                                 const category = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
                                 return category?.code === child.code; 
                               })
                               .reduce((acc: number, curr: any) => acc + curr.amount, 0);

                             const indent = child.code.split('.').length - 1;
                             
                             return (
                               <div 
                                 key={child.id} 
                                 className="flex items-center justify-between py-3.5 px-6 rounded-xl hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/50 group"
                               >
                                 <div className="flex items-center gap-4">
                                    <div style={{ width: `${indent * 1.5}rem` }} className="border-l-2 border-slate-800 h-6 opacity-30" />
                                    <div className="flex items-center gap-4">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500/30 group-hover:bg-indigo-400 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all" />
                                      <div className="flex flex-col leading-tight">
                                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-300 transition-colors">{child.code}</span>
                                         <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{child.name}</span>
                                      </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden hidden md:block">
                                       <div className="h-full bg-slate-600 rounded-full group-hover:bg-indigo-500 transition-colors" style={{ width: `${Math.min((childTotal / (parentTotal || 1)) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">
                                      R$ {childTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
    </>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color, bg, border }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className={`bg-slate-900/70 border ${border || 'border-slate-800'} rounded-[2rem] p-8 shadow-xl backdrop-blur-md relative overflow-hidden group`}
  >
    <div className={`absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full ${bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} shadow-inner`}>
        <Icon size={24} />
      </div>
      <div>
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{title}</p>
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-3xl font-black text-white tracking-tighter drop-shadow-sm">{value}</p>
      {subValue && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 bg-slate-800/50 inline-block px-2 py-1 rounded-md">{subValue}</p>}
    </div>
  </motion.div>
);

export default AdminDashboard;
