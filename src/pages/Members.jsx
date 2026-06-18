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
  
  useEffect(() => { 
    api.get('/areas').then(r => setAreas(r.data)); 
    load(); 
  }, []);
  
  useEffect(() => { 
    load(); 
    /* eslint-disable-next-line */ 
  }, [filter.areaId]);

  const openNew = () => { setEditing(null); setForm({ memberName:'', fatherName:'', areaId: areas[0]?.id || '' }); setShow(true); };
  const openEdit = (m) => { setEditing(m); setForm({ memberName:m.memberName, fatherName:m.fatherName, areaId:m.areaId?.id||m.areaId }); setShow(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/members/${editing.id}`, form);
      else await api.post('/members', form);
      toast.success(editing ? 'Member updated' : 'Member added successfully!'); 
      setShow(false); load();
    } catch { toast.error('Save failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.delete(`/members/${id}`); 
      toast.success('Member deleted'); 
      load();
    } catch { toast.error('Failed to delete member'); }
  };

  const paged = members.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));

  return (
    <div className="space-y-6 animate-slide-up relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Members Directory</h1>
          <p className="text-slate-400 mt-1">Manage society residents and their details.</p>
        </div>
        <button className="btn-primary shadow-brand-500/30 font-bold tracking-wide" onClick={openNew}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add New Member
        </button>
      </div>

      <div className="card p-6 bg-slate-800/80 border border-slate-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
          <div className="w-full md:w-1/4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Filter by Area</label>
            <select className="input cursor-pointer" value={filter.areaId} onChange={e=>setFilter({...filter,areaId:e.target.value})}>
              <option value="">All Areas</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.areaName}</option>)}
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Search Name</label>
            <div className="relative">
              <input className="input pl-11" placeholder="e.g. Ali Khan" value={filter.q} onChange={e=>setFilter({...filter,q:e.target.value})}/>
              <svg className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Search Member ID</label>
            <div className="relative">
              <input className="input pl-11" placeholder="e.g. M00001" value={filter.memberId} onChange={e=>setFilter({...filter,memberId:e.target.value})}/>
              <svg className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>
            </div>
          </div>
          <button className="btn-secondary h-[50px] px-8 font-bold" onClick={load}>Filter</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden bg-slate-800/80 border-slate-700/50 shadow-2xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <p className="text-slate-400 font-medium">Loading members...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-5">Member ID</th>
                    <th className="px-6 py-5">Personal Info</th>
                    <th className="px-6 py-5">Area</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paged.map(m => (
                    <tr key={m.id} className="table-row-hover group transition-all duration-200">
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-bold px-3 py-1.5 bg-slate-900/80 rounded-xl text-slate-300 border border-slate-700/80 shadow-inner inline-block">
                          {m.memberId}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-white text-base tracking-wide">{m.memberName}</div>
                        <div className="text-slate-400 flex items-center gap-1.5 mt-1 text-xs font-medium">
                          <span className="text-slate-500">S/o</span> {m.fatherName}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-inner">
                          {m.areaId?.areaName || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button className="btn-secondary !py-2 !px-4 text-xs font-bold shadow-md text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={()=>openEdit(m)}>
                            Edit
                          </button>
                          <button className="btn-secondary !py-2 !px-4 text-xs font-bold shadow-md text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={()=>remove(m.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!paged.length && (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                        <div className="p-4 bg-slate-800 inline-block rounded-full mb-4 shadow-inner border border-slate-700">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <p className="text-lg font-bold text-slate-300">No members found</p>
                        <p className="mt-1">Adjust your filters or add a new member.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {members.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-slate-700/50 bg-slate-900/30 gap-4">
                <span className="text-sm text-slate-400 font-medium">
                  Showing <span className="text-white font-bold">{Math.min((page-1)*pageSize + 1, members.length)}</span> to <span className="text-white font-bold">{Math.min(page*pageSize, members.length)}</span> of <span className="text-white font-bold">{members.length}</span> members
                </span>
                <div className="flex gap-2">
                  <button className="btn-secondary !py-2 !px-5 text-sm font-bold" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button>
                  <button className="btn-secondary !py-2 !px-5 text-sm font-bold" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md grid place-items-center z-50 p-4 animate-fade-in">
          <form onSubmit={save} className="card w-full max-w-md animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.5)] border-slate-600 bg-slate-800 space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-white">{editing ? 'Edit Member' : 'Add New Member'}</h2>
              <button type="button" className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors" onClick={() => setShow(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Ali Khan" value={form.memberName} onChange={e=>setForm({...form,memberName:e.target.value})} required/>
              </div>
              <div>
                <label className="label">Father's Name</label>
                <input className="input" placeholder="e.g. Ahmed Khan" value={form.fatherName} onChange={e=>setForm({...form,fatherName:e.target.value})} required/>
              </div>
              <div>
                <label className="label">Assign to Area</label>
                <select className="input cursor-pointer" value={form.areaId} onChange={e=>setForm({...form,areaId:e.target.value})} required>
                  <option value="" disabled className="text-slate-500">Select an area...</option>
                  {areas.map(a => <option key={a.id} value={a.id} className="text-slate-200">{a.areaName}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-brand-500/10 text-brand-300 p-4 rounded-xl flex items-start gap-3 text-sm font-medium border border-brand-500/20 shadow-inner">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {editing ? 'Member ID cannot be changed once assigned.' : 'A unique Member ID will be auto-generated upon saving.'}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button type="button" className="btn-secondary py-3 px-6" onClick={()=>setShow(false)}>Cancel</button>
              <button className="btn-primary py-3 px-8 font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
