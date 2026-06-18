import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { username, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); nav('/login'); };

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/areas', label: 'Areas' },
    { to: '/members', label: 'Members' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <div className="min-h-full flex flex-col font-sans">
      {/* Background visual to match login screen */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-20 mix-blend-screen overflow-hidden">
        <img src="/login-bg.png" alt="bg" className="w-full h-full object-cover blur-sm" />
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg' : 'bg-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-600 text-white grid place-items-center font-bold shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-all duration-300 transform group-hover:-translate-y-0.5">
              F
            </div>
            <span className="text-2xl font-bold text-gradient tracking-tight">Fees Portal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end
                className={({isActive}) => `relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive ? 'text-white bg-slate-800 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                {l.label}
              </NavLink>
            ))}
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            <div className="flex items-center gap-3 ml-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm">
              <span className="text-sm font-medium text-slate-300">Hi, <span className="text-white font-bold">{username}</span></span>
              <button onClick={handleLogout} className="bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40">Logout</button>
            </div>
          </nav>
          <button className="md:hidden p-2 text-slate-300" onClick={() => setOpen(o => !o)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 space-y-2 shadow-2xl">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end onClick={() => setOpen(false)}
                className={({isActive}) => `block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                {l.label}
              </NavLink>
            ))}
            <div className="h-px bg-slate-800 my-2"></div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium text-slate-300">{username}</span>
              <button onClick={handleLogout} className="text-rose-400 font-bold text-sm hover:text-rose-300">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in relative z-10">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-indigo-600 text-white grid place-items-center text-sm font-bold shadow-md shadow-brand-500/20">F</div>
            <span className="font-semibold text-slate-200">Fees Portal</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">© 2026 Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
