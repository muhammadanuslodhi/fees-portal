import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const CURRENT_YEAR = new Date().getFullYear();

function StatusBadge({ paid }) {
  return paid
    ? <span className="badge-green">Paid</span>
    : <span className="badge-orange">Unpaid</span>;
}

export default function Atiya() {
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ areaId: '', year: CURRENT_YEAR, q: '' });
  const [form, setForm] = useState({ memberId: '', year: CURRENT_YEAR, amount: 0, purpose: '', paid: false, notes: '' });
  const [memberSearch, setMemberSearch] = useState('');

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i), []);

  const load = async () => {
    setLoading(true);
    try {
      const params = { year: filter.year };
      if (filter.areaId) params.areaId = filter.areaId;
      const { data } = await api.get('/atiya', { params });
      setRows(data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    Promise.all([api.get('/members'), api.get('/areas')]).then(([m, a]) => {
      setMembers(m.data); setAreas(a.data);
    });
    load();
  }, []);

  useEffect(() => { load(); }, [filter.year, filter.areaId]);

  const openNew = () => {
    setEditing(null);
    setForm({ memberId: '', year: filter.year, amount: 0, purpose: '', paid: false, notes: '' });
    setMemberSearch('');
    setShow(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ memberId: row.memberId, year: row.year, amount: row.amount, purpose: row.purpose, paid: row.paid, notes: row.notes });
    setMemberSearch(row.member?.memberName ? `${row.member.memberName} (${row.member.memberId})` : '');
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();

    let finalMemberId = form.memberId;
    if (!finalMemberId && memberSearch.trim()) {
      const trimmed = memberSearch.trim().toLowerCase();
      // Exact match
      let matched = members.find(m => m.memberName.toLowerCase() === trimmed || m.memberId.toLowerCase() === trimmed);
      // Unique partial match if no exact match
      if (!matched) {
        const matches = members.filter(m => m.memberName.toLowerCase().includes(trimmed) || m.memberId.toLowerCase().includes(trimmed));
        if (matches.length === 1) {
          matched = matches[0];
        }
      }

      if (matched) {
        finalMemberId = matched.id;
      } else {
        toast.error('Member not found. Please select from the suggestions or enter a valid member name.');
        return;
      }
    }

    if (!finalMemberId) {
      toast.error('Please enter a valid member.');
      return;
    }

    const payload = { ...form, memberId: finalMemberId };

    try {
      if (editing) {
        await api.put(`/atiya/${editing.id}`, payload);
        toast.success('Record updated!');
      } else {
        await api.post('/atiya', payload);
        toast.success('Atiya record saved!');
      }
      setShow(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this Atiya record?')) return;
    try { await api.delete(`/atiya/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = rows.filter(r =>
    !filter.q || r.member?.memberName?.toLowerCase().includes(filter.q.toLowerCase())
  );

  const totalCollected = filtered.filter(r => r.paid).reduce((s, r) => s + r.amount, 0);
  const totalPending = filtered.filter(r => !r.paid).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Atiya</h1>
          <p className="page-subtitle">Track voluntary donations and contributions.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Record
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-surface-500 font-medium mb-1">Total Records</p>
          <p className="text-2xl font-bold text-surface-900">{filtered.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500 font-medium mb-1">Collected</p>
          <p className="text-2xl font-bold text-emerald-600">Rs {totalCollected.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500 font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">Rs {totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label text-xs">Year</label>
            <select className="input" value={filter.year} onChange={e => setFilter({ ...filter, year: Number(e.target.value) })}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Filter by Area</label>
            <select className="input" value={filter.areaId} onChange={e => setFilter({ ...filter, areaId: e.target.value })}>
              <option value="">All Areas</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.areaName}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Search Name</label>
            <div className="relative">
              <input className="input pl-9" placeholder="Name..." value={filter.q} onChange={e => setFilter({ ...filter, q: e.target.value })} />
              <svg className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-surface-200 border-t-primary-500 animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="card p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-surface-900">{r.member?.memberName}</div>
                    <div className="text-xs text-surface-500">{r.member?.area?.areaName} · {r.year}</div>
                  </div>
                  <StatusBadge paid={r.paid} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-surface-900">Rs {r.amount.toLocaleString()}</span>
                    {r.purpose && <span className="ml-2 text-xs text-surface-500">— {r.purpose}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button title="Edit" className="btn-secondary !p-2 text-primary-600" onClick={() => openEdit(r)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button title="Delete" className="btn-secondary !p-2 text-red-500" onClick={() => remove(r.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-surface-400 italic">{r.notes}</p>}
              </div>
            ))}
            {!filtered.length && <div className="card py-12 text-center text-surface-400 text-sm">No records found.</div>}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Area</th>
                  <th className="px-5 py-3 text-center">Year</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Purpose</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-left">Notes</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="table-row group">
                    <td className="px-5 py-4 text-surface-400">{i + 1}</td>
                    <td className="px-5 py-4 font-semibold text-surface-900">{r.member?.memberName}</td>
                    <td className="px-5 py-4"><span className="badge-gray">{r.member?.area?.areaName || '—'}</span></td>
                    <td className="px-5 py-4 text-center text-surface-600">{r.year}</td>
                    <td className="px-5 py-4 text-right font-bold text-surface-900">Rs {r.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-surface-600 text-xs max-w-[140px] truncate">{r.purpose || '—'}</td>
                    <td className="px-5 py-4 text-center"><StatusBadge paid={r.paid} /></td>
                    <td className="px-5 py-4 text-surface-400 text-xs italic max-w-[120px] truncate">{r.notes || '—'}</td>
                    <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-1.5">
                        <button title="Edit" className="btn-secondary !p-2 text-primary-600" onClick={() => openEdit(r)}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button title="Delete" className="btn-secondary !p-2 text-red-500" onClick={() => remove(r.id)}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan="9" className="px-5 py-16 text-center text-surface-400 text-sm">No Atiya records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in">
          <form onSubmit={save} className="card w-full max-w-md animate-scale-in shadow-modal space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-surface-900">{editing ? 'Edit Atiya Record' : 'Add Atiya Record'}</h2>
                <p className="text-xs text-surface-500 mt-0.5">Voluntary donation / gift</p>
              </div>
              <button type="button" className="btn-ghost p-2" onClick={() => setShow(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="relative">
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                placeholder="Type name to search..."
                value={memberSearch}
                onChange={e => {
                  setMemberSearch(e.target.value);
                  setForm({ ...form, memberId: '' });
                }}
                required
              />
              {!form.memberId && memberSearch.trim() && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-surface-100">
                  {members
                    .filter(m =>
                      m.memberName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      m.memberId.toLowerCase().includes(memberSearch.toLowerCase())
                    )
                    .slice(0, 10)
                    .map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, memberId: m.id });
                          setMemberSearch(`${m.memberName} (${m.memberId})`);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-medium text-surface-800">{m.memberName}</span>
                          <span className="text-xs text-surface-400 ml-2">S/o {m.fatherName}</span>
                        </div>
                        <span className="text-xs font-semibold bg-surface-100 px-1.5 py-0.5 rounded text-surface-600">
                          {m.memberId}
                        </span>
                      </button>
                    ))}
                  {members.filter(m =>
                    m.memberName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.memberId.toLowerCase().includes(memberSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-xs text-surface-400 italic">No members found</div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (Rs)</label>
                <input type="number" min="0" className="input" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required />
              </div>
            </div>
            <div>
              <label className="label">Purpose (Optional)</label>
              <input className="input" placeholder="e.g. Mosque renovation..." value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes (Optional)</label>
              <input className="input" placeholder="Any remarks..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={form.paid} onChange={e => setForm({ ...form, paid: e.target.checked })} />
                <div className="w-10 h-6 bg-surface-200 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-surface-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </div>
              <span className="text-sm font-medium text-surface-700">Mark as Received</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setShow(false)}>Cancel</button>
              <button className="btn-primary flex-1">Save Record</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
