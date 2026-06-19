import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { API_ORIGIN } from '../api/axios';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ areaName: '', chairmanName: '', file: null });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); const { data } = await api.get('/areas'); setAreas(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ areaName:'', chairmanName:'', file:null }); setShow(true); };
  const openEdit = (a) => { setEditing(a); setForm({ areaName:a.areaName, chairmanName:a.chairmanName, file:null }); setShow(true); };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('areaName', form.areaName);
    fd.append('chairmanName', form.chairmanName);
    if (form.file) fd.append('chairmanSignature', form.file);
    try {
      if (editing) await api.put(`/areas/${editing.id}`, fd);
      else await api.post('/areas', fd);
      toast.success('Saved successfully!'); setShow(false); load();
    } catch (e) { toast.error('Failed to save area'); }
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this area and all its members?')) return;
    try {
      await api.delete(`/areas/${id}`); 
      toast.success('Area deleted'); 
      load();
    } catch (e) { toast.error('Failed to delete area'); }
  };

  return (
    <div className="space-y-6 animate-slide-up relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Areas Management</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage society areas, chairmen, and view related fees.</p>
        </div>
        <button className="btn-primary shadow-brand-500/30 font-bold tracking-wide w-full sm:w-auto" onClick={openNew}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add New Area
        </button>
      </div>

      <div className="card p-0 overflow-hidden bg-slate-800/80 border-slate-700/50 shadow-2xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <p className="text-slate-400 font-medium">Loading areas...</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="sm:hidden divide-y divide-slate-700/50">
              {areas.map(a => (
                <div key={a.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-base">{a.areaName}</div>
                      <div className="text-slate-400 flex items-center gap-1 mt-1 text-xs font-medium">
                        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {a.chairmanName}
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-xl text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      {a.totalMembers} Members
                    </span>
                  </div>
                  {a.chairmanSignature && (
                    <div className="relative h-10 w-24 bg-slate-900 rounded-xl border border-slate-700 p-1 shadow-inner overflow-hidden">
                      <img src={API_ORIGIN + a.chairmanSignature} className="h-full w-full object-contain filter invert opacity-80" alt="Signature" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link className="btn-secondary !py-2 !px-3 text-xs font-bold flex-1 text-center" to={`/fees/${a.id}`}>View Fees</Link>
                    <button className="btn-secondary !py-2 !px-3 text-xs font-bold flex-1 text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn-secondary !py-2 !px-3 text-xs font-bold flex-1 text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={() => remove(a.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {!areas.length && (
                <div className="p-12 text-center text-slate-500">
                  <div className="p-4 bg-slate-800 inline-block rounded-full mb-4 shadow-inner border border-slate-700">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <p className="text-lg font-bold text-slate-300">No areas found</p>
                  <button className="mt-5 btn-secondary text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={openNew}>Add your first area</button>
                </div>
              )}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-5">Area Details</th>
                    <th className="px-6 py-5">Members</th>
                    <th className="px-6 py-5">Chairman Signature</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {areas.map(a => (
                    <tr key={a.id} className="table-row-hover group transition-all duration-200">
                      <td className="px-6 py-5">
                        <div className="font-bold text-white text-base tracking-wide">{a.areaName}</div>
                        <div className="text-slate-400 flex items-center gap-1.5 mt-1.5 text-xs font-medium">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {a.chairmanName}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-inner">
                          {a.totalMembers} Members
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {a.chairmanSignature ? (
                          <div className="relative h-12 w-32 bg-slate-900 rounded-xl border border-slate-700 p-1 shadow-inner overflow-hidden">
                            <img src={API_ORIGIN + a.chairmanSignature} className="h-full w-full object-contain filter invert opacity-80 hover:opacity-100 transition-all duration-300" alt="Signature" />
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-xs font-medium">No signature</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link className="btn-secondary !py-2 !px-4 text-xs font-bold shadow-md" to={`/fees/${a.id}`}>
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View Fees
                          </Link>
                          <button className="btn-secondary !py-2 !px-4 text-xs font-bold shadow-md text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={() => openEdit(a)}>Edit</button>
                          <button className="btn-secondary !py-2 !px-4 text-xs font-bold shadow-md text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={() => remove(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!areas.length && (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                        <div className="p-4 bg-slate-800 inline-block rounded-full mb-4 shadow-inner border border-slate-700">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-lg font-bold text-slate-300">No areas found</p>
                        <p className="mt-1">Get started by creating a new area.</p>
                        <button className="mt-5 btn-secondary text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={openNew}>Add your first area</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md grid place-items-center z-50 p-4 animate-fade-in">
          <div className="card w-full max-w-md animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.5)] border-slate-600 bg-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{editing ? 'Edit Area' : 'Add New Area'}</h2>
              <button className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors" onClick={() => setShow(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={save} className="space-y-5">
              <div>
                <label className="label">Area Name</label>
                <input className="input" placeholder="e.g. Green Valley" value={form.areaName} onChange={e=>setForm({...form,areaName:e.target.value})} required/>
              </div>
              <div>
                <label className="label">Chairman Name</label>
                <input className="input" placeholder="e.g. Mr. John Doe" value={form.chairmanName} onChange={e=>setForm({...form,chairmanName:e.target.value})} required/>
              </div>
              <div>
                <label className="label">Chairman Signature <span className="text-slate-500 font-normal ml-1">(Optional)</span></label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-xl hover:border-brand-500 transition-colors cursor-pointer bg-slate-900/50 group" onClick={() => document.getElementById('file-upload').click()}>
                  <div className="space-y-2 text-center">
                    <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-500 group-hover:text-brand-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-400 justify-center font-medium">
                      <span className="relative cursor-pointer bg-transparent rounded-md text-brand-400 hover:text-brand-300">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={e=>setForm({...form,file:e.target.files[0]})}/>
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{form.file ? form.file.name : 'PNG, JPG, GIF up to 2MB'}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" className="btn-secondary py-3 px-6 flex-1 sm:flex-none" onClick={()=>setShow(false)}>Cancel</button>
                <button className="btn-primary py-3 px-8 font-bold flex-1 sm:flex-none">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
