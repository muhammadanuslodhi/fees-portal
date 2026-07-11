import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color, change }) => (
  <div className="card card-hover group cursor-default">
    <div className="flex items-start justify-between mb-4">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      {change !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-surface-900 mb-1">{value}</div>
    <div className="text-sm text-surface-500 font-medium">{title}</div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ totalAreas:0, totalMembers:0, totalCollected:0, totalPending:0, latest:[] });
  const [areas, setAreas] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ areas: [], members: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { (async () => {
    try {
      const [a, s] = await Promise.all([api.get('/areas'), api.get('/reports/dashboard')]);
      setAreas(a.data); setStats(s.data);
    } finally { setLoading(false); }
  })(); }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ areas: [], members: [] });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await api.get('/reports/search', { params: { q: searchQuery } });
        setSearchResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-surface-200 border-t-primary-500 animate-spin"></div>
      <p className="text-surface-500 text-sm font-medium">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening.</p>
        </div>

        {/* Global Search Bar */}
        <div ref={dropdownRef} className="flex-1 max-w-md w-full relative z-40">
          <div className="relative">
            <svg className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full pl-10 pr-10 py-2.5 bg-surface-0 border border-surface-200 rounded-xl text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              placeholder="Search areas or members..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults({ areas: [], members: [] });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1 rounded-full hover:bg-surface-100 transition-colors"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-surface-0 border border-surface-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-surface-200/50 max-h-80 overflow-y-auto animate-scale-in">
              {searchLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-surface-500 text-sm font-medium">
                  <div className="w-4 h-4 rounded-full border-2 border-surface-200 border-t-primary-500 animate-spin"></div>
                  Searching...
                </div>
              ) : (
                <>
                  {/* Areas Section */}
                  {searchResults.areas.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                        Areas
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.areas.map((area) => (
                          <button
                            key={area.id}
                            onClick={() => {
                              setShowDropdown(false);
                              nav(`/fees/${area.id}`);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-50 flex items-center justify-between transition-colors cursor-pointer animate-fade-in"
                          >
                            <div>
                              <div className="text-sm font-semibold text-surface-800">{area.areaName}</div>
                              <div className="text-xs text-surface-400">Chairman: {area.chairmanName}</div>
                            </div>
                            <span className="badge-blue text-[10px] px-2 py-0.5">Area</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Members Section */}
                  {searchResults.members.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                        Members
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.members.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => {
                              setShowDropdown(false);
                              nav(`/fees/${member.areaId?.id}?q=${member.memberId}`);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-50 flex items-center justify-between transition-colors cursor-pointer animate-fade-in"
                          >
                            <div>
                              <div className="text-sm font-semibold text-surface-800">
                                {member.memberName}
                              </div>
                              <div className="text-xs text-surface-400 flex items-center gap-1.5 mt-0.5">
                                <code className="bg-surface-100 border border-surface-200 px-1 py-0.2 rounded font-bold text-[10px] text-surface-600">
                                  {member.memberId}
                                </code>
                                <span>·</span>
                                <span>S/o {member.fatherName}</span>
                                <span>·</span>
                                <span className="text-surface-500 font-medium">{member.areaId?.areaName}</span>
                              </div>
                            </div>
                            <span className="badge-purple text-[10px] px-2 py-0.5">Member</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {searchResults.areas.length === 0 && searchResults.members.length === 0 && (
                    <div className="p-6 text-center text-surface-400 text-sm">
                      <svg className="w-8 h-8 mx-auto mb-2 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      No areas or members found for "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link to="/areas" className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Area
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Areas"
          value={stats.totalAreas}
          color="bg-blue-50/70 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
        />
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          color="bg-purple-50/70 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard
          title="Total Collected"
          value={`Rs ${stats.totalCollected.toLocaleString()}`}
          color="bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Total Pending"
          value={`Rs ${stats.totalPending.toLocaleString()}`}
          color="bg-orange-50/70 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Quick Area Search */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 text-sm">Quick Fee Lookup</h3>
            <p className="text-xs text-surface-500">Select an area to view its fee records</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="input flex-1"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="" disabled>Choose an area...</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.areaName}</option>)}
          </select>
          <button
            className="btn-primary px-6"
            disabled={!selected}
            onClick={() => nav(`/fees/${selected}`)}
          >
            View Fees
          </button>
          <Link to="/areas" className="btn-secondary px-6">All Areas</Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
            <h3 className="font-semibold text-surface-900">Recent Fee Activity</h3>
          </div>
          <Link to="/reports" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">View all →</Link>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-surface-100">
          {stats.latest.map(f => (
            <div key={f.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-surface-900 text-sm">{f.memberId?.memberName || '—'}</div>
                  <span className="badge-gray text-xs mt-1">{f.memberId?.areaId?.areaName || '—'}</span>
                </div>
                <span className="text-xs text-surface-400 font-medium">{f.year}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-600 font-bold">Rs {f.totalAmount?.toLocaleString()}</span>
                <span className="text-orange-600 font-bold">Pending: Rs {f.pendingAmount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {!stats.latest.length && (
            <div className="py-12 text-center">
              <p className="text-surface-400 text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-6 py-3 text-left">Member</th>
                <th className="px-6 py-3 text-left">Area</th>
                <th className="px-6 py-3 text-left">Year</th>
                <th className="px-6 py-3 text-left">Collected</th>
                <th className="px-6 py-3 text-left">Pending</th>
                <th className="px-6 py-3 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest.map(f => (
                <tr key={f.id} className="table-row">
                  <td className="px-6 py-4 font-semibold text-surface-900">{f.memberId?.memberName || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="badge-gray">{f.memberId?.areaId?.areaName || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-surface-600 font-medium">{f.year}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">Rs {f.totalAmount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-orange-600">Rs {f.pendingAmount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-surface-400 text-xs">
                    {new Date(f.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {!stats.latest.length && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-surface-400">
                      <svg className="w-10 h-10 mb-3 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <p className="font-medium text-surface-500">No recent activity</p>
                      <p className="text-xs mt-1">Activity will appear here when fees are updated.</p>
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
