import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api, { API_ORIGIN } from '../api/axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function PaidBadge({ paid }) {
  return paid ? (
    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
    </span>
  ) : (
    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-red-50 text-red-400 border border-red-100">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
    </span>
  );
}

export default function FeePortal() {
  const { areaId } = useParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ memberName:'', fatherName:'' });

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({length:5}, (_,i) => cur - i);
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get(`/reports/area/${areaId}`, { params: { year } });
    setReport(data); setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [areaId, year]);

  const openUpdate = (row) => {
    const fee = row.fee || { memberId: row.member.id, year };
    const base = {};
    MONTHS.forEach(m => base[m] = fee[m] || { paid:false, amount:500 });
    setEditing({ member: row.member, fee: { ...fee, ...base } });
  };

  const saveFee = async () => {
    const payload = { memberId: editing.member.id, year };
    MONTHS.forEach(m => payload[m] = editing.fee[m]);
    await api.post('/fees', payload);
    toast.success('Fee record updated!'); setEditing(null); load();
  };

  const deleteMember = async (id) => {
    if (!confirm('Delete this member?')) return;
    await api.delete(`/members/${id}`); toast.success('Deleted'); load();
  };

  const addMember = async (e) => {
    e.preventDefault();
    await api.post('/members', { ...newMember, areaId });
    toast.success('Member added!'); setShowAdd(false); setNewMember({memberName:'',fatherName:''}); load();
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18); doc.text('Fees Portal', 14, 15);
    doc.setFontSize(12); doc.text(`Area: ${report.area.areaName}`, 14, 23);
    doc.text(`Year: ${year}`, 14, 29);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
    const head = [['#','ID','Name','Father',...SHORT,'Total']];
    const body = report.rows.map((r,i) => {
      const cells = MONTHS.map(m => (r.fee?.[m]?.paid ? '✓' : '✗'));
      return [i+1, r.member.memberId, r.member.memberName, r.member.fatherName||'', ...cells, r.fee?.totalAmount||0];
    });
    autoTable(doc, { head, body, startY: 42, styles:{fontSize:7}, headStyles:{fillColor:[20,184,166]} });
    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.text(`Total Members: ${report.summary.totalMembers}`, 14, finalY);
    doc.text(`Total Collected: Rs ${report.summary.totalCollected}`, 80, finalY);
    doc.setFontSize(9);
    doc.text('Fees Portal Management System © 2026', 14, doc.internal.pageSize.height - 8);
    doc.save(`${report.area.areaName}-${year}.pdf`);
  };

  if (loading || !report) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-surface-200 border-t-primary-500 animate-spin"></div>
      <p className="text-surface-500 text-sm font-medium">Loading fee records...</p>
    </div>
  );

  const filtered = report.rows.filter(r =>
    !search || r.member.memberName.toLowerCase().includes(search.toLowerCase()) || r.member.memberId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h1 className="page-title">{report.area.areaName}</h1>
            </div>
            <p className="page-subtitle">
              Chairman: <span className="font-medium text-surface-700">{report.area.chairmanName}</span>
              {' · '}Last updated: {new Date(report.latestUpdate).toLocaleDateString()}
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <span className="badge-blue text-sm px-3 py-1.5">{report.summary.totalMembers} Members</span>
            <span className="badge-green text-sm px-3 py-1.5">Rs {report.summary.totalCollected?.toLocaleString()} Collected</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-surface-100">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input className="input pl-9" placeholder="Search member by name or ID..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="input !w-auto cursor-pointer font-semibold" value={year} onChange={e=>setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-success" onClick={()=>setShowAdd(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add Member
          </button>
          <button className="btn-secondary" onClick={exportPDF}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((r, i) => (
          <div key={r.member.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-surface-400 font-medium">#{i+1}</span>
                <div className="font-semibold text-surface-900 text-sm mt-0.5">{r.member.memberName}</div>
                <div className="text-xs text-surface-500">{r.member.fatherName}</div>
              </div>
              <div className="text-right">
                <code className="text-xs bg-surface-100 border border-surface-200 px-2 py-0.5 rounded font-bold text-surface-700">{r.member.memberId}</code>
                <div className="mt-1.5 font-bold text-emerald-600 text-sm">Rs {r.fee?.totalAmount?.toLocaleString() || 0}</div>
              </div>
            </div>
            {/* Month grid 6x2 */}
            <div className="grid grid-cols-6 gap-1.5">
              {MONTHS.map((m, mi) => (
                <div key={m} className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-surface-400 font-medium">{SHORT[mi]}</span>
                  <PaidBadge paid={r.fee?.[m]?.paid} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-surface-100">
              <button className="btn-secondary text-xs flex-1 !py-2 text-primary-600" onClick={()=>openUpdate(r)}>Update Fee</button>
              <button className="btn-secondary text-xs flex-1 !py-2 text-red-500" onClick={()=>deleteMember(r.member.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="card py-16 text-center">
            <p className="text-surface-400 text-sm">No members found.</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Father</th>
                {SHORT.map(m => <th key={m} className="px-2 py-3 text-center">{m}</th>)}
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.member.id} className="table-row group">
                  <td className="px-4 py-3 text-surface-400 font-medium">{i+1}</td>
                  <td className="px-4 py-3">
                    <code className="bg-surface-100 border border-surface-200 px-2 py-0.5 rounded text-xs font-bold text-surface-700">{r.member.memberId}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold text-surface-900">{r.member.memberName}</td>
                  <td className="px-4 py-3 text-surface-500">{r.member.fatherName}</td>
                  {MONTHS.map(m => (
                    <td key={m} className="px-2 py-3 text-center"><PaidBadge paid={r.fee?.[m]?.paid} /></td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold text-emerald-600">
                    Rs {r.fee?.totalAmount?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <button className="btn-secondary text-xs !py-1 !px-2.5 text-primary-600 mr-1" onClick={()=>openUpdate(r)}>Update</button>
                    <button className="btn-secondary text-xs !py-1 !px-2.5 text-red-500" onClick={()=>deleteMember(r.member.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan="18" className="px-6 py-16 text-center text-surface-400 text-sm">No members found.</td></tr>
              )}
            </tbody>
            <tfoot className="table-head border-t-2 border-surface-200">
              <tr>
                <td colSpan="4" className="px-4 py-3 font-semibold text-surface-700">
                  Total: {report.summary.totalMembers} members
                </td>
                <td colSpan="12"></td>
                <td className="px-4 py-3 text-center font-bold text-emerald-600">
                  Rs {report.summary.totalCollected?.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Chairman Signature */}
      {report.area.chairmanSignature && (
        <div className="card p-5 max-w-xs">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Chairman Signature</h4>
          <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 h-20 flex items-center justify-center mb-2">
            <img src={API_ORIGIN + report.area.chairmanSignature} alt="signature" className="h-full object-contain" />
          </div>
          <p className="font-semibold text-surface-900 text-sm">{report.area.chairmanName}</p>
        </div>
      )}

      {/* Fee Update Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="card w-full max-w-2xl animate-scale-in shadow-modal max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Update Fee Record</h2>
                <p className="text-sm text-surface-500">{editing.member.memberName} · {year}</p>
              </div>
              <button className="btn-ghost p-2 rounded-lg" onClick={()=>setEditing(null)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 pr-1">
              {MONTHS.map(m => (
                <div key={m} className={`rounded-xl border p-3 transition-colors ${editing.fee[m].paid ? 'border-primary-200 bg-primary-50' : 'border-surface-200 bg-surface-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-surface-800 text-sm">{m}</span>
                    <label className="relative flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={editing.fee[m].paid}
                        onChange={e => setEditing({...editing, fee:{...editing.fee, [m]:{...editing.fee[m], paid:e.target.checked}}})} />
                      <div className="w-9 h-5 bg-surface-300 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-surface-300 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs font-semibold">Rs</span>
                    <input type="number" className="input !pl-7 !py-2 text-sm" value={editing.fee[m].amount}
                      onChange={e => setEditing({...editing, fee:{...editing.fee, [m]:{...editing.fee[m], amount:Number(e.target.value)}}})} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t border-surface-100">
              <button className="btn-secondary flex-1" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={saveFee}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in">
          <form onSubmit={addMember} className="card w-full max-w-md animate-scale-in shadow-modal space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-surface-900">Add Member to {report.area.areaName}</h2>
              <button type="button" className="btn-ghost p-2 rounded-lg" onClick={()=>setShowAdd(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. Ali Khan" value={newMember.memberName} onChange={e=>setNewMember({...newMember,memberName:e.target.value})} required />
            </div>
            <div>
              <label className="label">Father's Name</label>
              <input className="input" placeholder="e.g. Ahmed Khan" value={newMember.fatherName} onChange={e=>setNewMember({...newMember,fatherName:e.target.value})} required />
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 font-medium">
              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              A unique Member ID will be auto-generated.
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn-primary flex-1">Add Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
