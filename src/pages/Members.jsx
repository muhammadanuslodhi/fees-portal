import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filter, setFilter] = useState({ areaId:'', q:'', memberId:'' });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ memberName:'', fatherName:'', areaId:'' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/members', { params: filter });
      setMembers(data); setPage(1);
    } finally { setLoading(false); }
  };
  useEffect(() => { api.get('/areas').then(r => setAreas(r.data)); load(); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter.areaId]);

  const openNew = () => { setEditing(null); setForm({ memberName:'', fatherName:'', areaId: areas[0]?.id || '' }); setShow(true); };
  const openEdit = (m) => { setEditing(m); setForm({ memberName:m.memberName, fatherName:m.fatherName, areaId:m.areaId?.id||m.areaId }); setShow(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/members/${editing.id}`, form);
      else await api.post('/members', form);
      toast.success(editing ? 'Member updated' : 'Member added!'); setShow(false); load();
    } catch { toast.error('Save failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return;
    try { await api.delete(`/members/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const paged = members.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">Manage all society residents.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="label text-xs">Filter by Area</label>
            <select className="input" value={filter.areaId} onChange={e=>setFilter({...filter,areaId:e.target.value})}>
              <option value="">All Areas</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.areaName}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Search by Name</label>
            <div className="relative">
              <input className="input pl-9" placeholder="Ali Khan..." value={filter.q} onChange={e=>setFilter({...filter,q:e.target.value})} onKeyDown={e=>e.key==='Enter'&&load()} />
              <svg className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div>
            <label className="label text-xs">Search by Member ID</label>
            <div className="relative">
              <input className="input pl-9" placeholder="M00001..." value={filter.memberId} onChange={e=>setFilter({...filter,memberId:e.target.value})} onKeyDown={e=>e.key==='Enter'&&load()} />
              <svg className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
            </div>
          </div>
        </div>
        <button className="btn-secondary text-sm" onClick={load}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Apply Filters
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-surface-200 border-t-primary-500 animate-spin"></div>
          <p className="text-surface-500 text-sm">Loading members...</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {paged.map(m => (
              <div key={m.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-surface-900 text-sm">{m.memberName}</div>
                    <div className="text-xs text-surface-500 mt-0.5">S/o {m.fatherName}</div>
                  </div>
                  <div className="text-right">
                    <code className="text-xs font-bold bg-surface-100 border border-surface-200 px-2 py-1 rounded-lg text-surface-700">{m.memberId}</code>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="badge-purple">{m.areaId?.areaName || '—'}</span>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs !py-1.5 !px-3 text-primary-600" onClick={()=>openEdit(m)}>Edit</button>
                    <button className="btn-secondary text-xs !py-1.5 !px-3 text-red-500" onClick={()=>remove(m.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {!paged.length && (
              <div className="card py-16 text-center">
                <p className="text-surface-400 text-sm">No members found.</p>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3 text-left">Member ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Father's Name</th>
                  <th className="px-6 py-3 text-left">Area</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(m => (
                  <tr key={m.id} className="table-row group">
                    <td className="px-6 py-4">
                      <code className="text-xs font-bold bg-surface-100 border border-surface-200 px-2.5 py-1 rounded-lg text-surface-700">{m.memberId}</code>
                    </td>
                    <td className="px-6 py-4 font-semibold text-surface-900">{m.memberName}</td>
                    <td className="px-6 py-4 text-surface-500">{m.fatherName}</td>
                    <td className="px-6 py-4">
                      <span className="badge-purple">{m.areaId?.areaName || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn-secondary text-xs !py-1.5 !px-3 text-primary-600" onClick={()=>openEdit(m)}>Edit</button>
                        <button className="btn-secondary text-xs !py-1.5 !px-3 text-red-500" onClick={()=>remove(m.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!paged.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-surface-400 text-sm">No members found. Try adjusting your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {members.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 bg-surface-50/50">
                <span className="text-xs text-surface-500">
                  Showing {Math.min((page-1)*pageSize+1, members.length)}–{Math.min(page*pageSize, members.length)} of {members.length} members
                </span>
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs !py-1.5 !px-4" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Previous</button>
                  <button className="btn-secondary text-xs !py-1.5 !px-4" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Pagination */}
          {members.length > pageSize && (
            <div className="flex sm:hidden justify-between items-center">
              <button className="btn-secondary text-xs" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Previous</button>
              <span className="text-xs text-surface-500">Page {page} of {totalPages}</span>
              <button className="btn-secondary text-xs" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in">
          <form onSubmit={save} className="card w-full max-w-md animate-scale-in shadow-modal space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-surface-900">{editing ? 'Edit Member' : 'Add New Member'}</h2>
              <button type="button" className="btn-ghost p-2 rounded-lg" onClick={() => setShow(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. Ali Khan" value={form.memberName} onChange={e=>setForm({...form,memberName:e.target.value})} required />
            </div>
            <div>
              <label className="label">Father's Name</label>
              <input className="input" placeholder="e.g. Ahmed Khan" value={form.fatherName} onChange={e=>setForm({...form,fatherName:e.target.value})} required />
            </div>
            <div>
              <label className="label">Area</label>
              <select className="input" value={form.areaId} onChange={e=>setForm({...form,areaId:e.target.value})} required>
                <option value="" disabled>Select area...</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.areaName}</option>)}
              </select>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 font-medium">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {editing ? 'Member ID cannot be changed once assigned.' : 'A unique Member ID will be auto-generated.'}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={()=>setShow(false)}>Cancel</button>
              <button className="btn-primary flex-1">Save Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
