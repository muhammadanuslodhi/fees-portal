import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { API_ORIGIN } from '../api/axios';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-md animate-scale-in shadow-modal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-surface-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

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
      toast.success('Saved!'); setShow(false); load();
    } catch { toast.error('Failed to save area'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this area and all its members?')) return;
    try { await api.delete(`/areas/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Areas</h1>
          <p className="page-subtitle">Manage society areas and chairmen.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Area
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-surface-200 border-t-primary-500 animate-spin"></div>
          <p className="text-surface-500 text-sm">Loading areas...</p>
        </div>
      ) : areas.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="font-semibold text-surface-900 mb-1">No areas yet</h3>
          <p className="text-surface-500 text-sm mb-4">Create your first area to get started.</p>
          <button className="btn-primary mx-auto" onClick={openNew}>Add Area</button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {areas.map(a => (
              <div key={a.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-surface-900">{a.areaName}</div>
                    <div className="text-sm text-surface-500 flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {a.chairmanName}
                    </div>
                  </div>
                  <span className="badge-blue">{a.totalMembers} Members</span>
                </div>
                {a.chairmanSignature && (
                  <div className="h-10 w-20 bg-surface-100 rounded-lg border border-surface-200 p-1 overflow-hidden">
                    <img src={API_ORIGIN + a.chairmanSignature} className="h-full w-full object-contain" alt="Signature" />
                  </div>
                )}
                <div className="flex gap-2 pt-1 border-t border-surface-100">
                  <Link className="btn-secondary text-xs flex-1 text-center !py-2" to={`/fees/${a.id}`}>View Fees</Link>
                  <button className="btn-secondary text-xs flex-1 text-primary-600 !py-2" onClick={() => openEdit(a)}>Edit</button>
                  <button className="btn-secondary text-xs flex-1 text-red-500 !py-2" onClick={() => remove(a.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3 text-left">Area</th>
                  <th className="px-6 py-3 text-left">Chairman</th>
                  <th className="px-6 py-3 text-left">Members</th>
                  <th className="px-6 py-3 text-left">Signature</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(a => (
                  <tr key={a.id} className="table-row group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-surface-900">{a.areaName}</div>
                    </td>
                    <td className="px-6 py-4 text-surface-600">{a.chairmanName}</td>
                    <td className="px-6 py-4">
                      <span className="badge-blue">{a.totalMembers} Members</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.chairmanSignature ? (
                        <div className="h-10 w-24 bg-surface-100 rounded-lg border border-surface-200 p-1 overflow-hidden">
                          <img src={API_ORIGIN + a.chairmanSignature} className="h-full w-full object-contain" alt="Signature" />
                        </div>
                      ) : (
                        <span className="text-surface-400 text-xs italic">No signature</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link className="btn-secondary text-xs !py-1.5 !px-3" to={`/fees/${a.id}`}>View Fees</Link>
                        <button className="btn-secondary text-xs !py-1.5 !px-3 text-primary-600" onClick={() => openEdit(a)}>Edit</button>
                        <button className="btn-secondary text-xs !py-1.5 !px-3 text-red-500" onClick={() => remove(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {show && (
        <Modal title={editing ? 'Edit Area' : 'Add New Area'} onClose={() => setShow(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Area Name</label>
              <input className="input" placeholder="e.g. Green Valley" value={form.areaName} onChange={e=>setForm({...form,areaName:e.target.value})} required />
            </div>
            <div>
              <label className="label">Chairman Name</label>
              <input className="input" placeholder="e.g. Mr. John Doe" value={form.chairmanName} onChange={e=>setForm({...form,chairmanName:e.target.value})} required />
            </div>
            <div>
              <label className="label">Chairman Signature <span className="text-surface-400 font-normal">(Optional)</span></label>
              <div
                className="mt-1 border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('sig-upload').click()}
              >
                <svg className="w-8 h-8 text-surface-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-sm text-surface-500 font-medium">
                  {form.file ? form.file.name : 'Click to upload image'}
                </p>
                <p className="text-xs text-surface-400 mt-1">PNG, JPG up to 2MB</p>
                <input id="sig-upload" type="file" className="sr-only" accept="image/*" onChange={e=>setForm({...form,file:e.target.files[0]})} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShow(false)}>Cancel</button>
              <button className="btn-primary flex-1">Save Area</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
