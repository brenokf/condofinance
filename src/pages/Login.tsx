import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, LogIn, AlertCircle, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import { loginWithGoogle } from '../api';
import { useAuth } from '../App';

const Login = () => {
  const [view, setView] = useState<'select' | 'login'>('select');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await loginWithGoogle();
      login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 selection:bg-indigo-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-800 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">CondoFinance</h1>
          <p className="text-slate-400 text-sm font-medium">
            Gestão financeira transparente 2026.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'select' ? (
            <motion.div 
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button 
                onClick={() => {
                  login({ email: 'Acesso Público', role: 'resident' });
                  navigate('/');
                }}
                className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-[1.5rem] hover:bg-slate-800 hover:border-indigo-500/50 transition-all group text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">Sou Morador</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Acesso público ao resumo</p>
                </div>
              </button>

              <button 
                onClick={() => setView('login')}
                className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-[1.5rem] hover:bg-slate-800 hover:border-indigo-500/50 transition-all group text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">Sou Síndico</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Acesso restrito à gestão</p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button 
                onClick={() => setView('select')}
                className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar para seleção
              </button>

              <div className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm"
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <p className="text-xs text-slate-500 text-center mb-6">
                  Utilize sua conta Google autorizada para acessar as ferramentas de gestão.
                </p>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Entrando...' : (
                    <>
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                      Entrar com Google
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 pt-8 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Exercício Fiscal 2026</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
