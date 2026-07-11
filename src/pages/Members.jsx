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
  const [form, setForm] = useState({ 
    memberName: '', 
    fatherName: '', 
    areaId: '', 
    cnic: '', 
    dateOfBirth: '', 
    phoneNo: '', 
    address: '' 
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFees, setMemberFees] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/members', { params: filter });
      setMembers(data); setPage(1);
    } finally { setLoading(false); }
  };
  useEffect(() => { api.get('/areas').then(r => setAreas(r.data)); load(); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter.areaId]);

  const openNew = () => { 
    setEditing(null); 
    setForm({ 
      memberName: '', 
      fatherName: '', 
      areaId: areas[0]?.id || '', 
      cnic: '', 
      dateOfBirth: '', 
      phoneNo: '', 
      address: '' 
    }); 
    setShow(true); 
  };
  const openEdit = (m) => { 
    setEditing(m); 
    setForm({ 
      memberName: m.memberName, 
      fatherName: m.fatherName, 
      areaId: m.areaId?.id || m.areaId,
      cnic: m.cnic || '',
      dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth).toISOString().split('T')[0] : '',
      phoneNo: m.phoneNo || '',
      address: m.address || ''
    }); 
    setShow(true); 
  };
  const openProfile = async (m) => {
    setSelectedMember(m);
    setShowProfile(true);
    loadMemberFees(m);
  };
  const loadMemberFees = async (m) => {
    setProfileLoading(true);
    try {
      const { data } = await api.get('/fees', { params: { areaId: m.areaId?.id || m.areaId, memberId: m.memberId } });
      setMemberFees(data);
    } catch {
      setMemberFees([]);
    } finally {
      setProfileLoading(false);
    }
  };

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
                      <button title="View Profile" className="btn-secondary !p-2 text-green-600" onClick={()=>openProfile(m)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button title="Edit Member" className="btn-secondary !p-2 text-primary-600" onClick={()=>openEdit(m)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button title="Delete Member" className="btn-secondary !p-2 text-red-500" onClick={()=>remove(m.id)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
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
                        <button title="View Profile" className="btn-secondary !p-2 text-green-600" onClick={()=>openProfile(m)}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button title="Edit Member" className="btn-secondary !p-2 text-primary-600" onClick={()=>openEdit(m)}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button title="Delete Member" className="btn-secondary !p-2 text-red-500" onClick={()=>remove(m.id)}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in overflow-y-auto">
          <form onSubmit={save} className="card w-full max-w-lg animate-scale-in shadow-modal space-y-4 my-8">
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
              <label className="label">CNIC</label>
              <input className="input" placeholder="e.g. 12345-1234567-8" value={form.cnic} onChange={e=>setForm({...form,cnic:e.target.value})} required />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={form.dateOfBirth} onChange={e=>setForm({...form,dateOfBirth:e.target.value})} />
            </div>
            <div>
              <label className="label">Phone No</label>
              <input className="input" placeholder="e.g. 0300-1234567" value={form.phoneNo} onChange={e=>setForm({...form,phoneNo:e.target.value})} />
            </div>
            <div>
              <label className="label">Full Residential Address</label>
              <textarea className="input min-h-[80px]" placeholder="Enter full address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
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

      {/* Member Profile Modal */}
      {showProfile && selectedMember && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in">
          <div className="card w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in shadow-modal space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-surface-900">Member Profile</h2>
              <button type="button" className="btn-ghost p-2 rounded-lg" onClick={() => setShowProfile(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Member Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div>
                <div className="text-xs text-surface-500 mb-1">Member ID</div>
                <code className="text-sm font-bold bg-white border border-surface-200 px-2 py-1 rounded-lg text-surface-700">{selectedMember.memberId}</code>
              </div>
              <div>
                <div className="text-xs text-surface-500 mb-1">CNIC</div>
                <div className="font-semibold text-surface-900">{selectedMember.cnic}</div>
              </div>
              <div>
                <div className="text-xs text-surface-500 mb-1">Full Name</div>
                <div className="font-semibold text-surface-900">{selectedMember.memberName}</div>
              </div>
              <div>
                <div className="text-xs text-surface-500 mb-1">Father's Name</div>
                <div className="text-surface-700">{selectedMember.fatherName}</div>
              </div>
              <div>
                <div className="text-xs text-surface-500 mb-1">Date of Birth</div>
                <div className="text-surface-700">{selectedMember.dateOfBirth ? new Date(selectedMember.dateOfBirth).toLocaleDateString() : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-surface-500 mb-1">Phone No</div>
                <div className="text-surface-700">{selectedMember.phoneNo || '—'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-surface-500 mb-1">Full Residential Address</div>
                <div className="text-surface-700">{selectedMember.address || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-surface-500 mb-1">Area</div>
                <span className="badge-purple">{selectedMember.areaId?.areaName || '—'}</span>
              </div>
            </div>

            {/* Fee Summary */}
            {!profileLoading && memberFees.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-surface-900 mb-3">Total Fees Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-surface-200">
                    <div className="text-xs text-surface-500">Total Paid</div>
                    <div className="text-xl font-bold text-green-600">
                      {memberFees.reduce((sum, fee) => sum + (fee.totalAmount - fee.pendingAmount), 0)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-surface-200">
                    <div className="text-xs text-surface-500">Total Pending</div>
                    <div className="text-xl font-bold text-red-600">
                      {memberFees.reduce((sum, fee) => sum + fee.pendingAmount, 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fee Records */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-3">Fee Records</h3>
              {profileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-3 border-surface-200 border-t-primary-500 animate-spin"></div>
                </div>
              ) : memberFees.length > 0 ? (
                <div className="space-y-3">
                  {memberFees.map(fee => (
                    <div key={fee.id} className="p-4 border border-surface-200 rounded-xl bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-surface-900">Year {fee.year}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${fee.pendingAmount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {fee.pendingAmount > 0 ? `${fee.pendingAmount} Pending` : 'Fully Paid'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => {
                          const paid = fee[month]?.paid;
                          const amount = fee[month]?.amount;
                          return (
                            <div key={month} className={`p-2 rounded-lg border ${paid ? 'border-green-200 bg-green-50' : 'border-surface-200 bg-surface-50'}`}>
                              <div className="font-medium text-surface-700">{month}</div>
                              <div className={`text-xs ${paid ? 'text-green-700' : 'text-surface-500'}`}>
                                {paid ? `Paid: ${amount}` : 'Not Paid'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-surface-100 flex gap-4 text-sm">
                        <div><span className="text-surface-500">Total Amount:</span> <span className="font-semibold text-surface-900">{fee.totalAmount}</span></div>
                        <div><span className="text-surface-500">Pending:</span> <span className={`font-semibold ${fee.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>{fee.pendingAmount}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-surface-500 text-sm">No fee records found for this member.</div>
              )}
            </div>

            <div className="pt-2">
              <button className="btn-secondary w-full" onClick={() => setShowProfile(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
