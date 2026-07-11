import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { to: '/areas', label: 'Areas', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )},
  { to: '/members', label: 'Members', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )},
  { to: '/reports', label: 'Reports', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
];

const ISLAMIC_NAV = [
  { to: '/zakat', label: 'Zakat', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { to: '/fitra', label: 'Fitra', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )},
  { to: '/atiya', label: 'Atiya', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )},
];

export default function Layout() {
  const { username, role, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark-mode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('dark-mode', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => { logout(); nav('/login'); };
  const initials = username ? username.slice(0, 2).toUpperCase() : 'AD';

  const filteredNavItems = NAV_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredIslamicNav = ISLAMIC_NAV.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full flex bg-surface-100 font-sans transition-colors duration-300">

      {/* ── Sidebar ── */}
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-surface-0 border-r border-surface-200/50 shadow-sidebar transition-transform duration-300 sidebar-width
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-200/50">
          <img src="/logo.png" className="w-10 h-10 object-contain bg-white rounded-xl p-0.5 shadow-sm" alt="Logo" />
          <div>
            <div className="font-extrabold text-surface-900 text-base leading-none urdu-text">کتیانہ ملک انجمن</div>
            <div className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Portal System</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <svg className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full pl-9 pr-8 py-2 text-xs bg-surface-50 border border-surface-200 rounded-xl text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-surface-0 transition-all duration-300"
              placeholder="Search page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1 rounded-full hover:bg-surface-200/50 transition-colors"
                title="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {/* Main nav */}
          {filteredNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* Islamic Contributions Section */}
          {filteredIslamicNav.length > 0 && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-4 text-[9px] font-bold text-surface-400 uppercase tracking-widest">Contributions</p>
              </div>
              {filteredIslamicNav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          {filteredNavItems.length === 0 && filteredIslamicNav.length === 0 && (
            <div className="px-3 py-4 text-xs text-surface-400 text-center italic">
              No matching pages found
            </div>
          )}
        </nav>

        {/* Theme switcher */}
        <div className="px-4 py-3 border-t border-surface-200/50 bg-surface-50/50">
          <div className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest mb-2 px-1">Appearance</div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface-0 border border-surface-200 rounded-xl text-xs font-semibold text-surface-700 hover:bg-surface-100 hover:text-surface-900 shadow-sm transition-all select-none"
          >
            <span className="flex items-center gap-2">
              {darkMode ? (
                <>
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Theme</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-accent-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 11-7.07 7.07 5 5 0 017.07-7.07z" />
                  </svg>
                  <span>Light Theme</span>
                </>
              )}
            </span>
            <div className={`w-8 h-4 rounded-full transition-colors relative ${darkMode ? 'bg-primary-500' : 'bg-surface-300'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[1px] transition-all shadow-sm ${darkMode ? 'right-[1px]' : 'left-[1px]'}`}></div>
            </div>
          </button>
        </div>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-surface-200/50 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-50 border border-surface-200/40 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-primary-500/10">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-surface-900 truncate">{username}</div>
              <div className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">
                {role === 'admin' ? 'Administrator' : 'Standard'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200/50 border border-transparent py-2.5"
          >
            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] transition-all duration-300">

        {/* Top Bar (mobile) */}
        <header className="sticky top-0 z-30 bg-surface-0 border-b border-surface-200/50 shadow-sm lg:hidden transition-colors duration-300">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-surface-100 text-surface-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" alt="Logo" />
              <span className="font-extrabold text-surface-900 text-sm urdu-text">کتیانہ ملک انجمن</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary-500/10">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in bg-surface-100 transition-colors duration-300">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-surface-200/50 bg-surface-0 transition-colors duration-300">
          <p className="text-[11px] font-semibold text-surface-400 text-center tracking-wider uppercase">© 2026 کتیانہ ملک انجمن۔ جملہ حقوق محفوظ ہیں۔</p>
        </footer>
      </div>
    </div>
  );
}
