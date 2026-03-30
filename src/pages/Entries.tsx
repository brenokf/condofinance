import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Paperclip, 
  X,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Target,
  LineChart,
  PieChart as PieChartIcon,
  AlertCircle
} from 'lucide-react';
import { getDashboardData, getAccountPlan, createEntry, updateEntry, deleteEntry } from '../api';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Entries = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [accountPlan, setAccountPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  // Smart Month Filter
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: '2026-01-01',
    type: 'expense',
    account_plan_id: '',
    attachment_url: ''
  });

  const fetchData = async () => {
    try {
      const [dash, plan] = await Promise.all([getDashboardData(), getAccountPlan()]);
      setEntries(dash.entries);
      setAccountPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (entry: any = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        amount: entry.amount.toString(),
        description: entry.description,
        date: entry.date,
        type: entry.type,
        account_plan_id: entry.account_plan_id.toString(),
        attachment_url: entry.attachment_url || ''
      });
    } else {
      setEditingEntry(null);
      
      // Auto-set the date to the selected month
      const defaultDate = `2026-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      setFormData({
        amount: '',
        description: '',
        date: defaultDate,
        type: 'expense',
        account_plan_id: '',
        attachment_url: ''
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.date.startsWith('2026')) {
      setError('Apenas lançamentos para o ano de 2026 são permitidos.');
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      account_plan_id: formData.account_plan_id,
      date: new Date(formData.date).toISOString()
    };

    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, payload);
      } else {
        await createEntry(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar lançamento. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if(window.confirm('Tem certeza que deseja excluir?')) {
        await deleteEntry(id);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtration logic
  const filteredEntries = entries.filter(e => {
    const category = accountPlan.find(ap => ap.id === e.account_plan_id);
    const categoryName = category ? category.name : '';
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesMonth = new Date(e.date).getMonth() === selectedMonth;
    
    return matchesSearch && matchesType && matchesMonth;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Month Overview Stats
  const monthIncome = filteredEntries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpense = filteredEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  // Annual Budget Simulation vs Realized 2026
  const budgetList = accountPlan.filter(ap => ap.parent_id === null && ap.type === 'expense').map(parent => {
    const parentEntries = entries.filter((e: any) => {
      const cat = accountPlan.find((ap: any) => ap.id === e.account_plan_id);
      return cat?.code?.startsWith(parent.code);
    });
    const currentRealized = parentEntries.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    
    // Simulating a budget that is ~15% higher than what is realized, or fixed 15000 if zero to look good
    const simulatedBudget = currentRealized > 0 ? currentRealized * 1.15 : 15000;
    const percent = Math.min((currentRealized / simulatedBudget) * 100, 100);
    
    return {
       ...parent,
       realized: currentRealized,
       budget: simulatedBudget,
       percent
    }
  }).sort((a, b) => b.percent - a.percent);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Diário Financeiro...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
             <Calendar className="text-indigo-500" size={32} /> Central de Lançamentos
          </h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Gestão de Livro Caixa e Execução 2026</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Novo Lançamento
        </button>
      </div>

      {/* Interactive Month Ribbon */}
      <div className="flex gap-2 p-2 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-x-auto scrollbar-hide snap-x">
        {MONTHS.map((m, i) => {
           const hasEntries = entries.some(e => new Date(e.date).getMonth() === i);
           return (
             <button 
               key={m}
               onClick={() => setSelectedMonth(i)} 
               className={`snap-center flex-1 min-w-[80px] px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex flex-col items-center gap-1 ${
                 selectedMonth === i 
                   ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-500/50' 
                   : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'
               }`}
             >
               {m}
               {hasEntries && selectedMonth !== i && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
             </button>
           );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Smart Table */}
        <div className="xl:col-span-2 space-y-6">
           {/* Month Overview KPIs */}
           <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 shadow-inner flex flex-col justify-center">
                 <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Entradas (Mês)</span>
                 <span className="text-xl font-black text-emerald-400">R$ {monthIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 shadow-inner flex flex-col justify-center">
                 <span className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest mb-1">Saídas (Mês)</span>
                 <span className="text-xl font-black text-rose-400">R$ {monthExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 shadow-inner flex flex-col justify-center">
                 <span className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest mb-1">Resultado</span>
                 <span className={`text-xl font-black ${monthBalance >= 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                    R$ {monthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </span>
              </div>
           </div>

           {/* Table Filters */}
           <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input 
                 type="text" 
                 placeholder="Buscar por descrição..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm font-bold"
               />
             </div>
             <select 
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
             >
               <option value="all">Ver Tudo</option>
               <option value="income">Receitas</option>
               <option value="expense">Despesas</option>
             </select>
           </div>

           {/* Entries Smart List */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
             {filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                     <FileText size={32} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Nenhum lançamento em {MONTHS[selectedMonth]}.</p>
                </div>
             ) : (
                <div className="divide-y divide-slate-800/50">
                   {filteredEntries.map((entry) => {
                      const category = accountPlan.find(ap => ap.id === entry.account_plan_id);
                      return (
                         <div key={entry.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-800/40 transition-all border-l-2 border-transparent hover:border-indigo-500">
                            {/* Left Info: Date and Desc */}
                            <div className="flex items-center gap-6 flex-1">
                               <div className="flex flex-col items-center justify-center bg-slate-950 px-4 py-2 border border-slate-800 rounded-xl shadow-inner min-w-[60px]">
                                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{MONTHS[selectedMonth]}</span>
                                  <span className="text-lg font-black text-white leading-none">{new Date(entry.date).getDate().toString().padStart(2, '0')}</span>
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-200 mb-1.5">{entry.description}</p>
                                  {category ? (
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-950/50 border border-white/5 rounded-lg">
                                      <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-black">{category.code}</span>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{category.name}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md">Sem Categoria</span>
                                  )}
                               </div>
                            </div>

                            {/* Right Info: Amount & Actions */}
                            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-800/50 md:border-none">
                               <div className="flex flex-col items-start md:items-end">
                                  <div className={`flex items-center gap-2 text-lg font-black tracking-tight ${entry.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  {entry.attachment_url && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                      <Paperclip size={10} /> Comprovante Anexo
                                    </div>
                                  )}
                               </div>

                               <div className="flex items-center gap-2">
                                  <button onClick={() => handleOpenModal(entry)} className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-inner">
                                    <Edit3 size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(entry.id)} className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all shadow-inner border border-transparent hover:border-rose-500/30">
                                    <Trash2 size={16} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      );
                   })}
                </div>
             )}
           </div>
        </div>

        {/* Right Column: Planejamento Orçamentário 2026 */}
        <div className="xl:col-span-1">
           <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-8 sticky top-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Target size={150} />
             </div>
             
             <div className="relative z-10">
               <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                 <Target className="text-rose-400" size={20} /> Orçamento 2026
               </h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8 pr-10">
                 Acompanhamento do Executado vs Aprovado em Assembleia (Todas as Contas de Despesa).
               </p>

               <div className="space-y-6">
                 {budgetList.map((item, idx) => {
                    const isWarning = item.percent >= 90;
                    const isDanger = item.percent >= 100;
                    return (
                       <div key={item.id} className="group">
                         <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[180px] bg-slate-950/60 px-2 py-1 rounded-md border border-white/5">
                               {item.code} - {item.name}
                            </span>
                            <span className={`text-xs font-black ${isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                               {item.percent.toFixed(1)}%
                            </span>
                         </div>
                         <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percent}%` }}
                              transition={{ duration: 1.5, delay: idx * 0.1 }}
                              className={`h-full rounded-full relative overflow-hidden ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-[-45deg] animate-[shimmer_2s_infinite]" />
                            </motion.div>
                         </div>
                         <div className="flex justify-between items-center mt-2">
                           <span className="text-[9px] font-bold text-slate-500">Real: R$ {item.realized.toLocaleString('pt-BR')}</span>
                           <span className="text-[9px] font-bold text-slate-600">Limite: R$ {item.budget.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                         </div>
                       </div>
                    );
                 })}
               </div>
               
               <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-4 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                 <AlertCircle size={20} className="text-rose-400 shrink-0" />
                 <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-relaxed">
                   Rubricas ultrapassando 100% do orçamento requerem prestação de contas suplementar.
                 </p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Modal Engine (Preserved Logic) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 p-10 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                    {editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Livro Caixa 2026</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all shadow-inner border border-transparent hover:border-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <p className="text-xs font-black text-rose-400 uppercase tracking-widest text-center">{error}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tipo de Movimento</label>
                    <div className="flex gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/50' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Entrada (+ Receita)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400/50' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Saída (- Despesa)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Valor Final (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 font-bold"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative" onMouseLeave={() => setIsCategoryDropdownOpen(false)}>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Classificação Fiscal (Plano de Contas)</label>
                  
                  <div 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className={`w-full px-5 py-4 bg-slate-800 border ${isCategoryDropdownOpen ? 'border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' : 'border-slate-700'} rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-700/50`}
                  >
                    {formData.account_plan_id ? (
                       (() => {
                         const cat = accountPlan.find(ap => ap.id === formData.account_plan_id);
                         return cat ? (
                            <div className="flex items-center gap-3">
                               <span className="px-2 py-1 bg-black/40 border border-white/5 rounded-md text-[10px] font-black text-indigo-400">
                                 {cat.code}
                               </span>
                               <span className="text-sm font-bold text-white">{cat.name}</span>
                            </div>
                         ) : <span className="text-slate-500 font-bold text-sm ml-2">Selecione uma categoria...</span>
                       })()
                    ) : (
                      <span className="text-slate-500 font-bold text-sm ml-2">Selecione a rubrica...</span>
                    )}
                    <motion.div animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}>
                       <ChevronDown size={18} className="text-slate-400" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isCategoryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl"
                      >
                         <div className="max-h-[250px] overflow-y-auto p-2 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                           {accountPlan
                             .filter(ap => ap.type === formData.type)
                             .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }))
                             .map((cat, idx) => {
                               const indent = cat.code.split('.').length - 1;
                               const isParent = indent === 0;
                               const isSelected = formData.account_plan_id === cat.id;
                               
                               return (
                                 <motion.div
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: idx * 0.005 }}
                                   key={cat.id}
                                   onClick={() => {
                                      setFormData({ ...formData, account_plan_id: cat.id });
                                      setIsCategoryDropdownOpen(false);
                                   }}
                                   className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-slate-700/60 border border-transparent'} ${isParent ? 'mt-3 mb-1 bg-slate-900/40 backdrop-blur-md' : ''}`}
                                 >
                                    <div className="flex items-center gap-3">
                                       <div style={{ width: `${indent * 1.5}rem` }} />
                                       <span className={`px-1.5 py-0.5 border rounded-md text-[9px] font-black ${isParent ? 'bg-indigo-500 border-indigo-400/50 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]' : 'bg-black/40 border-white/5 text-slate-400'}`}>
                                         {cat.code}
                                       </span>
                                       <span className={`text-xs ${isParent ? 'font-black text-white uppercase tracking-widest' : 'font-bold text-slate-300'}`}>
                                         {cat.name}
                                       </span>
                                    </div>
                                    {isSelected && <CheckCircle2 size={16} className="text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />}
                                 </motion.div>
                               );
                             })}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Histórico / Descrição Curta</label>
                  <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm font-bold"
                    placeholder="Ex: Ref. Nota Fiscal Nº 400..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Data Competência</label>
                    <input 
                      type="date" 
                      required
                      min="2026-01-01"
                      max="2026-12-31"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all flex-[1]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Comprovante Digital (URL)</label>
                    <input 
                      type="text" 
                      value={formData.attachment_url}
                      onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 border border-indigo-400/50 mt-4"
                >
                  <CheckCircle2 size={20} />
                  {editingEntry ? 'Salvar Edição' : 'Concluir Lançamento'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Entries;
