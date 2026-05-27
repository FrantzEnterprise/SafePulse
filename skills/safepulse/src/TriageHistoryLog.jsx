import React, { useState, useEffect } from 'react';

export default function TriageHistoryLog({ config }) {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Load from localStorage — triage data is saved under 'sp_triage_history'
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sp_triage_history');
      if (raw) {
        const data = JSON.parse(raw);
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
  }, []);

  const filtered = entries
    .filter(e => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (e.name || '').toLowerCase().includes(q)
        || (e.phone || '').includes(q)
        || (e.brand || '').toLowerCase().includes(q)
        || (e.id || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? db - da : da - db;
    });

  const deleteEntry = (id) => {
    if (!confirm('Delete this triage entry?')) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('sp_triage_history', JSON.stringify(updated));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  const clearAll = () => {
    if (!confirm('Delete ALL triage history?')) return;
    setEntries([]);
    setSelectedEntry(null);
    localStorage.setItem('sp_triage_history', '[]');
  };

  const getRiskColor = (score) => {
    if (score >= 80) return '#ff5555';
    if (score >= 50) return '#ffb86c';
    return '#50fa7b';
  };

  const getStatusBadge = (entry) => {
    if (entry.status === 'completed') return { label: '✅ Completed', color: '#50fa7b' };
    if (entry.status === 'dispatched') return { label: '🚚 Dispatched', color: '#8be9fd' };
    if (entry.status === 'in-progress') return { label: '🔧 In Progress', color: '#ffb86c' };
    return { label: '📝 New', color: '#6272a4' };
  };

  // Save status changes
  const setStatus = (id, status) => {
    const updated = entries.map(e => e.id === id ? { ...e, status } : e);
    setEntries(updated);
    localStorage.setItem('sp_triage_history', JSON.stringify(updated));
    if (selectedEntry?.id === id) setSelectedEntry({ ...selectedEntry, status });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-1" style={{color:'#d4a843',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>
        📜 Triage History Log
      </h2>
      <p className="text-sm mb-4" style={{color:'#8899bb'}}>
        Monitor incoming leads and past triage entries. Search by name, phone, or brand.
      </p>

      {/* Search & Sort Bar */}
      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search name, phone, brand..."
          style={{flex:1,padding:'10px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'10px',color:'#e8edf5',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{padding:'10px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:'10px',color:'#e8edf5',fontSize:'13px',outline:'none'}}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span style={{padding:'4px 10px',background:'#1a2a4a',borderRadius:'8px',border:'1px solid #2a3a5a',color:'#94a3b8',fontSize:'12px'}}>
          📊 Total: <strong style={{color:'#e8edf5'}}>{entries.length}</strong>
        </span>
        <span style={{padding:'4px 10px',background:'#1a2a4a',borderRadius:'8px',border:'1px solid #2a3a5a',color:'#94a3b8',fontSize:'12px'}}>
          📝 New: <strong style={{color:'#6272a4'}}>{entries.filter(e => !e.status || e.status === 'new').length}</strong>
        </span>
        <span style={{padding:'4px 10px',background:'#1a2a4a',borderRadius:'8px',border:'1px solid #2a3a5a',color:'#94a3b8',fontSize:'12px'}}>
          🔧 Open: <strong style={{color:'#ffb86c'}}>{entries.filter(e => e.status === 'in-progress' || e.status === 'dispatched').length}</strong>
        </span>
        <button onClick={clearAll} style={{padding:'4px 10px',background:'transparent',border:'1px solid #ff5555',borderRadius:'8px',color:'#ff5555',fontSize:'11px',cursor:'pointer',marginLeft:'auto'}}>
          🗑️ Clear All
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{padding:'20px',textAlign:'center',background:'#1a2a4a',borderRadius:'12px',border:'1px solid #2a3a5a'}}>
          <p style={{color:'#6272a4',fontSize:'14px'}}>
            {search ? 'No entries match your search' : 'No triage history yet. Entries appear after running a triage and dispatching.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => {
            const badge = getStatusBadge(entry);
            return (
              <div key={entry.id} onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                style={{
                  padding:'10px 12px', background: selectedEntry?.id === entry.id ? '#1e2a4a' : '#1a2a4a',
                  border: selectedEntry?.id === entry.id ? '1px solid #d4a843' : '1px solid #2a3a5a',
                  borderRadius:'10px', cursor:'pointer', transition:'0.15s'
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span style={{fontWeight:700,color:'#e8edf5',fontSize:'14px'}}>{entry.name || 'Unknown'}</span>
                      {entry.phone && <span style={{color:'#6272a4',fontSize:'12px'}}>{entry.phone}</span>}
                      <span style={{fontSize:'10px',padding:'2px 6px',borderRadius:'4px',background:`${badge.color}20`,color:badge.color}}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs" style={{color:'#94a3b8'}}>
                      <span>🔒 {entry.brand || 'N/A'}</span>
                      <span>🎯 {entry.lockType || 'N/A'}</span>
                      {entry.symptoms && <span>🩺 {entry.symptoms.length} symptoms</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div style={{width:'60px',height:'6px',background:'#2a3a5a',borderRadius:'99px',overflow:'hidden'}}>
                        <div style={{width:`${entry.score || 0}%`,height:'100%',background:getRiskColor(entry.score || 0),borderRadius:'99px'}} />
                      </div>
                      <span style={{fontSize:'11px',fontWeight:700,color:getRiskColor(entry.score || 0)}}>
                        {entry.score || 0}/100
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{color:'#6272a4'}}>
                      {new Date(entry.createdAt || entry.id).toLocaleString()} {entry.dispatchType ? `· ${entry.dispatchType}` : ''}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                    style={{background:'none',border:'none',color:'#ff5555',cursor:'pointer',fontSize:'14px',padding:'2px'}}>
                    🗑️
                  </button>
                </div>

                {/* Expanded details */}
                {selectedEntry?.id === entry.id && (
                  <div style={{marginTop:'10px',paddingTop:'10px',borderTop:'1px solid #2a3a5a'}}>
                    {/* Status selector */}
                    <div className="mb-3">
                      <label className="text-xs font-semibold mb-1 block" style={{color:'#94a3b8'}}>Status:</label>
                      <div className="flex gap-1 flex-wrap">
                        {[
                          ['new', '📝 New'],
                          ['dispatched', '🚚 Dispatched'],
                          ['in-progress', '🔧 In Progress'],
                          ['completed', '✅ Completed']
                        ].map(([s, label]) => (
                          <button key={s} onClick={() => setStatus(entry.id, s)}
                            style={{
                              padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:600,
                              background: (entry.status || 'new') === s ? '#d4a843' : '#2a3a5a',
                              color: (entry.status || 'new') === s ? '#0a1628' : '#94a3b8',
                              border:'none', cursor:'pointer'
                            }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:'12px'}}>
                      <div><span style={{color:'#6272a4'}}>Safe Brand:</span> <span style={{color:'#e8edf5'}}>{entry.brand || 'N/A'}</span></div>
                      <div><span style={{color:'#6272a4'}}>Lock Type:</span> <span style={{color:'#e8edf5'}}>{entry.lockType || 'N/A'}</span></div>
                      <div><span style={{color:'#6272a4'}}>Safe Open:</span> <span style={{color:'#e8edf5'}}>{entry.safeOpen || 'N/A'}</span></div>
                      <div><span style={{color:'#6272a4'}}>Service Age:</span> <span style={{color:'#e8edf5'}}>{entry.serviceAge || 'N/A'}</span></div>
                      <div><span style={{color:'#6272a4'}}>Risk Score:</span> <span style={{color:getRiskColor(entry.score || 0),fontWeight:700}}>{entry.score || 0}/100</span></div>
                      <div><span style={{color:'#6272a4'}}>Dispatch:</span> <span style={{color:'#e8edf5'}}>{entry.dispatchType || 'N/A'}</span></div>
                    </div>

                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <div className="mt-2">
                        <span style={{color:'#6272a4',fontSize:'12px'}}>Symptoms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.symptoms.map((s, i) => (
                            <span key={i} style={{padding:'2px 8px',background:'#2a3a5a',borderRadius:'6px',color:'#c8d0dc',fontSize:'11px'}}>
                              {typeof s === 'string' ? s : s.label || s.id || 'Unknown'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.tried && (
                      <div className="mt-2">
                        <span style={{color:'#6272a4',fontSize:'12px'}}>What customer tried:</span>
                        <p style={{color:'#c8d0dc',fontSize:'12px',marginTop:'2px'}}>{entry.tried}</p>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="mt-2">
                        <span style={{color:'#6272a4',fontSize:'12px'}}>Technician notes:</span>
                        <p style={{color:'#c8d0dc',fontSize:'12px',marginTop:'2px',fontStyle:'italic'}}>"{entry.notes}"</p>
                      </div>
                    )}

                    <div className="mt-2">
                      <span style={{color:'#6272a4',fontSize:'12px'}}>Customer Contact:</span>
                      <div className="flex gap-2 mt-1">
                        {entry.phone && (
                          <a href={`tel:${entry.phone}`} style={{padding:'4px 10px',background:'#2a3a5a',borderRadius:'6px',color:'#8be9fd',textDecoration:'none',fontSize:'12px'}}>
                            📞 Call
                          </a>
                        )}
                        {entry.phone && (
                          <a href={`sms:${entry.phone}`} style={{padding:'4px 10px',background:'#2a3a5a',borderRadius:'6px',color:'#50fa7b',textDecoration:'none',fontSize:'12px'}}>
                            💬 Text
                          </a>
                        )}
                        {entry.email && (
                          <a href={`mailto:${entry.email}`} style={{padding:'4px 10px',background:'#2a3a5a',borderRadius:'6px',color:'#ffb86c',textDecoration:'none',fontSize:'12px'}}>
                            📧 Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
