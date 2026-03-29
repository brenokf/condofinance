import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  FileText, 
  Paperclip, 
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getDashboardData, getAccountPlan, createEntry, updateEntry, deleteEntry } from '../api';

const Entries = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [accountPlan, setAccountPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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
      setFormData({
        amount: '',
        description: '',
        date: '2026-01-01',
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
      await deleteEntry(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = entries.filter(e => {
    const category = accountPlan.find(ap => ap.id === e.account_plan_id);
    const categoryName = category ? category.name : '';
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Lançamentos...</div>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Lançamentos Financeiros</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Gestão de Receitas e Despesas 2026</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Novo Lançamento
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por descrição ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-slate-500" />
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white mb-1">{entry.description}</p>
                    {entry.attachment_url && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        <Paperclip size={10} />
                        Anexo vinculado
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">
                      {accountPlan.find(ap => ap.id === entry.account_plan_id)?.name || 'S/ Cat'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 text-sm font-black ${entry.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(entry)}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FileText size={48} className="text-slate-800" />
                      <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Nenhum lançamento encontrado para 2026.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
              className="relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 p-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                    {editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Exercício Fiscal 2026</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all">
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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tipo</label>
                    <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Receita
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Despesa
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Valor (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Categoria (Plano de Contas)</label>
                  <select 
                    required
                    value={formData.account_plan_id}
                    onChange={(e) => setFormData({ ...formData, account_plan_id: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {accountPlan
                      .filter(ap => ap.type === formData.type)
                      .map((ap) => (
                        <option key={ap.id} value={ap.id}>
                          {ap.code} - {ap.name}
                        </option>
                      ))}
                  </select>
                  {accountPlan.filter(ap => ap.type === formData.type).length === 0 && (
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 mt-2">
                      Nenhuma categoria de {formData.type === 'income' ? 'receita' : 'despesa'} encontrada.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Descrição</label>
                  <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Ex: Pagamento conta de luz"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Data (Apenas 2026)</label>
                    <input 
                      type="date" 
                      required
                      min="2026-01-01"
                      max="2026-12-31"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Anexo (URL)</label>
                    <input 
                      type="text" 
                      value={formData.attachment_url}
                      onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      placeholder="Link para PDF/NF/Recibo"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={18} />
                  {editingEntry ? 'Salvar Alterações' : 'Confirmar Lançamento'}
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
