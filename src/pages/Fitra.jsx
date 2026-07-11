import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const CURRENT_YEAR = new Date().getFullYear();

function StatusBadge({ paid }) {
  return paid
    ? <span className="badge-green">Paid</span>
    : <span className="badge-orange">Unpaid</span>;
}

export default function Fitra() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ year: CURRENT_YEAR, q: '' });
  const [form, setForm] = useState({ name: '', year: CURRENT_YEAR, persons: 1, amountPerPerson: 320, paid: false, notes: '' });

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i), []);
  const totalAmount = (Number(form.persons) || 0) * (Number(form.amountPerPerson) || 0);

  const load = async () => {
    setLoading(true);
    try {
      const params = { year: filter.year };
      const { data } = await api.get('/fitra', { params });
      setRows(data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => { load(); }, [filter.year]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', year: filter.year, persons: 1, amountPerPerson: 320, paid: false, notes: '' });
    setShow(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, year: row.year, persons: row.persons, amountPerPerson: row.amountPerPerson, paid: row.paid, notes: row.notes });
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter a name.');
      return;
    }

    const payload = { ...form };

    try {
      if (editing) {
        await api.put(`/fitra/${editing.id}`, payload);
        toast.success('Record updated!');
      } else {
        await api.post('/fitra', payload);
        toast.success('Fitra record saved!');
      }
      setShow(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this Fitra record?')) return;
    try { await api.delete(`/fitra/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = rows.filter(r =>
    !filter.q || r.name?.toLowerCase().includes(filter.q.toLowerCase())
  );

  const totalCollected = filtered.filter(r => r.paid).reduce((s, r) => s + r.totalAmount, 0);
  const totalPending = filtered.filter(r => !r.paid).reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Fitra</h1>
          <p className="page-subtitle">Track Fitra (Sadaqah al-Fitr) payments per household.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">Year</label>
            <select className="input" value={filter.year} onChange={e => setFilter({ ...filter, year: Number(e.target.value) })}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
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
      <>
          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="card p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-surface-900">{r.name}</div>
                    <div className="text-xs text-surface-500">{r.year}</div>
                  </div>
                  <StatusBadge paid={r.paid} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="bg-surface-50 rounded-lg p-2 border border-surface-100">
                    <div className="text-surface-400">Persons</div>
                    <div className="font-bold text-surface-800">{r.persons}</div>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-2 border border-surface-100">
                    <div className="text-surface-400">Per Person</div>
                    <div className="font-bold text-surface-800">Rs {r.amountPerPerson}</div>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-2 border border-primary-100">
                    <div className="text-primary-500">Total</div>
                    <div className="font-bold text-primary-700">Rs {r.totalAmount.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button title="Edit" className="btn-secondary !p-2 text-primary-600" onClick={() => openEdit(r)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button title="Delete" className="btn-secondary !p-2 text-red-500" onClick={() => remove(r.id)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
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
                  <th className="px-5 py-3 text-center">Year</th>
                  <th className="px-5 py-3 text-center">Persons</th>
                  <th className="px-5 py-3 text-right">Per Person</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="table-row group">
                    <td className="px-5 py-4 text-surface-400">{i + 1}</td>
                    <td className="px-5 py-4 font-semibold text-surface-900">{r.name}</td>
                    <td className="px-5 py-4 text-center text-surface-600">{r.year}</td>
                    <td className="px-5 py-4 text-center font-medium text-surface-800">{r.persons}</td>
                    <td className="px-5 py-4 text-right text-surface-700">Rs {r.amountPerPerson}</td>
                    <td className="px-5 py-4 text-right font-bold text-surface-900">Rs {r.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center"><StatusBadge paid={r.paid} /></td>
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
                  <tr><td colSpan="8" className="px-5 py-16 text-center text-surface-400 text-sm">No Fitra records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in">
          <form onSubmit={save} className="card w-full max-w-md animate-scale-in shadow-modal space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-surface-900">{editing ? 'Edit Fitra Record' : 'Add Fitra Record'}</h2>
                <p className="text-xs text-surface-500 mt-0.5">Sadaqah al-Fitr per household</p>
              </div>
              <button type="button" className="btn-ghost p-2" onClick={() => setShow(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter name..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">No. of Persons</label>
                <input type="number" min="1" className="input" value={form.persons} onChange={e => setForm({ ...form, persons: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Amount Per Person</label>
                <input type="number" min="0" className="input" placeholder="320" value={form.amountPerPerson} onChange={e => setForm({ ...form, amountPerPerson: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Total Amount</label>
                <div className="input bg-surface-50 font-bold text-primary-700">Rs {totalAmount.toLocaleString()}</div>
              </div>
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
              <span className="text-sm font-medium text-surface-700">Mark as Paid</span>
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
