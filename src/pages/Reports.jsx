import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Reports() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/areas').then(r => { setAreas(r.data); setLoading(false); });
  }, []);

  const COLORS = [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-purple-50 text-purple-600 border-purple-100',
    'bg-orange-50 text-orange-600 border-orange-100',
    'bg-emerald-50 text-emerald-600 border-emerald-100',
    'bg-pink-50 text-pink-600 border-pink-100',
    'bg-indigo-50 text-indigo-600 border-indigo-100',
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Select an area to view detailed fee reports.</p>
      </div>

      {!loading && areas.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="font-semibold text-surface-900 mb-1">No areas available</h3>
          <p className="text-surface-500 text-sm">Add areas first to generate reports.</p>
          <Link to="/areas" className="btn-primary mt-4 mx-auto">Go to Areas</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((a, idx) => {
            const color = COLORS[idx % COLORS.length];
            return (
              <Link
                key={a.id}
                to={`/fees/${a.id}`}
                className="card card-hover group block cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-surface-900 text-base truncate group-hover:text-primary-600 transition-colors">{a.areaName}</h3>
                    <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {a.chairmanName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                  <span className="badge-blue">{a.totalMembers} Members</span>
                  <span className="text-xs font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Report
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
