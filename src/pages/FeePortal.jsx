import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api, { API_ORIGIN } from '../api/axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
    toast.success('Updated'); setEditing(null); load();
  };

  const deleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    await api.delete(`/members/${id}`); toast.success('Deleted'); load();
  };

  const addMember = async (e) => {
    e.preventDefault();
    await api.post('/members', { ...newMember, areaId });
    toast.success('Member added'); setShowAdd(false); setNewMember({memberName:'',fatherName:''}); load();
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18); doc.text('Fees Portal', 14, 15);
    doc.setFontSize(12); doc.text(`Area: ${report.area.areaName}`, 14, 23);
    doc.text(`Year: ${year}`, 14, 29);
    doc.text(`Latest Update: ${new Date(report.latestUpdate).toLocaleString()}`, 14, 35);

    const head = [['#','ID','Name','Father', ...SHORT, 'Total']];
    const body = report.rows.map((r, i) => {
      const cells = MONTHS.map(m => (r.fee?.[m]?.paid ? 'P' : 'U'));
      return [i+1, r.member.memberId, r.member.memberName, r.member.fatherName || 0, ...cells, r.fee?.totalAmount || 0];
    });

    autoTable(doc, { head, body, startY: 42, styles: { fontSize: 7 }, headStyles: { fillColor: [37,99,235] } });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.text(`Total Members: ${report.summary.totalMembers}`, 14, finalY);
    doc.text(`Total Collected: Rs ${report.summary.totalCollected}`, 80, finalY);

    if (report.area.chairmanSignature) {
      try {
        doc.text('Chairman Signature:', 14, finalY + 15);
        doc.text(report.area.chairmanName, 14, finalY + 35);
      } catch {}
    }
    doc.setFontSize(9);
    doc.text('Fees Portal Management System © 2026', 14, doc.internal.pageSize.height - 8);
    doc.save(`${report.area.areaName}-${year}.pdf`);
  };

  if (loading || !report) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-brand-500 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      <p className="text-slate-400 font-medium">Loading area details...</p>
    </div>
  );

  const filtered = report.rows.filter(r =>
    !search || r.member.memberName.toLowerCase().includes(search.toLowerCase()) || r.member.memberId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up relative z-10">
      {/* Header Card */}
      <div className="card flex flex-col gap-4 bg-slate-800/80 border-slate-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              {report.area.areaName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">Latest update: <span className="text-slate-300">{new Date(report.latestUpdate).toLocaleString()}</span></p>
          </div>
          <select className="input h-11 !w-full sm:!w-32 cursor-pointer font-bold" value={year} onChange={e=>setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <input className="input pl-10 h-11 w-full" placeholder="Search member..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex gap-2">
            <button className="btn-success h-11 px-4 flex-1 sm:flex-none shadow-emerald-500/20" onClick={()=>setShowAdd(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Member
            </button>
            <button className="btn-primary h-11 px-4 flex-1 sm:flex-none" onClick={exportPDF}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Card layout for fee records */}
      <div className="sm:hidden space-y-3">
        {filtered.map((r, i) => (
          <div key={r.member.id} className="card p-4 bg-slate-800/80 border-slate-700/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">#{i+1}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900/80 rounded text-slate-300 border border-slate-700">
                    {r.member.memberId}
                  </span>
                </div>
                <div className="font-bold text-slate-100 mt-1">{r.member.memberName}</div>
                <div className="text-slate-400 text-xs">{r.member.fatherName}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-emerald-400 text-sm">Rs {r.fee?.totalAmount?.toLocaleString() || 0}</div>
                <div className="text-xs text-slate-500">collected</div>
              </div>
            </div>
            
            {/* Month grid */}
            <div className="grid grid-cols-6 gap-1.5">
              {MONTHS.map((m, mi) => (
                <div key={m} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-medium">{SHORT[mi]}</span>
                  {r.fee?.[m]?.paid ? (
                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </span>
                  ) : (
                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400/50 border border-rose-500/20">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-1 border-t border-slate-700/50">
              <button className="btn-secondary !py-2 !px-3 text-xs font-bold flex-1 text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={()=>openUpdate(r)}>Update Fee</button>
              <button className="btn-secondary !py-2 !px-3 text-xs font-bold flex-1 text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={()=>deleteMember(r.member.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="card p-12 text-center text-slate-500 bg-slate-800/80">
            <div className="p-4 bg-slate-800 inline-block rounded-full mb-3 shadow-inner border border-slate-700">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <p className="text-base font-bold text-slate-300">No members found</p>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="card p-4 bg-slate-800/80 border-slate-700/50 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total Members</span>
              <div className="font-bold text-white">{report.summary.totalMembers}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total Collected</span>
              <div className="font-extrabold text-emerald-400">Rs {report.summary.totalCollected?.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden sm:block card p-0 overflow-hidden bg-slate-800/80 border-slate-700/50 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-700/50 shadow-sm">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Father</th>
                {SHORT.map(m => <th key={m} className="p-3 text-center">{m}</th>)}
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((r, i) => (
                <tr key={r.member.id} className="table-row-hover group transition-colors">
                  <td className="p-3 text-center text-slate-500 font-medium">{i+1}</td>
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-900/80 rounded text-slate-300 border border-slate-700">
                      {r.member.memberId}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-100">{r.member.memberName}</td>
                  <td className="p-3 text-slate-400">{r.member.fatherName}</td>
                  
                  {MONTHS.map(m => (
                    <td key={m} className="p-3 text-center">
                      {r.fee?.[m]?.paid ? (
                        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      ) : (
                        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400/50 border border-rose-500/20">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </span>
                      )}
                    </td>
                  ))}
                  
                  <td className="p-3 text-center font-extrabold text-emerald-400">
                    Rs: {r.fee?.totalAmount?.toLocaleString() || 0}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-secondary !py-1 !px-2 text-xs font-bold mr-1 text-brand-400 border-brand-500/30 hover:bg-brand-500/10" onClick={()=>openUpdate(r)}>Fee</button>
                    <button className="btn-secondary !py-1 !px-2 text-xs font-bold text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={()=>deleteMember(r.member.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="18" className="text-center p-16 text-slate-500">
                    <div className="p-4 bg-slate-800 inline-block rounded-full mb-3 shadow-inner border border-slate-700">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p className="text-base font-bold text-slate-300">No members found</p>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-900/80 font-bold border-t-2 border-slate-700 shadow-inner">
              <tr>
                <td colSpan="4" className="p-4 text-slate-300">
                  <span className="text-slate-500 mr-2 uppercase tracking-wider text-[10px]">Total Members</span>
                  {report.summary.totalMembers}
                </td>
                <td colSpan="12"></td>
                <td className="p-4 text-center">
                  <span className="text-slate-500 block uppercase tracking-wider text-[10px] mb-0.5">Total Collected</span>
                  <span className="text-emerald-400 text-sm drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Rs: {report.summary.totalCollected?.toLocaleString()}</span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Chairman Signature */}
      <div className="card text-center bg-slate-800/80 border-slate-700/50 w-full max-w-sm mx-auto shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          Chairman Signature
        </h3>
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 mb-3 mx-4 sm:mx-8 shadow-inner h-24 flex items-center justify-center">
          {report.area.chairmanSignature
            ? <img src={API_ORIGIN + report.area.chairmanSignature} alt="signature" className="h-full w-full object-contain filter invert opacity-80" />
            : <p className="text-slate-500 italic text-sm">No signature uploaded</p>}
        </div>
        <p className="font-extrabold text-white text-lg tracking-wide">{report.area.chairmanName}</p>
      </div>

      {/* Fee Update Modal */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md grid place-items-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="card w-full max-w-2xl bg-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-slate-600 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Update Fees</h2>
                <p className="text-slate-400 text-sm mt-1">{editing.member.memberName} — Year {year}</p>
              </div>
              <button className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors" onClick={() => setEditing(null)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar flex-1">
              {MONTHS.map(m => (
                <div key={m} className={`border rounded-xl p-3 transition-colors ${editing.fee[m].paid ? 'border-brand-500/50 bg-brand-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-200 text-sm">{m}</span>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="sr-only peer" checked={editing.fee[m].paid}
                          onChange={e => setEditing({...editing, fee:{...editing.fee, [m]:{...editing.fee[m], paid:e.target.checked}}})}/>
                        <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </div>
                      <span className={editing.fee[m].paid ? 'text-brand-400' : 'text-slate-500'}>Paid</span>
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">Rs</span>
                    <input type="number" className="input pl-9 !py-2 bg-slate-800 border-slate-600 focus:bg-slate-900 text-sm" value={editing.fee[m].amount}
                      onChange={e => setEditing({...editing, fee:{...editing.fee, [m]:{...editing.fee[m], amount:Number(e.target.value)}}})}/>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-700/50">
              <button className="btn-secondary py-3 px-5 font-bold flex-1 sm:flex-none" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary py-3 px-6 sm:px-8 font-bold flex-1 sm:flex-none" onClick={saveFee}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md grid place-items-center z-50 p-4 animate-fade-in">
          <form onSubmit={addMember} className="card w-full max-w-md space-y-5 bg-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Add Member to {report.area.areaName}</h2>
              <button type="button" className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors" onClick={() => setShowAdd(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Ali Khan" value={newMember.memberName} onChange={e=>setNewMember({...newMember,memberName:e.target.value})} required/>
              </div>
              <div>
                <label className="label">Father's Name</label>
                <input className="input" placeholder="e.g. Ahmed Khan" value={newMember.fatherName} onChange={e=>setNewMember({...newMember,fatherName:e.target.value})} required/>
              </div>
            </div>

            <div className="bg-brand-500/10 text-brand-300 p-3 rounded-xl flex items-center gap-2 text-sm font-medium border border-brand-500/20 shadow-inner">
              <svg className="w-5 h-5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              A unique Member ID will be generated.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button type="button" className="btn-secondary py-3 px-5 font-bold flex-1 sm:flex-none" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn-primary py-3 px-6 sm:px-8 font-bold flex-1 sm:flex-none">Add Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
