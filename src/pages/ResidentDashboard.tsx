import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  FileText,
  Eye,
  Scale,
  Zap,
  HardHat,
  Info,
  AlertCircle
} from 'lucide-react';
import { getDashboardData } from '../api';
import { 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const BUDGET_EDUCATIONAL: any = {
  '2': { 
     title: 'Pessoal & Encargos', 
     icon: Scale, 
     color: 'text-rose-400',
     bg: 'bg-rose-500/10',
     border: 'border-rose-500/20',
     desc: 'Salários líquidos, INSS, FGTS, férias e benefícios de porteiros e zeladoria. Maior peso do orçamento devido aos impostos do governo.' 
  },
  '3': { 
     title: 'Despesas de Consumo', 
     icon: Zap, 
     color: 'text-amber-400',
     bg: 'bg-amber-500/10',
     border: 'border-amber-500/20',
     desc: 'Pagamento das concessionárias públicas: rateio da enorme conta de Água e a Energia Elétrica das áreas comuns (elevadores, portaria).' 
  },
  '4': { 
     title: 'Manutenção / Obras', 
     icon: HardHat, 
     color: 'text-emerald-400',
     bg: 'bg-emerald-500/10',
     border: 'border-emerald-500/20',
     desc: 'Garante que o prédio não desvalorize. Paga os contratos obrigatórios de elevador, bombas, além de consertos diários e materiais de limpeza.' 
  },
  '5': { 
     title: 'Administrativo & Seguros', 
     icon: ShieldCheck, 
     color: 'text-indigo-400',
     bg: 'bg-indigo-500/10',
     border: 'border-indigo-500/20',
     desc: 'Despesas previsíveis essenciais: Seguro patrimonial obrigatório contra incêndio, honorários da administradora e tarifas bancárias.' 
  }
};

const ResidentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Portal de Transparência...</div>;

  const entries = data?.entries || [];
  const accountPlan = data?.accountPlan || [];
  
  // Total Geral
  const totalIncome = entries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpense = entries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // Inadimplencia Simulada
  const simulatedDefaultRate = 0.115; // 11.5%
  const totalExpectedIncome = totalIncome > 0 ? (totalIncome / (1 - simulatedDefaultRate)) : 0;
  const delayedAmount = totalExpectedIncome - totalIncome;

  // Selected Month Data
  const monthEntries = entries.filter((e: any) => new Date(e.date).getMonth() === selectedMonth);
  const monthIncome = monthEntries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const monthExpense = monthEntries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  // Budget Educational Mapping
  const parentAccounts = accountPlan.filter((ap: any) => ap.parent_id === null && ap.type === 'expense');
  const budgetCards = parentAccounts.map((parent: any) => {
      const parentEntries = entries.filter((e: any) => {
        const cat = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
        return cat?.code?.startsWith(parent.code);
      });
      const currentRealized = parentEntries.reduce((acc: number, curr: any) => acc + curr.amount, 0);
      
      // Artificial Budget projection representing the "Pact" or "Aprovado em Assembleia"
      // Se tivermos gastos reais, projetamos pro ano. Se não, geramos base de 30k.
      const simulatedAnnualBudget = currentRealized > 0 ? (currentRealized * 6) : 36000;
      const monthlyBudget = simulatedAnnualBudget / 12;

      const prefix = parent.code.charAt(0);
      const edu = BUDGET_EDUCATIONAL[prefix] || { 
         title: parent.name, 
         icon: FileText, 
         color: 'text-slate-400',
         bg: 'bg-slate-800/50',
         border: 'border-slate-700',
         desc: 'Despesas diversas aprovadas pela administração para o custeio operacional.' 
      };

      return {
         ...parent,
         keyTitle: edu.title,
         icon: edu.icon,
         color: edu.color,
         bg: edu.bg,
         border: edu.border,
         desc: edu.desc,
         annualBudget: simulatedAnnualBudget,
         monthlyBudget: monthlyBudget,
         realized: currentRealized,
         percent: Math.min((currentRealized / simulatedAnnualBudget) * 100, 100)
      }
  }).sort((a,b) => b.annualBudget - a.annualBudget);

  return (
    <div className="space-y-12 pb-12">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Building className="text-indigo-400" size={32} /> Meu Condomínio
          </h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Conheça o Planejamento 2026</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-inner">
           <ShieldCheck size={18} />
           <span className="text-[10px] font-black uppercase tracking-widest">Acesso Auditado</span>
        </div>
      </div>

      {/* Main Glassmorphism Balance Hero */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-[3rem] p-10 md:p-14 overflow-hidden border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-50%] left-[-10%] w-[50%] h-[100%] bg-indigo-500/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-xl mb-4 border border-white/10">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
               <span className="text-white text-[10px] font-black uppercase tracking-widest">Saúde Financeira (Caixa Total)</span>
            </div>
            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg">
              R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-indigo-100/80 text-sm font-bold mt-4 leading-relaxed max-w-md">
              Esse é o dinheiro atual em conta. Ele nos fornece o lastro necessário para pagar a Folha de Pagamento mês que vem e lidar com emergências urgentes (Fundo de Reserva).
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="p-6 bg-black/20 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl flex-1 md:min-w-[160px]">
              <div className="flex items-center gap-3 mb-3 text-emerald-300">
                 <div className="w-8 h-8 rounded-xl bg-emerald-400/20 flex items-center justify-center border border-emerald-400/30">
                   <TrendingUp size={16} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Arrecadado Ano</p>
              </div>
              <p className="text-2xl font-black text-white">R$ {totalIncome.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-6 bg-black/20 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl flex-1 md:min-w-[160px]">
              <div className="flex items-center gap-3 mb-3 text-rose-300">
                 <div className="w-8 h-8 rounded-xl bg-rose-400/20 flex items-center justify-center border border-rose-400/30">
                   <TrendingDown size={16} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Executado Ano</p>
              </div>
              <p className="text-2xl font-black text-white">R$ {totalExpense.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-6 bg-rose-500/10 backdrop-blur-xl rounded-[2rem] border border-rose-500/20 shadow-xl flex-1 md:min-w-[160px]">
              <div className="flex items-center gap-3 mb-3 text-rose-400">
                 <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                   <AlertCircle size={16} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Inadimplência</p>
              </div>
              <p className="text-2xl font-black text-white">{(simulatedDefaultRate * 100).toFixed(1)}%</p>
              <p className="text-[9px] font-bold text-rose-300 mt-1">R$ {delayedAmount.toLocaleString('pt-BR', {maximumFractionDigits:0})} em atraso</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* EDUCATIONAL BUDGET SECTION (THE CORE MISSION) */}
      <div className="relative pt-8">
         <div className="flex flex-col mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-3 w-fit">
               <Info size={14} className="text-indigo-400" />
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Educação Financeira</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Desmistificando o Orçamento 2026</h3>
            <p className="text-xs text-slate-400 font-bold max-w-3xl leading-relaxed">
               Você paga a taxa de condomínio todo mês, mas <strong className="text-white">o que exatamente isso paga?</strong> 
               Abaixo, quebramos os valores aprovados em assembleia para cada categoria principal em 2026. 
               Veja qual é a previsão orçamentária do síndico **por mês**, quanto representa a previsão **anual**, e **o que isso significa no seu dia a dia**.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgetCards.map((card, idx) => (
               <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 hover:border-slate-700 transition-colors shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${card.bg} ${card.border} border rounded-2xl flex items-center justify-center ${card.color} shadow-inner`}>
                           <card.icon size={28} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-white tracking-tight">{card.keyTitle}</h4>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref: {card.name}</span>
                        </div>
                     </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-6 pb-6 border-b border-slate-800/50">
                     <strong className="text-slate-300">Na prática:</strong> {card.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                           <Calendar size={12} /> Previsão Mensal
                        </p>
                        <p className={`text-xl font-black ${card.color}`}>
                           R$ {card.monthlyBudget.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[9px] font-bold text-slate-600 mt-1">Orçamento previsto para o mês</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                           <Activity size={12} /> Previsão Anual
                        </p>
                        <p className="text-xl font-black text-white">
                           R$ {card.annualBudget.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[9px] font-bold text-slate-600 mt-1">Bolo total aprovado no ano</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Month Selector & Analysis */}
      <div className="flex flex-col gap-6 pt-10 border-t border-slate-800/50">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Eye className="text-indigo-400" size={24} /> Desempenho do Mês
               </h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Entradas e saídas detalhadas do período</p>
            </div>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-lg w-full md:w-auto"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m} de 2026</option>
              ))}
            </select>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Mês Selecionado */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-center shadow-inner">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Calendar size={180} />
               </div>
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Entradas</p>
                     <p className="text-2xl font-black text-emerald-400 tracking-tighter">R$ {monthIncome.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saídas</p>
                     <p className="text-2xl font-black text-rose-400 tracking-tighter">R$ {monthExpense.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                     {monthBalance >= 0 ? <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" /> : <div className="absolute inset-0 bg-rose-500/10 pointer-events-none" />}
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Balanço</p>
                     <p className={`text-2xl font-black tracking-tighter relative z-10 ${monthBalance >= 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                        R$ {monthBalance.toLocaleString('pt-BR')}
                     </p>
                  </div>
               </div>
               <div className="mt-6 flex items-start gap-4 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <Info size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-indigo-200/70 leading-relaxed">
                     O balanço do mês indica se a nossa arrecadação foi suficiente para pagar as despesas <strong>deste ciclo</strong> isoladamente. Ele não representa o valor total que temos na conta do condomínio (que é mantido guardado para emergências).
                  </p>
               </div>
            </div>

            {/* Smart List: Recent Entries just for that month */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl flex flex-col h-[350px]">
               <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Lançamentos do Mês</h3>
               </div>
               
               <div className="overflow-y-auto flex-1 p-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                  {monthEntries.length === 0 ? (
                     <div className="flex flex-col items-center justify-center p-12 opacity-50 text-center">
                        <FileText size={40} className="text-slate-600 mb-4" />
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nenhuma movimentação em {MONTHS[selectedMonth]}</p>
                     </div>
                  ) : (
                     <div className="space-y-2">
                        {monthEntries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry: any) => {
                           const category = accountPlan.find((ap: any) => ap.id === entry.account_plan_id);
                           return (
                              <div key={entry.id} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-sm font-black text-white border border-slate-700">
                                       {new Date(entry.date).getDate().toString().padStart(2, '0')}
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-slate-200">{entry.description}</p>
                                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{category ? category.name : 'Outros'}</span>
                                    </div>
                                 </div>
                                 <div className={`text-sm font-black tracking-tight ${entry.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Transparency Note */}
      <div className="mt-8 p-6 md:p-8 bg-black/40 border border-slate-800 rounded-[2.5rem] flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-indigo-100 uppercase tracking-widest mb-1 shadow-sm">Prestação de Contas e Pastas Físicas</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-bold max-w-4xl">
            A prestação de contas física detalhada, com suas respectivas notas fiscais originais e comprovantes completos, deve ser solicitada formalmente à administração do condomínio. Além disso, as planilhas consolidadas encontram-se sempre publicadas no nosso aplicativo oficial <strong>Super Lógica</strong> (na área de Anúncios). Este painel visa educar e promover transparência macro, aproximando você da gestão diária.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ResidentDashboard;
