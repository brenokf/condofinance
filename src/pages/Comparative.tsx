import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Wallet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Zap,
  HardHat,
  ShieldCheck,
  Building,
  ArrowRight,
  PieChart as PieChartIcon,
  Receipt,
  FileText
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
  AreaChart,
  Area,
  ComposedChart,
  Line
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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Carregando Painel de Transparência...</div>;

  const entries = data?.entries || [];
  const accountPlan = data?.accountPlan || [];

  // Monthly Cash Flow
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = entries.filter((e: any) => new Date(e.date).getMonth() === i);
    const receita = monthEntries.filter((e: any) => e.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const despesa = monthEntries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
    return {
      name: new Date(2026, i).toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      receita,
      despesa,
      saldo: receita - despesa,
    };
  });

  const totalExpense = entries.filter((e: any) => e.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);

  // Grouping for "Every R$ 100" logic based on standard Condominium splits
  // To make it visually stunning, we use fixed conceptual percentages if DB is empty, otherwise we map roughly.
  // Here we use realistic standard percentages mapping but calculate dynamically if available.
  const dynamicGroups = entries.filter((e: any) => e.type === 'expense').reduce((acc: any, curr: any) => {
    const cat = accountPlan.find((ap: any) => ap.id === curr.account_plan_id);
    const name = cat?.name?.toLowerCase() || '';
    if (name.includes('imposto') || name.includes('inss') || name.includes('fgts') || name.includes('encargo')) acc.impostos += curr.amount;
    else if (name.includes('água') || name.includes('luz') || name.includes('gás')) acc.consumo += curr.amount;
    else if (name.includes('pessoal') || name.includes('salário') || name.includes('funcionário')) acc.pessoal += curr.amount;
    else if (name.includes('manuten')) acc.manut += curr.amount;
    else acc.outros += curr.amount;
    return acc;
  }, { impostos: 0, pessoal: 0, consumo: 0, manut: 0, outros: 0 });

  const totalMapped = dynamicGroups.impostos + dynamicGroups.pessoal + dynamicGroups.consumo + dynamicGroups.manut + dynamicGroups.outros;
  
  // If no DB data, fallback to educational realistic standard
  const hasData = totalMapped > 0;
  const percImpostos = hasData ? (dynamicGroups.impostos / totalMapped) * 100 : 25;
  const percPessoal = hasData ? (dynamicGroups.pessoal / totalMapped) * 100 : 35;
  const percConsumo = hasData ? (dynamicGroups.consumo / totalMapped) * 100 : 20;
  const percManut = hasData ? (dynamicGroups.manut / totalMapped) * 100 : 15;
  const percOutros = hasData ? (dynamicGroups.outros / totalMapped) * 100 : 5;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <Scale className="text-emerald-400" size={32} /> Painel da Transparência
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Portal Educativo e Prestação de Contas aos Moradores</p>
      </div>

      {/* Hero Section: O Reajuste de 11% */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-center justify-between">
            <div className="flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl mb-6 shadow-inner">
                  <Info size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Comunicado Oficial de Assembleia</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-6 drop-shadow-md">
                 Entenda por que a Taxa Condominial foi reajustada em <span className="text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded-2xl border border-indigo-500/30">11%</span>
               </h2>
               <p className="text-sm md:text-base font-bold text-slate-300 leading-relaxed mb-6">
                 Para manter o padrão do nosso condomínio e a conformidade com as leis trabalhistas e tributárias do país, foi necessário aprovar um reajuste. 
                 Muitos moradores desconhecem, mas o condomínio atua quase como uma "empresa". Sofremos diretamente com o aumento de **Tributos Patronais (INSS/FGTS/PIS)**, dissídio coletivo sindical dos porteiros e zeladores, e inflação nos insumos de concessionárias (Água/Luz).
               </p>
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Aprovado Democraticamente</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Previsão Anual de Custeio</div>
               </div>
            </div>
            
            <div className="w-full xl:w-[450px] bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Composição Real do Reajuste</h3>
               <div className="space-y-5">
                 <ReajusteBar label="Encargos Trab. / Impostos / Dissídio" percent={5.5} color="bg-rose-500" total={11} icon={Receipt} />
                 <ReajusteBar label="Tarifas Públicas (Água / Energia)" percent={3.5} color="bg-amber-500" total={11} icon={Zap} />
                 <ReajusteBar label="Inflação Materiais / Contratos" percent={1.5} color="bg-emerald-500" total={11} icon={HardHat} />
                 <ReajusteBar label="Aporte Fundo Reserva Obrigat." percent={0.5} color="bg-indigo-500" total={11} icon={Building} />
               </div>
               <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700/50">
                 <span className="text-sm font-black text-white uppercase tracking-widest">Total do Aumento</span>
                 <span className="text-3xl font-black text-indigo-400">11<span className="text-xl">.0%</span></span>
               </div>
            </div>
         </div>
      </div>

      {/* A Cada 100 Reais Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden shadow-inner flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Wallet size={32} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-white tracking-tighter">De cada <span className="text-emerald-400">R$ 100,00</span> pagos...</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Para onde o dinheiro da sua cota vai?</p>
             </div>
          </div>
          
          <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">
            Quase **um terço** da taxa de condomínio é direcionada puramente para o pagamento dos encargos do governo (Impostos, INSS, FGTS, Taxas de Concessionária embutidos). Apenas uma fração fica para benfeitorias físicas.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <CoinSplit percent={Math.round(percPessoal)} label="Funcionários (Líquido)" color="text-slate-300" border="border-slate-700" />
            <CoinSplit percent={Math.round(percImpostos)} label="Impostos e Encargos Cultos" color="text-rose-400" border="border-rose-500/30" bg="bg-rose-500/10" highlight />
            <CoinSplit percent={Math.round(percConsumo)} label="Contas de Consumo" color="text-amber-400" border="border-amber-500/30" />
            <CoinSplit percent={Math.round(percManut + percOutros)} label="Serviços / Manutenção" color="text-emerald-400" border="border-emerald-500/30" />
          </div>
        </div>

        {/* Carga Tributária Deep Dive */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-center">
           <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
             <FileText className="text-rose-400" /> O Peso Invisível dos Impostos
           </h3>
           <p className="text-xs font-bold text-slate-400 leading-relaxed mb-8">
             Moradores frequentemente confundem o valor do salário do porteiro com o custo total do porteiro para o condomínio. Para cada salário pago pago a um funcionário direto ou terceirizado, há quase <strong className="text-rose-400 px-1">70% de encargos adicionais</strong> e tributação invisível repassada à taxa.
           </p>

           <div className="space-y-4">
             <ImpCard title="FGTS + Multa (Provisão)" desc="Garantia governamental e provisões" cost="~8 a 12%" />
             <ImpCard title="INSS Patronal + Terceiros" desc="Tributo incidente sobre a folha para custeio da Seguridade Social" cost="~28%" />
             <ImpCard title="Impostos no Consumo (ICMS/PIS/COFINS)" desc="Embutidos diretamente na conta de Luz e Água das áreas comuns." cost="~30 a 40%" alert />
           </div>
        </div>
      </div>

      {/* Main Comparative Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Histórico Transparente</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Evolução de Arrecadação vs Gasto Real</p>
          </div>
          <div className="flex flex-wrap gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
            <LegendItem color="#10b981" label="Orçamento Recebido" />
            <LegendItem color="#6366f1" label="Execução (Despesas)" />
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `R$ ${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.5rem', padding: '1rem', color: '#fff' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
              />
              <Area type="monotone" dataKey="receita" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeWidth={3} />
              <Bar dataKey="despesa" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ReajusteBar = ({ label, percent, color, total, icon: Icon }: any) => {
  const widthPerc = (percent / total) * 100;
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
        </div>
        <span className="text-xs font-black text-white">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${widthPerc}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${color} rounded-full relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-[-45deg] animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
    </div>
  )
};

const CoinSplit = ({ percent, label, color, border, bg, highlight }: any) => (
  <div className={`p-4 rounded-3xl border ${border} ${bg || 'bg-slate-900'} relative overflow-hidden group`}>
    {highlight && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 blur-xl rounded-full" />}
    <p className={`text-4xl font-black ${color} tracking-tighter mb-1 relative z-10`}>R$ {percent},00</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight relative z-10">{label}</p>
  </div>
);

const ImpCard = ({ title, desc, cost, alert }: any) => (
  <div className={`p-4 rounded-2xl border ${alert ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-900 border-slate-800'} flex items-center justify-between gap-4`}>
    <div className="flex-1">
      <h4 className={`text-xs font-black uppercase tracking-widest ${alert ? 'text-rose-400' : 'text-slate-300'} mb-1`}>{title}</h4>
      <p className="text-[10px] font-bold text-slate-500 leading-snug">{desc}</p>
    </div>
    <div className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">
      <span className={`text-[10px] font-black ${alert ? 'text-rose-400' : 'text-slate-400'} uppercase tracking-widest`}>{cost}</span>
    </div>
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-md" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
  </div>
);

export default Comparative;
