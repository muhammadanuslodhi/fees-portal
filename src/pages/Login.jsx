import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.username);
      toast.success('Welcome back!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const loginAsGuest = () => {
    login('guest_token', 'Guest User');
    toast.success('Welcome, Guest!');
    nav('/');
  };

  return (
    <div className="min-h-screen flex text-slate-100 bg-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Left side - Visuals */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="Abstract Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 mix-blend-screen transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20 z-10 pointer-events-none"></div>
        <div className="relative z-20 text-center px-12 max-w-lg p-10 rounded-3xl border border-white/10 backdrop-blur-md bg-black/20 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-600 text-white grid place-items-center font-bold text-4xl mx-auto mb-6 shadow-lg shadow-brand-500/30">F</div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-white">Fees Portal</h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Manage your institution's finances securely and efficiently with our premium dashboard.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 bg-slate-900 z-10 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-8 text-center">
             <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-600 text-white grid place-items-center font-bold text-3xl mx-auto mb-4">F</div>
             <h2 className="text-3xl font-bold">Fees Portal</h2>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-slate-400 mb-8">Please enter your credentials to access your account.</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input 
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-100 placeholder-slate-500" 
                placeholder="admin"
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
                required 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
              </div>
              <input 
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-100 placeholder-slate-500" 
                type="password" 
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 focus:ring-4 focus:ring-brand-500/30 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-900 text-slate-500">Or continue without account</span>
              </div>
            </div>
            
            <button 
              onClick={loginAsGuest}
              type="button"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all shadow-sm group"
            >
              <svg className="text-slate-400 group-hover:text-slate-300" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
