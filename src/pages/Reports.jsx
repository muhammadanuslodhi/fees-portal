import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Reports() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    api.get('/areas').then(r => { setAreas(r.data); setLoading(false); }); 
  }, []);

  return (
    <div className="space-y-6 animate-slide-up relative z-10">
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Reports Overview</h1>
        <p className="text-slate-400 mt-1">Select an area to view detailed fee reports and member statistics.</p>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-slate-400 font-medium">Loading reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(a => (
            <Link key={a.id} to={`/fees/${a.id}`} className="card card-hover group block bg-slate-800/80 border-slate-700/50 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                
                <h3 className="font-extrabold text-xl text-white mb-2">{a.areaName}</h3>
                <div className="space-y-1.5 mb-6">
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Chairman: <span className="text-slate-300 font-medium">{a.chairmanName}</span>
                  </p>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Total Members: <span className="text-slate-300 font-medium">{a.totalMembers}</span>
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-brand-400 text-sm font-bold group-hover:text-brand-300 transition-colors">
                  <span>View detailed report</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>
          ))}
          {!areas.length && (
            <div className="col-span-full card p-10 text-center">
              <div className="p-4 bg-slate-800 inline-block rounded-full mb-4 shadow-inner border border-slate-700">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-lg font-bold text-slate-300">No areas found</p>
              <p className="text-slate-500 mt-1">Please add areas from the Areas Management page.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
