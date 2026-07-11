import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ name: '', fatherName: '', email: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
      const { data } = await api.post(endpoint, form);
      login(data.token, data.username, data.role);
      toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!');
      nav('/');
    } catch (err) {
      // ---- DEBUG LOGGING: check browser console (F12) for exact cause ----
      console.error('Auth request failed');
      console.error('Status code:', err.response?.status);
      console.error('Server message:', err.response?.data);
      console.error('Full error:', err);
      // ---------------------------------------------------------------------
      toast.error(err.response?.data?.message || (isSignUp ? 'Failed to sign up' : 'Invalid credentials'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface-100 font-sans transition-colors duration-300">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] xl:w-[500px] bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900 p-12 relative overflow-hidden shrink-0 border-r border-surface-200/10">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] left-[-15%] w-[320px] h-[320px] bg-primary-500 glow-orb"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[260px] h-[260px] bg-accent-yellow glow-orb"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[220px] h-[220px] bg-primary-400 glow-orb"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" className="w-12 h-12 object-contain bg-white/95 rounded-2xl p-1 shadow-lg border border-white/20" alt="Logo" />
            <span className="text-white font-extrabold text-2xl tracking-wide urdu-text">کتیانہ ملک انجمن</span>
          </div>
          <p className="text-primary-200 text-xs font-bold uppercase tracking-widest pl-1">Management Portal</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight urdu-text">
            اپنی فیسوں کا انتظام<br />زیادہ سمجھداری سے کریں۔
          </h1>
          <p className="text-primary-100 text-sm leading-relaxed max-w-sm">
            Track voluntary payments, manage community members, and generate professional PDF reports — all in one unified, modern dashboard.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Fee Tracking', 'PDF Reports', 'Area Management', 'Contributions'].map(f => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-bold backdrop-blur-md border border-white/10 shadow-sm transition-transform duration-300 hover:scale-105">
                <svg className="w-3.5 h-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Areas', value: 'Active' },
            { label: 'Members', value: 'Dynamic' },
            { label: 'Reports', value: 'PDF' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm">
              <div className="text-lg font-bold text-white tracking-wide">{s.value}</div>
              <div className="text-[10px] text-primary-200 font-extrabold uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Decorative background design for mobile view or dark mode */}
        <div className="lg:hidden absolute top-[-20%] left-[-20%] w-[350px] h-[350px] bg-primary-500/10 glow-orb"></div>
        <div className="lg:hidden absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-accent-yellow/10 glow-orb"></div>

        <div className="w-full max-w-sm relative z-10">

          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/logo.png" className="w-16 h-16 object-contain mb-3 bg-surface-0 rounded-2xl p-1.5 shadow-md border border-surface-200/50" alt="Logo" />
            <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight urdu-text">کتیانہ ملک انجمن</h2>
            <p className="text-xs text-surface-400 font-bold uppercase tracking-widest mt-1">Management Portal</p>
          </div>

          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
          <p className="text-surface-500 text-sm mt-2 mb-8">
            {isSignUp ? 'Sign up for a new administrative account.' : 'Sign in to access your dashboard.'}
          </p>

          <form onSubmit={submit} className="space-y-5">
            {isSignUp && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      className="input pl-10"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Father's Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      className="input pl-10"
                      placeholder="Enter father's name"
                      value={form.fatherName}
                      onChange={e => setForm({...form, fatherName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      className="input pl-10"
                      placeholder="Enter your email address"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  className="input pl-10"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label mb-0">Password</label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  className="input pl-10 pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base font-bold mt-2 disabled:opacity-75 disabled:cursor-not-allowed select-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}