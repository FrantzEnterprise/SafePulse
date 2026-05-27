import React, { useState } from 'react';
import SymptomEditor from './SymptomEditor';

const TABS = [
  { id:'branding', label:'Branding', icon:'🎨' },
  { id:'company', label:'Company', icon:'🏢' },
  { id:'service', label:'Service', icon:'📍' },
  { id:'features', label:'Features', icon:'⚙️' },
  { id:'qa', label:'Q&A', icon:'💡' },
  { id:'symptoms', label:'Symptoms', icon:'🩺' },
  { id:'integrations', label:'Integrations', icon:'🔌' },
  { id:'export', label:'Export', icon:'📦' },
];

const INP = 'w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#d4a843] focus:outline-none';

function LabelledInput({ label, value, onChange, placeholder, type, step, inputCls }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input className={(inputCls||INP)+' mt-1.5'} type={type||'text'} step={step} placeholder={placeholder}
        value={value} onChange={onChange} />
    </div>
  );
}

export default function AdminPanel({ config, updateConfig, onClose }) {
  const [tab, setTab] = useState('branding');
  const [cfg, setCfg] = useState(() => JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const setVal = (section, key, val) => {
    setCfg(prev => {
      const n = {...prev};
      if (section === 'root') n[key] = val;
      else if (section === 'branding') n.branding = {...n.branding, [key]: val};
      else if (section === 'company') n.company = {...n.company, [key]: val};
      else if (section === 'serviceArea') n.serviceArea = {...n.serviceArea, [key]: val};
      else if (section === 'features') n.features = {...n.features, [key]: val};
      else if (section === 'twilio') n.twilio = {...(n.twilio||{}), [key]: val};
      else if (section === 'smtp') n.smtp = {...(n.smtp||{}), [key]: val};
      else if (section === 'emailjs') n.emailjs = {...(n.emailjs||{}), [key]: val};
      else n[key] = val;
      return n;
    });
    setSaved(false);
  };

  const handleSave = () => {
    updateConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dl = (name, data) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importSymptoms = () => {
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='.json';
    inp.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      new Response(f).json().then(data => {
        if(Array.isArray(data) && data[0]?.category && data[0]?.symptoms) {
          localStorage.setItem('safepulse_symptoms', JSON.stringify(data));
          window.__safepulseSymptomGroups = data;
          window.location.reload();
        } else alert('Invalid format');
      }).catch(err => alert('Parse error: '+err.message));
    };
    inp.click();
  };

  const resetSymptoms = () => {
    if(confirm('Reset all symptoms to defaults?')) {
      localStorage.removeItem('safepulse_symptoms');
      window.location.reload();
    }
  };

  const groups = window.__safepulseSymptomGroups || [];
  const symptomCount = groups.flatMap(g=>g.symptoms).length;

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',flexDirection:'column',background:'#0f172a',color:'#fff',fontSize:'14px'}}>
      
      {/* HEADER */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,#1a3a5c,#0f2440)',padding:'10px 14px 10px 14px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
          <span style={{fontSize:20,flexShrink:0}}>⚙️</span>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700,fontSize:15,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:'#fff'}}>Admin Dashboard</div>
            <div style={{fontSize:10,color:'#d4a843',fontWeight:600}}>SafeTriage</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          {saved && <span style={{fontSize:10,color:'#86efac',fontWeight:600}}>✓ Saved</span>}
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600}}>✕</button>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{display:'flex',gap:1,background:'#334155',flexShrink:0,overflowX:'auto'}}>
        {[
          {label:'Symptoms',value:symptomCount,icon:'🩺'},
          {label:'Categories',value:groups.length,icon:'📂'},
          {label:'Radius',value:(cfg.serviceArea?.maxRadiusMiles||0)+'mi',icon:'📍'},
        ].map((s,i) => (
          <div key={i} style={{flex:'1',minWidth:0,display:'flex',alignItems:'center',gap:8,background:'#1e293b',padding:'8px 10px'}}>
            <div style={{width:28,height:28,borderRadius:6,background:'rgba(212,168,67,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{s.icon}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:16,fontWeight:700,lineHeight:'1.2'}}>{s.value}</div>
              <div style={{fontSize:9,color:'#94a3b8',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS - swipeable row */}
      <div style={{display:'flex',gap:4,padding:'8px 8px 0 8px',overflowX:'auto',flexShrink:0,WebkitOverflowScrolling:'touch',scrollbarWidth:'thin'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              flexShrink:0,
              display:'flex',alignItems:'center',gap:4,
              padding:'6px 10px',
              borderRadius:8,
              border:'none',
              fontSize:12,
              fontWeight:600,
              whiteSpace:'nowrap',
              cursor:'pointer',
              background: tab===t.id ? '#1a3a5c' : '#334155',
              color: tab===t.id ? '#d4a843' : '#cbd5e1',
              transition:'0.2s',
            }}>
            <span style={{fontSize:14}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',padding:'8px',overscrollBehavior:'contain'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>

          {tab==='branding' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {label:'Primary',key:'primaryColor'},
                  {label:'Header BG',key:'headerBg'},
                  {label:'Header Text',key:'headerText'},
                  {label:'Accent',key:'accentColor'},
                  {label:'Accent Hover',key:'accentHover'},
                  {label:'Body Text',key:'bodyTextColor'},
                ].map(item => (
                  <div key={item.key} style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:10}}>
                    <label style={{fontSize:10,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em'}}>{item.label}</label>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                      <input type="color" value={cfg.branding[item.key]||'#000000'}
                        onChange={e=>setVal('branding',item.key,e.target.value)}
                        style={{width:36,height:28,borderRadius:4,border:'none',cursor:'pointer',flexShrink:0}} />
                      <input className={INP} value={cfg.branding[item.key]||''}
                        onChange={e=>setVal('branding',item.key,e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
                <LabelledInput label="Font Family" value={cfg.branding.fontFamily||''} onChange={e=>setVal('branding','fontFamily',e.target.value)} />
                <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:10,display:'flex',alignItems:'end',gap:6}}>
                  {['primaryColor','accentColor','headerBg'].map(k => (
                    <div key={k} style={{width:36,height:28,borderRadius:4,border:'1px solid #475569',background:cfg.branding[k]||'#000'}} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab==='company' && (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {/* Basic Info Grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {label:'Company Name', key:'name', section:'company'},
                  {label:'Tagline', key:'tagline', section:'root'},
                  {label:'Phone', key:'phone', section:'company'},
                  {label:'Email', key:'email', section:'company'},
                  {label:'Address', key:'address', section:'company'},
                  {label:'Logo URL', key:'logoUrl', section:'company'},
                ].map(item => (
                  <LabelledInput key={item.key} label={item.label}
                    value={item.section==='root' ? (cfg[item.key]||'') : (cfg.company?.[item.key]||'')}
                    onChange={e=>setVal(item.section,item.key,e.target.value)} />
                ))}
              </div>

              {/* Company Type Toggle */}
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:12}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:8}}>🏢 Company Type</div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>setVal('company','companyType','sole')}
                    style={{flex:1,padding:'10px',border:cfg.company?.companyType==='sole'?'2px solid #d4a843':'1px solid #475569',borderRadius:8,background:cfg.company?.companyType==='sole'?'#1a3a5c':'transparent',color:cfg.company?.companyType==='sole'?'#d4a843':'#94a3b8',cursor:'pointer',fontWeight:600,fontSize:12}}>
                    👤 Sole Proprietor
                  </button>
                  <button onClick={()=>setVal('company','companyType','multi')}
                    style={{flex:1,padding:'10px',border:cfg.company?.companyType==='multi'?'2px solid #d4a843':'1px solid #475569',borderRadius:8,background:cfg.company?.companyType==='multi'?'#1a3a5c':'transparent',color:cfg.company?.companyType==='multi'?'#d4a843':'#94a3b8',cursor:'pointer',fontWeight:600,fontSize:12}}>
                    👥 Multi-Tech Company
                  </button>
                </div>
              </div>

              {/* Tech List (only shown in Multi-Tech mode) */}
              {cfg.company?.companyType === 'multi' && (
                <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:12}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:13}}>👨‍🔧 Technicians</div>
                    <button onClick={() => {
                      const techs = [...(cfg.company?.technicians||[]), {name:'',phone:'',email:''}];
                      setCfg(p => ({...p, company: {...p.company, technicians: techs}}));
                      setSaved(false);
                    }} style={{background:'#d4a843',color:'#1a3a5c',border:'none',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontWeight:700,fontSize:11}}>+ Add Tech</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {(cfg.company?.technicians||[]).map((tech,i) => (
                      <div key={i} style={{borderRadius:6,border:'1px solid #475569',padding:8}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                          <input className={INP} type="text" placeholder="Name" value={tech.name} onChange={e => {
                            const t = [...(cfg.company?.technicians||[])]; t[i] = {...t[i], name: e.target.value};
                            setCfg(p => ({...p, company: {...p.company, technicians: t}}));
                          }} />
                          <input className={INP} type="text" placeholder="Phone" value={tech.phone} onChange={e => {
                            const t = [...(cfg.company?.technicians||[])]; t[i] = {...t[i], phone: e.target.value};
                            setCfg(p => ({...p, company: {...p.company, technicians: t}}));
                          }} />
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:4,marginTop:4}}>
                          <input className={INP} type="email" placeholder="Email (optional)" value={tech.email} onChange={e => {
                            const t = [...(cfg.company?.technicians||[])]; t[i] = {...t[i], email: e.target.value};
                            setCfg(p => ({...p, company: {...p.company, technicians: t}}));
                          }} />
                          <button onClick={() => {
                            const t = (cfg.company?.technicians||[]).filter((_,j) => j !== i);
                            setCfg(p => ({...p, company: {...p.company, technicians: t}}));
                          }} style={{background:'transparent',border:'1px solid #7f1d1d',color:'#f87171',padding:'0 10px',borderRadius:6,cursor:'pointer',fontSize:14}}>✕</button>
                        </div>
                      </div>
                    ))}
                    {(cfg.company?.technicians||[]).length === 0 && (
                      <div style={{fontSize:11,color:'#64748b',textAlign:'center',padding:16}}>No technicians added yet. Tap "+ Add Tech" above.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==='service' && (
            <div>
              <div style={{marginBottom:8}}>
                <LabelledInput label="Shop Address" value={cfg.serviceArea?.shopAddress||''} onChange={e=>setVal('serviceArea','shopAddress',e.target.value)} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <LabelledInput label="Base Fee ($)" type="number" step="0.01" value={cfg.serviceArea?.baseFee} onChange={e=>setVal('serviceArea','baseFee',parseFloat(e.target.value)||0)} />
                <LabelledInput label="Miles Included" type="number" step="1" value={cfg.serviceArea?.baseMilesIncluded} onChange={e=>setVal('serviceArea','baseMilesIncluded',parseFloat(e.target.value)||0)} />
                <LabelledInput label="Per Extra Mile ($)" type="number" step="0.01" value={cfg.serviceArea?.perExtraMileRate} onChange={e=>setVal('serviceArea','perExtraMileRate',parseFloat(e.target.value)||0)} />
                <LabelledInput label="Max Radius (mi)" type="number" step="1" value={cfg.serviceArea?.maxRadiusMiles} onChange={e=>setVal('serviceArea','maxRadiusMiles',parseFloat(e.target.value)||0)} />
              </div>
            </div>
          )}

          {tab==='features' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {Object.entries(cfg.features).filter(([k])=>k!=='maxScoreBeforeLockout').map(([k,v]) => {
                const labels = {
                  showPhotoUpload: ['📸 Photo Upload','Customer can attach photos of the safe'],
                  showMapCalculator: ['🗺️ Map & Fee Calc','Distance & trip fee calculator'],
                  showBatteryPopup: ['🔋 Battery Popup','Battery warning popup for electronic locks'],
                  showTechnicianReport: ['📋 Tech Report','Generate & view technician report'],
                  showInstructions: ['📖 Instructions','Show instructions panel'],
                  showQaSection: ['❓ Q&A Section','Knowledge base Q&A section'],
                  showDarkModeToggle: ['🌙 Dark Mode Toggle','Switch between light/dark themes'],
                  showTriageHistory: ['📜 Triage History','Customer lookup & past triage log'],
                  showCopyReport: ['📋 Copy Report','One-tap copy report to clipboard'],
                  showPdfExport: ['📄 PDF Export','Download report as PDF'],
                  showDispatchEmail: ['📧 Email Dispatch','Send dispatch emails via EmailJS'],
                  showDispatchSms: ['📱 SMS Dispatch','Send dispatch SMS notifications'],
                  showCauseLibrary: ['📚 Cause Library','Admin editor for cause library'],
                  showTechStatus: ['🚚 Tech Status','Arrival/completion status tracking'],
                  showCustomerPortal: ['🔐 Customer Portal','Customer login to view past reports'],
                  showStripePayments: ['💳 Stripe Payments','Accept credit card payments online'],
                  showAccountingExport: ['📊 Accounting Export','QuickBooks/CSV export'],
                  showScheduling: ['📅 Scheduling','Calendar booking integration'],
                  showInventory: ['📦 Inventory','Track parts used per job'],
                  showAnalytics: ['📈 Analytics','Dashboard charts & metrics'],
                  showMultiLanguage: ['🌐 Multi-Language','Spanish & other language support'],
                  showInvoicing: ['🧾 Invoicing','Generate & send invoices to customers'],
                  showEstimates: ['📝 Estimates','Create & email service estimates'],
                  showReceipts: ['🧾 Receipts','Payment receipts for completed jobs'],
                  showLaborServices: ['🔧 Labor & Services','Labor categories with hourly rates'],
                  showPartsCatalog: ['🔩 Parts Catalog','Manage parts & pricing catalog'],
                  showUserRoles: ['👥 User Roles','Role-based access (admin, tech, dispatcher, customer)'],
                  showAuditLog: ['📋 Audit Log','Track all actions & changes in the system'],
                  showTaxCalculator: ['💰 Tax Calculator','Auto-calculate sales tax per location'],
                  showDiscountCoupons: ['🎫 Discounts & Coupons','Promo codes & discount management'],
                  showContractTemplates: ['📄 Contract Templates','Service agreement templates'],
                  showCustomerNotifications: ['🔔 Customer Notifications','Auto SMS/email status updates'],
                  showCommissionTracking: ['💵 Commission Tracking','Per-job tech commissions'],
                  showVehicleTracking: ['🚐 Vehicle Tracking','Tech vehicle assignment & tracking'],
                  showTimesheets: ['⏱️ Timesheets','Tech clock-in/out & hours tracking'],
                  showPurchaseOrders: ['📋 Purchase Orders','PO management for supplies'],
                  showVendorDirectory: ['🏪 Vendor Directory','Supply vendor contact management'],
                  showEquipmentChecklist: ['✅ Equip Checklist','Pre-job equipment checklist for techs'],
                  showCertificationTracking: ['🎓 Certifications','Tech license & cert expiration tracking'],
                  showLeadSourceTracking: ['📊 Lead Sources','Where leads come from (referral, web, call)'],
                  showMarketingEmails: ['📧 Marketing Emails','Campaign email blasts to customer list'],
                  showReviewRequests: ['⭐ Review Requests','Auto-request Google/Yelp reviews'],
                  showLoyaltyProgram: ['💎 Loyalty Program','Points & rewards for repeat customers'],
                  showIntegrations: ['🔌 Integrations','API keys & third-party connections panel'],
                  showDemoMode: ['🏪 Demo Mode','Show mock business data for sales demos'],
                };
                const [title, desc] = labels[k] || [k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()).replace('Qa','Q&A'), ''];
                return (
                  <div key={k} style={{borderRadius:8,border:'1px solid #334155',background:v?'#1e293b':'#1a1f2e',padding:10,display:'flex',alignItems:'center',justifyContent:'space-between',opacity:v?1:0.55}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:v?'#fff':'#94a3b8'}}>
                        {title}
                      </div>
                      <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{desc}</div>
                    </div>
                    <label style={{position:'relative',display:'inline-block',cursor:'pointer',flexShrink:0,marginLeft:8}}>
                      <input type="checkbox" style={{display:'none'}} checked={v}
                        onChange={e=>{const n={...cfg};n.features={...n.features,[k]:e.target.checked};setCfg(n);setSaved(false);}} />
                      <div style={{width:36,height:20,borderRadius:99,background:v?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
                        <div style={{position:'absolute',top:2,left:v?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {tab==='qa' && (
            <div>
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:10,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>🔗 Knowledge Base Button</div>
                  <div style={{fontSize:9,color:'#94a3b8'}}>Show KB link in header</div>
                </div>
                <label style={{position:'relative',display:'inline-block',cursor:'pointer'}}>
                  <input type="checkbox" style={{display:'none'}} checked={cfg.features?.showQaSection||false}
                    onChange={e=>{const n={...cfg};n.features={...n.features,showQaSection:e.target.checked};setCfg(n);setSaved(false);}} />
                  <div style={{width:36,height:20,borderRadius:99,background:(cfg.features?.showQaSection)?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
                    <div style={{position:'absolute',top:2,left:(cfg.features?.showQaSection)?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
                  </div>
                </label>
              </div>
              <LabelledInput label="KB URL" placeholder="https://..." value={cfg.qaUrl||''} onChange={e=>setVal('root','qaUrl',e.target.value)} />
            </div>
          )}

          {tab==='symptoms' && (
            <div>
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:10,marginBottom:8}}>
                <div style={{fontWeight:600,fontSize:13}}>🩺 Symptom Manager</div>
                <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>Edit, import, export, or reset symptoms</div>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                <button onClick={()=>setShowEditor(true)}
                  style={{background:'#1a3a5c',color:'#d4a843',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12}}>✏️ Open Editor</button>
                <button onClick={importSymptoms}
                  style={{background:'transparent',color:'#94a3b8',border:'1px solid #475569',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:12}}>📥 Import</button>
                <button onClick={()=>dl('safetriage-symptoms.json',window.__safepulseSymptomGroups||[])}
                  style={{background:'transparent',color:'#94a3b8',border:'1px solid #475569',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:12}}>📤 Export</button>
                <button onClick={resetSymptoms}
                  style={{background:'transparent',color:'#f87171',border:'1px solid #7f1d1d',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:12}}>↺ Reset</button>
              </div>
            </div>
          )}

          {tab==='integrations' && (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {/* Google Maps */}
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:12}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span style={{fontSize:18}}>🗺️</span>
                  <div style={{fontWeight:600,fontSize:13}}>Google Maps API Key</div>
                </div>
                <div style={{fontSize:9,color:'#94a3b8',marginBottom:8}}>Required for address autocomplete &amp; distance calculation</div>
                <div style={{position:'relative'}}>
                  <input className={INP+' !pr-16'} type={showKey?'text':'password'} placeholder="AIzaSy..." value={cfg.googleMapsApiKey||''} onChange={e=>setVal('root','googleMapsApiKey',e.target.value)} />
                  <button onClick={()=>setShowKey(v=>!v)} style={{position:'absolute',right:4,top:4,background:'transparent',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:10,padding:'4px 8px'}}>{showKey?'Hide':'Show'}</button>
                </div>
                <div style={{marginTop:6}}>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" style={{color:'#60a5fa',fontSize:10,textDecoration:'underline'}}>Get a key →</a>
                </div>
              </div>

              {/* Twilio SMS */}
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:12}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span style={{fontSize:18}}>💬</span>
                  <div style={{fontWeight:600,fontSize:13}}>Twilio SMS</div>
                </div>
                <div style={{fontSize:9,color:'#94a3b8',marginBottom:8}}>Send automated SMS notifications to customers</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Account SID</label>
                    <input className={INP} type="text" placeholder="AC..." value={cfg.twilio?.accountSid||''} onChange={e=>setVal('twilio','accountSid',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Auth Token</label>
                    <input className={INP} type="password" placeholder="***" value={cfg.twilio?.authToken||''} onChange={e=>setVal('twilio','authToken',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>From Number</label>
                    <input className={INP} type="text" placeholder="+1234567890" value={cfg.twilio?.fromNumber||''} onChange={e=>setVal('twilio','fromNumber',e.target.value)} />
                  </div>
                </div>
              </div>

              {/* SMTP Email */}
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:12}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span style={{fontSize:18}}>📧</span>
                  <div style={{fontWeight:600,fontSize:13}}>SMTP Email</div>
                </div>
                <div style={{fontSize:9,color:'#94a3b8',marginBottom:8}}>Send reports via email (SendGrid, Gmail SMTP, etc.)</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>SMTP Host</label>
                    <input className={INP} type="text" placeholder="smtp.sendgrid.net" value={cfg.smtp?.host||''} onChange={e=>setVal('smtp','host',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Port</label>
                    <input className={INP} type="number" placeholder="587" value={cfg.smtp?.port||587} onChange={e=>setVal('smtp','port',parseInt(e.target.value,10)||587)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Username</label>
                    <input className={INP} type="text" placeholder="apikey" value={cfg.smtp?.user||''} onChange={e=>setVal('smtp','user',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Password</label>
                    <input className={INP} type="password" placeholder="***" value={cfg.smtp?.pass||''} onChange={e=>setVal('smtp','pass',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>From Email</label>
                    <input className={INP} type="email" placeholder="you@example.com" value={cfg.smtp?.fromEmail||''} onChange={e=>setVal('smtp','fromEmail',e.target.value)} />
                  </div>
                </div>
              </div>

              {/* EmailJS */}
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:12}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span style={{fontSize:18}}>✉️</span>
                  <div style={{fontWeight:600,fontSize:13}}>EmailJS (Auto-Responder)</div>
                </div>
                <div style={{fontSize:9,color:'#94a3b8',marginBottom:8}}>Send confirmation emails &amp; tech reports without a backend server</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Public Key</label>
                    <input className={INP} type="text" placeholder="user_..." value={cfg.emailjs?.publicKey||''} onChange={e=>setVal('emailjs','publicKey',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Service ID</label>
                    <input className={INP} type="text" placeholder="service_..." value={cfg.emailjs?.serviceId||''} onChange={e=>setVal('emailjs','serviceId',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Template ID (Customer Confirmation)</label>
                    <input className={INP} type="text" placeholder="template_..." value={cfg.emailjs?.templateIdConfirm||''} onChange={e=>setVal('emailjs','templateIdConfirm',e.target.value)} />
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#94a3b8',display:'block',marginBottom:2}}>Template ID (Tech Report)</label>
                    <input className={INP} type="text" placeholder="template_..." value={cfg.emailjs?.templateIdReport||''} onChange={e=>setVal('emailjs','templateIdReport',e.target.value)} />
                  </div>
                </div>
                <div style={{marginTop:6}}>
                  <a href="https://dashboard.emailjs.com/sign-up" target="_blank" rel="noopener" style={{color:'#60a5fa',fontSize:10,textDecoration:'underline'}}>Sign up for free →</a>
                </div>
              </div>
            </div>
          )}

          {tab==='export' && (
            <div>
              <div style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:10,marginBottom:8}}>
                <div style={{fontWeight:600,fontSize:13}}>📦 Export Data</div>
                <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>Download config and symptom files</div>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                <button onClick={()=>dl('safetriage-config.json',cfg)}
                  style={{background:'#1a3a5c',color:'#d4a843',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12}}>⚙️ Download Config</button>
                <button onClick={()=>dl('safetriage-symptoms.json',window.__safepulseSymptomGroups||[])}
                  style={{background:'transparent',color:'#94a3b8',border:'1px solid #475569',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:12}}>🩺 Download Symptoms</button>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4,paddingBottom:12}}>
            <div style={{fontSize:9,color:'#64748b'}}>v0.9.16</div>
            <button onClick={handleSave}
              style={{background:'#d4a843',color:'#1a3a5c',border:'none',padding:'8px 24px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13}}>💾 Save</button>
          </div>

        </div>
      </div>

      {showEditor && <SymptomEditor onClose={()=>setShowEditor(false)} />}
    </div>
  );
}
