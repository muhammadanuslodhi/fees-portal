import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { username, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(document.documentElement.classList.contains('dark'));
  };

  const handleLogout = () => { logout(); nav('/login'); };

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/areas', label: 'Areas' },
    { to: '/members', label: 'Members' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <div className="min-h-full flex flex-col font-sans">
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl shadow-glass border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-500 text-white grid place-items-center font-bold shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-all duration-300 transform group-hover:-translate-y-0.5">
              F
            </div>
            <span className="text-2xl font-bold text-gradient tracking-tight">Fees Portal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end
                className={({isActive}) => `relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' : 'text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                {l.label}
              </NavLink>
            ))}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
            <button onClick={toggleDark} className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-300 hover:rotate-12">
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <div className="flex items-center gap-3 ml-2 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 pl-3 pr-1 py-1 rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Hi, <span className="font-bold">{username}</span></span>
              <button onClick={handleLogout} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-rose-500/20 hover:shadow-rose-500/40">Logout</button>
            </div>
          </nav>
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setOpen(o => !o)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-t dark:border-gray-800 px-4 py-3 space-y-2 shadow-lg">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end onClick={() => setOpen(false)}
                className={({isActive}) => `block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'}`}>
                {l.label}
              </NavLink>
            ))}
            <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
            <div className="flex items-center justify-between px-4 py-2">
              <button onClick={toggleDark} className="text-sm font-medium flex items-center gap-2">
                 {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleLogout} className="text-rose-600 font-bold text-sm">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-gray-200/50 dark:border-gray-800/50 bg-white/30 dark:bg-dark-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <div className="w-6 h-6 rounded-md bg-brand-600 text-white grid place-items-center text-xs font-bold">F</div>
            <span className="font-semibold text-sm">Fees Portal</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">© 2026 Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
