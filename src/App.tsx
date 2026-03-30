import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  User as UserIcon,
  Wallet,
  Plus,
  Calendar
} from 'lucide-react';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { seedAccountPlan } from './api';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import Entries from './pages/Entries';
import Comparative from './pages/Comparative';

interface AuthContextType {
  user: { email: string; role: string } | null;
  login: (data: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

const App = () => {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          } else {
            // Fallback for new users if loginWithGoogle didn't handle it
            setUser({ email: firebaseUser.email || '', role: 'resident' });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to resident role
          setUser({ email: firebaseUser.email || '', role: 'resident' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      console.log('User is admin, calling seedAccountPlan');
      seedAccountPlan();
    }
  }, [user]);

  const login = (data: any) => {
    setUser(data);
  };

  const logout = () => {
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest">Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = user?.role === 'admin' ? [
    { name: 'Dashboard Síndico', path: '/', icon: LayoutDashboard },
    { name: 'Lançamentos', path: '/entries', icon: Plus },
    { name: 'Comparativo', path: '/comparative', icon: BarChart3 },
  ] : [
    { name: 'Resumo Morador', path: '/', icon: LayoutDashboard },
    { name: 'Comparativo', path: '/comparative', icon: BarChart3 },
  ];

  const displayEmail = user?.email || 'Acesso Público';
  const displayRole = user?.role === 'admin' ? 'Síndico' : 'Morador';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight uppercase">CondoFinance</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestão 2026</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} />
                <span className="text-sm font-bold uppercase tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                <UserIcon size={20} className="text-slate-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{displayEmail}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{displayRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold uppercase tracking-wide">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
              <Calendar size={16} className="text-indigo-400" />
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Exercício 2026</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/" element={user?.role === 'admin' ? <AdminDashboard /> : <ResidentDashboard />} />
              <Route path="/entries" element={user?.role === 'admin' ? <Entries /> : <Navigate to="/" />} />
              <Route path="/comparative" element={<Comparative />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
