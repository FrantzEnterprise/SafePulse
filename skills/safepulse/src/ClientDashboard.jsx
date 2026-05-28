import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'safetriage_clients';

const TIERS = [
  { id: 'free',     label: 'Tier 1 — Core (Free)',          monthly: 0,    color: '#50fa7b' },
  { id: 'growth',   label: 'Tier 2 — Growth ($29/mo)',       monthly: 29,   color: '#8be9fd' },
  { id: 'pro',      label: 'Tier 3 — Pro ($59/mo)',          monthly: 59,   color: '#ffb86c' },
  { id: 'allinone', label: 'Tier 4 — All-in-One ($99/mo)',   monthly: 99,   color: '#ff5555' },
];

const EXTRAS = [
  { key: 'showSocialComposer',    label: '📱 Social Media Post Composer',    price: 10 },
  { key: 'showTestimonialsGallery', label: '🎬 Video Testimonials Gallery', price: 10 },
];

const ALL_FEATURES_BY_TIER = {
  free: [
    ['showPhotoUpload', '📸 Photo Upload'],
    ['showMapCalculator', '🗺️ Map & Fee Calc'],
    ['showBatteryPopup', '🔋 Battery Popup'],
    ['serviceNotesToggle', '📝 Service Notes'],
    ['showTechnicianReport', '📋 Tech Report'],
    ['showInstructions', '📖 Instructions'],
    ['showDarkModeToggle', '🌙 Dark Mode'],
    ['showQaSection', '❓ Q&A Section'],
    ['showTriageHistory', '📜 Triage History'],
    ['showCopyReport', '📋 Copy Report'],
    ['showPdfExport', '📄 PDF Export'],
    ['showCauseLibrary', '📚 Cause Library'],
    ['showTechStatus', '🚚 Tech Status'],
    ['showDispatchEmail', '📧 Email Dispatch'],
    ['showDispatchSms', '📱 SMS Dispatch'],
    ['showReviewRequests', '⭐ Review Requests'],
  ],
  growth: [
    ['showEstimates', '📝 Estimates'],
    ['showInvoicing', '🧾 Invoicing'],
    ['showReceipts', '🧾 Receipts'],
    ['showCustomerPortal', '🔐 Customer Portal'],
    ['showScheduling', '📅 Scheduling'],
    ['showLeadSourceTracking', '📊 Lead Sources'],
    ['showLaborServices', '🔧 Labor & Services'],
    ['showPartsCatalog', '🔩 Parts Catalog'],
    ['showContractTemplates', '📄 Contract Templates'],
    ['showCustomerNotifications', '🔔 Customer Notifications'],
  ],
  pro: [
    ['showStripePayments', '💳 Stripe Payments'],
    ['showAccountingExport', '📊 Accounting Export'],
    ['showInventory', '📦 Inventory'],
    ['showAnalytics', '📈 Analytics'],
    ['showUserRoles', '👥 User Roles'],
    ['showAuditLog', '📋 Audit Log'],
    ['showTaxCalculator', '💰 Tax Calculator'],
    ['showDiscountCoupons', '🎫 Discounts & Coupons'],
    ['showCommissionTracking', '💵 Commission Tracking'],
    ['showVehicleTracking', '🚐 Vehicle Tracking'],
    ['showTimesheets', '⏱️ Timesheets'],
    ['showPurchaseOrders', '📋 Purchase Orders'],
    ['showVendorDirectory', '🏪 Vendor Directory'],
    ['showEquipmentChecklist', '✅ Equip Checklist'],
    ['showCertificationTracking', '🎓 Certifications'],
    ['showLeadSourceTracking', '📊 Lead Sources'],
  ],
  allinone: [
    ['showMarketingEmails', '📧 Marketing Emails'],
    ['showLoyaltyProgram', '💎 Loyalty Program'],
    ['showIntegrations', '🔌 Integrations'],
    ['showDemoMode', '🏪 Demo Mode'],
    ['showMultiLanguage', '🌐 Multi-Language'],
  ],
};

function generateId() {
  return 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

function defaultFeaturesForTier(tierId) {
  const f = {};
  Object.values(ALL_FEATURES_BY_TIER).flat().forEach(([k]) => { f[k] = false; });
  (ALL_FEATURES_BY_TIER[tierId] || []).forEach(([k]) => { f[k] = true; });
  // Extras always default false
  EXTRAS.forEach(e => { f[e.key] = false; });
  return f;
}

const inpBase = 'w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#d4a843] focus:outline-none';

export default function ClientDashboard({ config, onUpdateConfig }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setClients(JSON.parse(raw));
    } catch {}
  }, []);

  function saveClients(list) {
    setClients(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addClient() {
    const now = new Date().toISOString();
    const c = {
      id: generateId(),
      name: '',
      company: '',
      email: '',
      phone: '',
      tier: 'free',
      status: 'invited',
      extras: { showSocialComposer: false, showTestimonialsGallery: false },
      overrides: {},
      loginUser: '',
      loginPass: '',
      notes: '',
      currentMonthTotal: 0,
      createdAt: now,
      updatedAt: now,
    };
    setNewClient(c);
    setShowAdd(true);
  }

  function saveNew() {
    if (!newClient.name.trim()) return;
    newClient.features = defaultFeaturesForTier(newClient.tier);
    newClient.currentMonthTotal = calcTotal(newClient);
    newClient.updatedAt = new Date().toISOString();
    saveClients([...clients, { ...newClient }]);
    setShowAdd(false);
    setNewClient(null);
  }

  function updateClient(id, patch) {
    const list = clients.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch, updatedAt: new Date().toISOString() };
      updated.currentMonthTotal = calcTotal(updated);
      return updated;
    });
    saveClients(list);
    if (editingId === id) setEditingId(null);
  }

  function deleteClient(id) {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    saveClients(clients.filter(c => c.id !== id));
  }

  function calcTotal(client) {
    const tierT = TIERS.find(t => t.id === client.tier);
    let total = tierT ? tierT.monthly : 0;
    EXTRAS.forEach(e => { if (client.extras?.[e.key]) total += e.price; });
    return total;
  }

  function toggleFeature(clientId, featureKey, value) {
    const list = clients.map(c => {
      if (c.id !== clientId) return c;
      const overrides = { ...(c.overrides || {}), [featureKey]: value };
      return { ...c, overrides, updatedAt: new Date().toISOString() };
    });
    saveClients(list);
  }

  function toggleExtra(clientId, extraKey, value) {
    const list = clients.map(c => {
      if (c.id !== clientId) return c;
      const extras = { ...(c.extras || {}), [extraKey]: value };
      return { ...c, extras, updatedAt: new Date().toISOString(), currentMonthTotal: calcTotal({ ...c, extras }) };
    });
    saveClients(list);
  }

  function changeTier(clientId, newTierId) {
    const list = clients.map(c => {
      if (c.id !== clientId) return c;
      const features = defaultFeaturesForTier(newTierId);
      // Apply existing overrides
      Object.entries(c.overrides || {}).forEach(([k, v]) => { features[k] = v; });
      return { ...c, tier: newTierId, features, updatedAt: new Date().toISOString(), currentMonthTotal: calcTotal({ ...c, tier: newTierId }) };
    });
    saveClients(list);
  }

  function isFeatureEnabled(client, key) {
    if (client.overrides?.[key] !== undefined) return client.overrides[key];
    const tierFeatures = ALL_FEATURES_BY_TIER[client.tier];
    if (tierFeatures) {
      const match = tierFeatures.find(([k]) => k === key);
      if (match) return true;
    }
    return false;
  }

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => {
    switch(s) {
      case 'active': return '#50fa7b';
      case 'beta': return '#8be9fd';
      case 'trial': return '#ffb86c';
      case 'invited': return '#6272a4';
      case 'paused': return '#ff5555';
      case 'cancelled': return '#444';
      default: return '#6272a4';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{fontWeight:700,fontSize:18}}>🗂️ Client Dashboard</h3>
          <p style={{fontSize:11,color:'#94a3b8',marginTop:2}}>
            {clients.length} client{clients.length !== 1 ? 's' : ''} · Total MRR: ${clients.reduce((s,c) => s + (c.currentMonthTotal||0), 0).toFixed(0)}/mo
          </p>
        </div>
        <button onClick={addClient}
          style={{background:'#d4a843',color:'#0a1628',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          + Add Client
        </button>
      </div>

      {/* Search */}
      <input placeholder="🔍 Search clients by name, company, or email..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #2a3a5a',background:'#0f1f3d',color:'#e8edf5',fontSize:13,marginBottom:12}}
      />

      {/* Add Client Modal */}
      {showAdd && newClient && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
          onClick={e => e.target === e.currentTarget && !confirm('Discard new client?') ? null : setShowAdd(false)}>
          <div style={{background:'#0f1f3d',border:'1px solid #d4a843',borderRadius:16,padding:24,maxWidth:500,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            <h4 style={{fontWeight:700,fontSize:16,marginBottom:16,color:'#d4a843'}}>➕ New Client</h4>

            <label style={{fontSize:11,color:'#94a3b8'}}>Client Name *</label>
            <input className={inpBase} value={newClient.name} onChange={e => setNewClient({...newClient,name:e.target.value})} placeholder="Full name" />

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Company</label>
            <input className={inpBase} value={newClient.company} onChange={e => setNewClient({...newClient,company:e.target.value})} placeholder="Company name" />

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Email</label>
            <input className={inpBase} value={newClient.email} onChange={e => setNewClient({...newClient,email:e.target.value})} placeholder="client@example.com" />

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Phone</label>
            <input className={inpBase} value={newClient.phone} onChange={e => setNewClient({...newClient,phone:e.target.value})} placeholder="(916) 555-1234" />

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Package</label>
            <select className={inpBase} value={newClient.tier} onChange={e => setNewClient({...newClient,tier:e.target.value})}>
              {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Status</label>
            <select className={inpBase} value={newClient.status} onChange={e => setNewClient({...newClient,status:e.target.value})}>
              <option value="invited">📩 Invited</option>
              <option value="beta">🧪 Beta Tester</option>
              <option value="trial">📅 Trial</option>
              <option value="active">✅ Active</option>
              <option value="paused">⏸️ Paused</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Login Username</label>
            <input className={inpBase} value={newClient.loginUser} onChange={e => setNewClient({...newClient,loginUser:e.target.value})} placeholder="username" />

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Login Password</label>
            <input className={inpBase} value={newClient.loginPass} onChange={e => setNewClient({...newClient,loginPass:e.target.value})} placeholder="password" />

            <label style={{fontSize:11,color:'#94a3b8',marginTop:10,display:'block'}}>Notes</label>
            <textarea className={inpBase} value={newClient.notes} onChange={e => setNewClient({...newClient,notes:e.target.value})} placeholder="Internal notes" rows={2} />

            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button onClick={saveNew}
                style={{flex:1,background:'#d4a843',color:'#0a1628',border:'none',borderRadius:8,padding:'10px',fontWeight:700,cursor:'pointer'}}>
                ✅ Save Client
              </button>
              <button onClick={() => { setShowAdd(false); setNewClient(null); }}
                style={{flex:1,background:'#475569',color:'#fff',border:'none',borderRadius:8,padding:'10px',fontWeight:600,cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Cards */}
      {filtered.length === 0 && (
        <div style={{textAlign:'center',padding:40,color:'#6272a4',fontSize:14}}>
          {clients.length === 0 ? '👋 No clients yet. Click "+ Add Client" to get started.' : '🔍 No clients match your search.'}
        </div>
      )}

      {filtered.map(client => (
        <div key={client.id} style={{borderRadius:12,border:'1px solid #2a3a5a',background:'#0f1f3d',marginBottom:12,overflow:'hidden'}}>
          {/* Header bar */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#1a2a4a',borderBottom:'1px solid #2a3a5a'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
              <span style={{fontWeight:700,fontSize:14,color:'#e8edf5',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{client.name}</span>
              {client.company && <span style={{fontSize:11,color:'#94a3b8'}}>· {client.company}</span>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{
                display:'inline-block',padding:'2px 10px',borderRadius:99,fontSize:10,fontWeight:700,
                background: statusColor(client.status), color: client.status==='active'||client.status==='beta'?'#0a1628':'#fff'
              }}>
                {client.status}
              </span>
              <span style={{backgroundColor:TIERS.find(t=>t.id===client.tier)?.color||'#6272a4',
                color:'#0a1628',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99}}>
                {client.tier === 'free' ? 'Free' : `T${TIERS.findIndex(t=>t.id===client.tier)+1}`}
              </span>
              <span style={{fontSize:12,fontWeight:700,color:'#d4a843'}}>${client.currentMonthTotal||0}/mo</span>
              <span style={{color:'#6272a4',fontSize:10,cursor:'pointer'}} onClick={() => setEditingId(editingId === client.id ? null : client.id)}>
                {editingId === client.id ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {/* Expandable detail */}
          {editingId === client.id && (
            <div style={{padding:'12px 14px',maxHeight:400,overflowY:'auto',borderBottom:'1px solid #2a3a5a'}}>
              {/* Contact info */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                {[
                  ['📧', 'email'],
                  ['📞', 'phone'],
                  ['👤', 'loginUser'],
                  ['🔑', 'loginPass'],
                ].map(([icon, field]) => (
                  <div key={field} style={{flex:1,minWidth:100}}>
                    <div style={{fontSize:9,color:'#6272a4',textTransform:'uppercase'}}>{icon} {field.replace('loginU','User').replace('loginP','Pass')}</div>
                    <input className={inpBase} style={{marginTop:2}}
                      value={client[field]||''}
                      onChange={e => { const list = clients.map(c => c.id===client.id?{...c,[field]:e.target.value,updatedAt:new Date().toISOString()}:c); saveClients(list); }}
                    />
                  </div>
                ))}
              </div>

              {/* Package tier */}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:'#6272a4',marginBottom:2}}>📦 Package Tier</div>
                <select className={inpBase} value={client.tier} onChange={e => changeTier(client.id, e.target.value)}>
                  {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              {/* Extras */}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:'#ff79c6',marginBottom:4,fontWeight:600}}>🎯 Extras</div>
                {EXTRAS.map(e => (
                  <div key={e.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontSize:12}}>{e.label} <span style={{color:'#d4a843',fontWeight:600}}>(+${e.price}/mo)</span></span>
                    <label style={{position:'relative',display:'inline-block',width:36,height:20,cursor:'pointer'}}>
                      <input type="checkbox" style={{display:'none'}}
                        checked={client.extras?.[e.key]||false}
                        onChange={v => toggleExtra(client.id, e.key, v.target.checked)} />
                      <div style={{width:36,height:20,borderRadius:99,background:(client.extras?.[e.key])?'#ff79c6':'#475569',transition:'0.2s',position:'relative'}}>
                        <div style={{position:'absolute',top:2,left:(client.extras?.[e.key])?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Per-feature overrides */}
              <div>
                <div style={{fontSize:10,color:'#d4a843',marginBottom:4,fontWeight:600}}>⚙️ Feature Overrides</div>
                <div style={{fontSize:10,color:'#6272a4',marginBottom:6}}>Toggle any feature on/off regardless of tier — useful for beta testing individual features</div>
                <div style={{maxHeight:200,overflowY:'auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                  {Object.entries(ALL_FEATURES_BY_TIER).flatMap(([tierId, feats]) =>
                    feats.map(([key, label]) => (
                      <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'3px 6px',borderRadius:4,background:'rgba(255,255,255,0.02)'}}>
                        <span style={{fontSize:10,color:'#94a3b8'}}>{label}</span>
                        <label style={{position:'relative',display:'inline-block',width:28,height:16,cursor:'pointer'}}>
                          <input type="checkbox" style={{display:'none'}}
                            checked={isFeatureEnabled(client, key)}
                            onChange={v => toggleFeature(client.id, key, v.target.checked)} />
                          <div style={{width:28,height:16,borderRadius:99,background:isFeatureEnabled(client,key)?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
                            <div style={{position:'absolute',top:2,left:isFeatureEnabled(client,key)?14:2,width:12,height:12,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{display:'flex',gap:8,padding:'8px 14px',background:'#0a1628'}}>
            <button onClick={() => { if(editingId===client.id) setEditingId(null); else setEditingId(client.id); }}
              style={{flex:1,padding:'6px',borderRadius:6,border:'1px solid #2a3a5a',background:'transparent',color:'#94a3b8',fontSize:11,cursor:'pointer'}}>
              {editingId === client.id ? '🔼 Collapse' : '📝 Edit'}
            </button>
            <button
              onClick={() => {
                const s = { invited:'beta', beta:'trial', trial:'active', active:'paused', paused:'cancelled', cancelled:'invited' };
                const next = s[client.status] || 'active';
                updateClient(client.id, { status: next });
              }}
              style={{flex:1,padding:'6px',borderRadius:6,border:'1px solid #2a3a5a',background:'transparent',color:'#94a3b8',fontSize:11,cursor:'pointer'}}>
              ⏭️ Next Status
            </button>
            <button onClick={() => deleteClient(client.id)}
              style={{padding:'6px 12px',borderRadius:6,border:'1px solid #ff5555',background:'transparent',color:'#ff5555',fontSize:11,cursor:'pointer'}}>
              🗑️
            </button>
          </div>
        </div>
      ))}

      {/* Summary footer */}
      {clients.length > 0 && (
        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginTop:12,padding:'12px',borderRadius:8,border:'1px solid #2a3a5a',background:'#0f1f3d'}}>
          {[
            ['👥 Total', clients.length],
            ['🧪 Beta', clients.filter(c=>c.status==='beta').length],
            ['✅ Active', clients.filter(c=>c.status==='active').length],
            ['📅 Trial', clients.filter(c=>c.status==='trial').length],
            ['📩 Invited', clients.filter(c=>c.status==='invited').length],
            ['⏸️ Paused', clients.filter(c=>c.status==='paused').length],
            ['❌ Cancelled', clients.filter(c=>c.status==='cancelled').length],
            ['💰 MRR', `$${clients.reduce((s,c)=>s+(c.currentMonthTotal||0),0).toFixed(0)}`],
          ].map(([l, v]) => (
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:800,color:'#d4a843'}}>{v}</div>
              <div style={{fontSize:9,color:'#6272a4'}}>{l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
