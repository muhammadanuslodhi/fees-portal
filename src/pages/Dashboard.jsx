import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Card = ({ title, value, gradient, icon }) => (
  <div className="card card-hover group relative overflow-hidden bg-slate-800/60 border-slate-700/50 shadow-2xl">
    <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-20 blur-3xl transition-transform duration-700 group-hover:scale-150 ${gradient}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <div className={`p-2.5 rounded-xl bg-slate-900/50 shadow-inner backdrop-blur-md border border-white/5`}>
        {icon}
      </div>
    </div>
    <p className={`text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r relative z-10 ${gradient}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ totalAreas:0, totalMembers:0, totalCollected:0, totalPending:0, latest:[] });
  const [areas, setAreas] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => { (async () => {
    try {
      const [a, s] = await Promise.all([api.get('/areas'), api.get('/reports/dashboard')]);
      setAreas(a.data); setStats(s.data);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-brand-500 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      <p className="text-slate-400 font-medium">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up relative z-10">
      
      {/* Search Header */}
      <div className="card bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/50 shadow-2xl overflow-visible">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex items-center gap-3 shrink-0 mr-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          
          <div className="relative flex-1">
            <select 
              className="input appearance-none w-full pr-10 text-lg py-4 bg-slate-900/50 font-semibold cursor-pointer shadow-inner" 
              value={selected} 
              onChange={e => setSelected(e.target.value)}
            >
              <option value="" disabled className="text-slate-500">Search or select an area...</option>
              {areas.map(a => <option key={a.id} value={a.id} className="text-slate-200">{a.areaName}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button className="btn-primary py-4 px-8 text-base shadow-brand-500/30" disabled={!selected} onClick={() => nav(`/fees/${selected}`)}>View Fees</button>
          
          <div className="hidden md:block w-px h-12 bg-slate-700/50 mx-2"></div>
          
          <div className="flex gap-2">
            <Link to="/areas" className="btn-secondary py-4 px-6 flex-1 text-center">All Areas</Link>
            <Link to="/areas" className="btn-success py-4 px-6 flex-1 text-center whitespace-nowrap">+ New</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Areas" value={stats.totalAreas} 
          gradient="from-brand-400 to-indigo-400"
          icon={<svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <Card 
          title="Total Members" value={stats.totalMembers} 
          gradient="from-purple-400 to-pink-400"
          icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <Card 
          title="Total Collected" value={`RS: ${stats.totalCollected.toLocaleString()}`} 
          gradient="from-emerald-400 to-teal-400"
          icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <Card 
          title="Total Pending" value={`RS: ${stats.totalPending.toLocaleString()}`} 
          gradient="from-rose-400 to-red-400"
          icon={<svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        /> 
      </div>

      <div className="card p-0 overflow-hidden bg-slate-800/80 border-slate-700/50 shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-900/30 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            <div className="p-1.5 bg-brand-500/20 rounded-lg">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            Latest Activity Updates
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-5">Member</th>
                <th className="px-6 py-5">Area</th>
                <th className="px-6 py-5">Year</th>
                <th className="px-6 py-5">Collected</th>
                <th className="px-6 py-5">Pending</th>
                <th className="px-6 py-5">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {stats.latest.map(f => (
                <tr key={f.id} className="table-row-hover group">
                  <td className="px-6 py-4 font-bold text-slate-100">{f.memberId?.memberName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
                      {f.memberId?.areaId?.areaName || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-300">{f.year}</td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Rs: {f.totalAmount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]">Rs: {f.pendingAmount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                    {new Date(f.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {!stats.latest.length && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-800 rounded-full mb-3 shadow-inner border border-slate-700">
                        <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      </div>
                      <p className="font-semibold text-slate-300">No fee updates found recently.</p>
                      <p className="text-sm mt-1">Updates will appear here when fees are modified.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
