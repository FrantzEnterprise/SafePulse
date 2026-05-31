import React, { useState } from 'react';
import SymptomEditor from './SymptomEditor';
import SocialComposer from './SocialComposer';
import TestimonialGallery from './TestimonialGallery';
import TriageHistoryLog from './TriageHistoryLog';
import ClientDashboard from './ClientDashboard';

const TABS = [
  { id:'branding', label:'Branding', icon:'🎨' },
  { id:'company', label:'Company', icon:'🏢' },
  { id:'service', label:'Service', icon:'📍' },
  { id:'features', label:'Features', icon:'⚙️' },
  { id:'social', label:'Social', icon:'📢' },
  { id:'testimonials', label:'Testimonials', icon:'🎬' },
  { id:'triagelog', label:'Triage Log', icon:'📜' },
  { id:'dashboard', label:'Clients', icon:'🗂️' },
  { id:'qa', label:'Q&A', icon:'💡' },
  { id:'ads', label:'Ads', icon:'📢' },
  { id:'reviews', label:'Reviews', icon:'⭐' },
  { id:'symptoms', label:'Symptoms', icon:'🩺' },
  { id:'integrations', label:'Integrations', icon:'🔌' },
  { id:'billing', label:'Billing', icon:'💵' },
  { id:'labor', label:'Labor & Services', icon:'🔧' },
  { id:'parts', label:'Parts Catalog', icon:'🔩' },
  { id:'inventory', label:'Inventory', icon:'📦' },
  { id:'roles', label:'User Roles', icon:'👥' },
  { id:'portal', label:'Customer Portal', icon:'🔐' },
  { id:'scheduling', label:'Scheduling', icon:'📅' },
  { id:'contracts', label:'Contracts', icon:'📄' },
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

export default function AdminPanel({ config, updateConfig, updateDeep, onClose }) {
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
                  {label:'Service Notes', key:'serviceNotes', section:'root'},
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
                <LabelledInput label="Base Fee ($)" type="number" step="0.01" value={cfg.serviceArea?.baseFee} onChange={e=>setVal('serviceArea','baseFee',e.target.value===''?'':parseFloat(e.target.value)||0)} />
                <LabelledInput label="Miles Included" type="number" step="1" value={cfg.serviceArea?.baseMilesIncluded} onChange={e=>setVal('serviceArea','baseMilesIncluded',parseFloat(e.target.value)||0)} />
                <LabelledInput label="Per Extra Mile ($)" type="number" step="0.01" value={cfg.serviceArea?.perExtraMileRate} onChange={e=>setVal('serviceArea','perExtraMileRate',parseFloat(e.target.value)||0)} />
                <LabelledInput label="Max Radius (mi)" type="number" step="1" value={cfg.serviceArea?.maxRadiusMiles} onChange={e=>setVal('serviceArea','maxRadiusMiles',parseFloat(e.target.value)||0)} />
              </div>
            </div>
          )}

          {tab==='features' && (
            <FeaturesPanel cfg={cfg} setCfg={setCfg} setSaved={setSaved} />
          )}

          {tab==='social' && (
            <SocialComposer config={config} />
          )}
          {tab==='testimonials' && (
            <TestimonialGallery config={config} />
          )}
          {tab==='dashboard' && (
            <ClientDashboard config={config} onUpdateConfig={updateConfig} />
          )}
          {tab==='triagelog' && (
            <TriageHistoryLog config={config} />
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

          {tab==='ads' && (
            <AdManager config={cfg} setCfg={setCfg} setSaved={setSaved} />
          )}

          {tab==='reviews' && (
            <ReviewManager config={cfg} setCfg={setCfg} setSaved={setSaved} />
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

/* ──────── Ad Manager ──────── */
/* ──────── Review Manager ──────── */
function ReviewManager({ config, setCfg, setSaved }) {
  const cfg = config || {};
  const [links, setLinks] = useState(() => Array.isArray(cfg.reviewLinks) ? [...cfg.reviewLinks] : []);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('⭐');

  const saveLinks = (updated) => {
    setLinks(updated);
    const n = { ...cfg };
    n.reviewLinks = updated;
    setCfg(n);
    setSaved(false);
  };

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const updated = [...links, { label: newLabel.trim(), icon: newIcon, url: newUrl.trim(), active: true }];
    saveLinks(updated);
    setNewLabel(''); setNewUrl(''); setNewIcon('⭐');
  };

  const removeLink = (idx) => {
    const updated = links.filter((_, i) => i !== idx);
    saveLinks(updated);
  };

  const toggleLink = (idx) => {
    const updated = links.map((l, i) => i === idx ? { ...l, active: !l.active } : l);
    saveLinks(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-bold text-slate-300">⭐ Review Site Links</h3>
      <p className="text-xs text-slate-500">These links appear in the "Leave A Review" popup when a customer taps "Advice Helped?"</p>

      {/* Existing links */}
      <div className="space-y-2">
        {links.map((l, idx) => (
          <div key={idx} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',background:'#1a2a4a',borderRadius:'8px',border:'1px solid #2a3a5a'}}>
            <span style={{cursor:'pointer',fontSize:'16px'}} onClick={() => toggleLink(idx)}>
              {l.active !== false ? '🟢' : '⚪'}
            </span>
            <span style={{fontSize:'16px'}}>{l.icon || '⭐'}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'12px',fontWeight:600,color:'#e8edf5'}}>{l.label}</div>
              <div style={{fontSize:'10px',color:'#6272a4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.url}</div>
            </div>
            <button onClick={() => removeLink(idx)} style={{background:'transparent',border:'none',color:'#ff5555',cursor:'pointer',fontSize:'16px'}}>🗑</button>
          </div>
        ))}
        {links.length === 0 && (
          <p style={{color:'#6272a4',fontSize:'12px',textAlign:'center',padding:'12px'}}>No review links yet. Add your Google, Yelp, Facebook review URLs below.</p>
        )}
      </div>

      {/* Add new link */}
      <div style={{padding:'12px',background:'#1a2a4a',borderRadius:'8px',border:'1px solid #2a3a5a'}}>
        <h4 className="text-xs font-bold text-slate-400 mb-2">Add Review Site</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="emoji" maxLength="2"
              style={{width:50,padding:'6px',background:'#0f1f3d',border:'1px solid #2a3a5a',borderRadius:'6px',color:'#e8edf5',fontSize:'12px',textAlign:'center'}} />
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Site name (e.g. Google)"
              style={{flex:1,padding:'6px',background:'#0f1f3d',border:'1px solid #2a3a5a',borderRadius:'6px',color:'#e8edf5',fontSize:'12px'}} />
          </div>
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Review URL"
            style={{width:'100%',padding:'6px',background:'#0f1f3d',border:'1px solid #2a3a5a',borderRadius:'6px',color:'#e8edf5',fontSize:'12px',boxSizing:'border-box'}} />
          <button onClick={addLink} style={{width:'100%',padding:'8px',background:'#d4a843',color:'#0a1628',border:'none',borderRadius:'6px',fontWeight:700,fontSize:'12px',cursor:'pointer'}}>
            + Add Link
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Ad Manager ──────── */
function AdManager({ config, setCfg, setSaved }) {
  const [expanded, setExpanded] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const ads = config?.ads || [];

  const setAds = (newAds) => {
    const n = {...config};
    n.ads = newAds;
    setCfg(n);
    setSaved(false);
  };

  // Text layout → image size mapping
  const LAYOUT_SIZES = {
    'image-only': { label: 'Image Only', w: 600, h: 500, desc: 'Tall image, no text' },
    'text-above': { label: 'Text Above', w: 600, h: 400, desc: 'Image with caption above' },
    'text-below': { label: 'Text Below', w: 600, h: 400, desc: 'Image with caption below' },
    'text-both':  { label: 'Text Above & Below', w: 600, h: 300, desc: 'Image squeezed between captions' },
  };

  const LAYOUTS = ['image-only','text-above','text-below','text-both'];

  const addNew = () => {
    const newAd = {
      id: Date.now().toString(36),
      layout: 'image-only',
      imageData: null,
      fileName: '',
      captionAbove: '',
      captionBelow: '',
      linkUrl: '',
      active: true
    };
    setAds([...ads, newAd]);
    setEditingIdx(ads.length);
    setEditForm(newAd);
    setExpanded(ads.length);
  };

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditForm({...ads[idx]});
  };

  const saveEdit = () => {
    const updated = [...ads];
    updated[editingIdx] = editForm;
    setAds(updated);
    setEditingIdx(null);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
  };

  const deleteAd = (idx) => {
    if (!confirm('Delete this ad?')) return;
    const updated = ads.filter((_, i) => i !== idx);
    setAds(updated);
    if (editingIdx === idx) setEditingIdx(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Resize to fit selected layout
      const layout = LAYOUT_SIZES[editForm.layout] || LAYOUT_SIZES['image-only'];
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(layout.w / img.width, layout.h / img.height);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a2a4a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const ox = (canvas.width - img.width * ratio) / 2;
        const oy = (canvas.height - img.height * ratio) / 2;
        ctx.drawImage(img, ox, oy, img.width * ratio, img.height * ratio);
        setEditForm({...editForm, imageData: canvas.toDataURL('image/jpeg', 0.85), fileName: file.name});
        setUploading(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getPreviewStyle = (layout) => {
    const s = LAYOUT_SIZES[layout];
    // Calculate preview aspect ratio respecting ad box constraint (roughly 1.2:1)
    const maxPreviewW = 280;
    const maxPreviewH = 180;
    const ar = s.w / s.h;
    let pw = maxPreviewW;
    let ph = pw / ar;
    if (ph > maxPreviewH) { ph = maxPreviewH; pw = ph * ar; }
    return { width: Math.round(pw), height: Math.round(ph) };
  };

  // ── Crop Modal ──
  const [cropModal, setCropModal] = useState(null);
  const [cropAspect, setCropAspect] = useState('free');
  const [cropRect, setCropRect] = useState(null);

  const openCrop = (src) => {
    const img = new Image();
    img.onload = () => {
      const defaultSize = Math.min(img.width, img.height) * 0.8;
      setCropRect({ x: (img.width - defaultSize) / 2, y: (img.height - defaultSize) / 2, w: defaultSize, h: defaultSize, imgW: img.width, imgH: img.height });
      setCropModal(src);
    };
    img.src = src;
  };

  const applyCrop = () => {
    if (!cropModal || !cropRect) return;
    const canvas = document.createElement('canvas');
    canvas.width = cropRect.w;
    canvas.height = cropRect.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
      setEditForm({...editForm, imageData: canvas.toDataURL('image/jpeg', 0.92), fileName: editForm.fileName});
      setCropModal(null);
    };
    img.src = cropModal;
  };

  const handleCropMouseDown = (e) => {
    const imgEl = document.getElementById('crop-image');
    if (!imgEl || !imgEl.complete) return;
    const rect = imgEl.getBoundingClientRect();
    const scaleX = cropRect.imgW / rect.width;
    const scaleY = cropRect.imgH / rect.height;
    const startX = (e.clientX - rect.left) * scaleX;
    const startY = (e.clientY - rect.top) * scaleY;

    const onMove = (ev) => {
      const curX = Math.max(0, Math.min(cropRect.imgW, (ev.clientX - rect.left) * scaleX));
      const curY = Math.max(0, Math.min(cropRect.imgH, (ev.clientY - rect.top) * scaleY));
      let w = Math.abs(curX - startX);
      let h = Math.abs(curY - startY);
      if (cropAspect !== 'free') {
        const parts = cropAspect.split(':');
        const ar = parseFloat(parts[0]) / parseFloat(parts[1]);
        h = w / ar;
      }
      const x = Math.min(startX, curX);
      const y = Math.min(startY, curY);
      setCropRect({ ...cropRect, x: Math.max(0, x), y: Math.max(0, y), w: Math.min(cropRect.imgW - x, w), h: Math.min(cropRect.imgH - y, h) });
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{fontWeight:600,fontSize:13,color:'#e8edf5'}}>📢 Ad Manager</div>
          <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>Manage ad placeholders displayed under the risk meter</div>
        </div>
        <button onClick={addNew}
          style={{background:'#d4a843',color:'#0a1628',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12}}>
          + New Ad
        </button>
      </div>

      {ads.length === 0 ? (
        <div style={{padding:'20px',textAlign:'center',background:'#1a2a4a',borderRadius:'12px',border:'1px solid #2a3a5a'}}>
          <p style={{color:'#6272a4',fontSize:13}}>No ads yet. Click "+ New Ad" to add your first advertisement.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ads.map((ad, idx) => (
            <div key={ad.id || idx} style={{
              borderRadius:10, border:'1px solid #2a3a5a', overflow:'hidden',
              background: expanded === idx ? '#1a2a4a' : '#0f1f3d'
            }}>
              {/* Collapsed row */}
              <div onClick={() => setExpanded(expanded === idx ? null : idx)}
                style={{padding:'10px 12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div className="flex items-center gap-2" style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:16}}>{ad.active ? '🟢' : '⚪'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#e8edf5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {ad.fileName || `Ad #${idx + 1}`}
                    </div>
                    <div style={{fontSize:10,color:'#6272a4'}}>
                      {LAYOUTS.find(l => l === ad.layout) ? LAYOUT_SIZES[ad.layout]?.label || ad.layout : ad.layout}
                      {ad.linkUrl ? ` · 🔗 ${ad.linkUrl.slice(0,30)}` : ''}
                    </div>
                  </div>
                </div>
                <span style={{color:'#6272a4',fontSize:10}}>{expanded === idx ? '▲' : '▼'}</span>
              </div>

              {/* Expanded editor */}
              {expanded === idx && (
                <div style={{padding:'12px',borderTop:'1px solid #2a3a5a'}}>
                  {editingIdx === idx ? (
                    <div className="space-y-3">
                      {/* Layout selector */}
                      <div>
                        <label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Text Layout</label>
                        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {LAYOUTS.map(l => {
                            const ls = LAYOUT_SIZES[l];
                            const pre = getPreviewStyle(l);
                            return (
                              <button key={l} onClick={() => setEditForm({...editForm, layout: l})}
                                style={{
                                  padding:'6px 10px', borderRadius:6, fontSize:10, border:'1px solid',
                                  background: editForm.layout === l ? '#d4a843' : '#2a3a5a',
                                  color: editForm.layout === l ? '#0a1628' : '#94a3b8',
                                  borderColor: editForm.layout === l ? '#d4a843' : '#2a3a5a',
                                  cursor:'pointer'
                                }}>
                                {ls.label}
                                <span style={{fontSize:8,display:'block',opacity:0.7}}>{pre.w}×{pre.h}px</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Image upload */}
                      <div>
                        <label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Image</label>
                        <label style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#2a3a5a',borderRadius:8,cursor:'pointer'}}>
                          <span style={{fontSize:11,color:'#94a3b8'}}>{editForm.fileName || 'Choose image...'}</span>
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
                          {uploading && <span style={{fontSize:10,color:'#d4a843'}}>⏳</span>}
                        </label>
                        {editForm.imageData && (
                          <div style={{marginTop:4,display:'flex',alignItems:'flex-start',gap:'6px'}}>
                            <div style={{position:'relative',display:'inline-block'}}>
                              <img src={editForm.imageData} alt="ad preview" style={{maxWidth:'100%',maxHeight:100,borderRadius:6,border:'1px solid #2a3a5a'}} />
                              <button onClick={() => setEditForm({...editForm, imageData: null, fileName: ''})}
                                style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:18,height:18,fontSize:10,cursor:'pointer'}}>✕</button>
                            </div>
                            <button onClick={() => openCrop(editForm.imageData)}
                              style={{padding:'6px 10px',background:'#2a3a5a',border:'1px solid #d4a843',borderRadius:6,color:'#d4a843',fontSize:10,cursor:'pointer',whiteSpace:'nowrap'}}>
                              ✂ Crop
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Captions */}
                      {editForm.layout !== 'image-only' && (editForm.layout === 'text-above' || editForm.layout === 'text-both') && (
                        <div>
                          <label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Caption Above</label>
                          <input value={editForm.captionAbove || ''} onChange={e => setEditForm({...editForm, captionAbove: e.target.value})}
                            style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:6,color:'#e8edf5',fontSize:12,boxSizing:'border-box'}} />
                        </div>
                      )}
                      {(editForm.layout === 'text-below' || editForm.layout === 'text-both') && (
                        <div>
                          <label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Caption Below</label>
                          <input value={editForm.captionBelow || ''} onChange={e => setEditForm({...editForm, captionBelow: e.target.value})}
                            style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:6,color:'#e8edf5',fontSize:12,boxSizing:'border-box'}} />
                        </div>
                      )}

                      {/* Link URL */}
                      <div>
                        <label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Click URL (optional)</label>
                        <input value={editForm.linkUrl || ''} onChange={e => setEditForm({...editForm, linkUrl: e.target.value})}
                          placeholder="https://..."
                          style={{width:'100%',padding:'8px',background:'#1a2a4a',border:'1px solid #2a3a5a',borderRadius:6,color:'#e8edf5',fontSize:12,boxSizing:'border-box'}} />
                      </div>

                      {/* Active toggle */}
                      <div className="flex items-center gap-2">
                        <label style={{fontSize:11,fontWeight:600,color:'#94a3b8'}}>Active</label>
                        <label style={{position:'relative',display:'inline-block',cursor:'pointer',flexShrink:0}}>
                          <input type="checkbox" style={{display:'none'}} checked={editForm.active !== false}
                            onChange={e => setEditForm({...editForm, active: e.target.checked})} />
                          <div style={{width:32,height:18,borderRadius:99,background:editForm.active!==false?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
                            <div style={{position:'absolute',top:2,left:editForm.active!==false?16:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
                          </div>
                        </label>
                      </div>

                      {/* Save/Cancel */}
                      <div className="flex gap-2">
                        <button onClick={saveEdit} style={{flex:1,padding:'8px',background:'#d4a843',color:'#0a1628',border:'none',borderRadius:6,cursor:'pointer',fontWeight:700,fontSize:12}}>
                          💾 Save
                        </button>
                        <button onClick={cancelEdit} style={{flex:1,padding:'8px',background:'transparent',color:'#94a3b8',border:'1px solid #475569',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:12}}>
                          Cancel
                        </button>
                        <button onClick={() => deleteAd(idx)} style={{padding:'8px',background:'transparent',color:'#ff5555',border:'1px solid #7f1d1d',borderRadius:6,cursor:'pointer',fontSize:12}}>
                          🗑
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Preview thumbnail */}
                      <div style={{textAlign:'center',marginBottom:10}}>
                        {ad.imageData ? (
                          <img src={ad.imageData} alt="ad" style={{maxWidth:'60%',maxHeight:80,borderRadius:6,border:'1px solid #2a3a5a'}} />
                        ) : (
                          <div style={{padding:20,background:'#1a2a4a',borderRadius:8,display:'inline-block'}}>
                            <span style={{color:'#6272a4',fontSize:11}}>No image uploaded</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => startEdit(idx)}
                        style={{width:'100%',padding:'8px',background:'#1a3a5c',color:'#d4a843',border:'none',borderRadius:6,cursor:'pointer',fontWeight:700,fontSize:12}}>
                        ✏️ Edit Ad
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Crop Modal — INSIDE wrapper div */}
      {cropModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{background:'rgba(0,0,0,0.85)'}} onClick={() => setCropModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{background:'#1a2a4a',borderRadius:'16px',padding:'20px',maxWidth:'90vw',maxHeight:'90vh',display:'flex',flexDirection:'column',gap:'12px',border:'1px solid #2a3a5a'}}>
            <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:'11px',fontWeight:600,color:'#94a3b8'}}>Aspect:</span>
              {['free','2:1','1.5:1','1:1','3:4','9:16'].map(a => (
                <button key={a} onClick={() => setCropAspect(a)}
                  style={{
                    padding:'4px 10px',borderRadius:'6px',border:'1px solid ' + (cropAspect === a ? '#d4a843' : '#2a3a5a'),
                    background: cropAspect === a ? '#d4a843' : 'transparent',
                    color: cropAspect === a ? '#0a1628' : '#94a3b8',
                    fontWeight:700,fontSize:'10px',cursor:'pointer'
                  }}>{a === 'free' ? 'Free' : a}</button>
              ))}
            </div>
            <div style={{position:'relative',overflow:'hidden',borderRadius:'8px',border:'1px solid #2a3a5a',maxHeight:'60vh',maxWidth:'80vw',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img id="crop-image" src={cropModal} alt="crop" style={{maxWidth:'100%',maxHeight:'55vh',objectFit:'contain',cursor:'crosshair'}} onMouseDown={handleCropMouseDown} />
              {cropRect && (
                <div style={{
                  position:'absolute',left: (cropRect.x / cropRect.imgW * 100) + '%', top: (cropRect.y / cropRect.imgH * 100) + '%',
                  width: (cropRect.w / cropRect.imgW * 100) + '%', height: (cropRect.h / cropRect.imgH * 100) + '%',
                  border:'2px dashed #d4a843', background:'rgba(212,168,67,0.08)', pointerEvents:'none',
                  boxSizing:'border-box'
                }} />
              )}
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
              <button onClick={() => setCropModal(null)}
                style={{padding:'8px 16px',borderRadius:'8px',border:'1px solid #2a3a5a',background:'transparent',color:'#94a3b8',fontWeight:600,fontSize:'11px',cursor:'pointer'}}>Cancel</button>
              <button onClick={applyCrop}
                style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#d4a843',color:'#0a1628',fontWeight:700,fontSize:'11px',cursor:'pointer'}}>✂ Apply Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────── Tiers Features Panel ──────── */





/* ──────── Billing Panel ──────── */
function BillingPanel({ cfg, setCfg, setSaved }) {
  const [subtab, setSubtab] = useState('estimates');
  const subtabs = [
    { id:'estimates', label:'📝 Estimates' },
    { id:'invoices', label:'🧾 Invoices' },
    { id:'receipts', label:'🧾 Receipts' },
    { id:'accounting', label:'📊 Accounting' },
    { id:'stripe', label:'💳 Stripe' },
  ];
  const [items, setItems] = useState(() => {
    try {
      return {
        estimates: JSON.parse(localStorage.getItem('st_estimates')) || [],
        invoices: JSON.parse(localStorage.getItem('st_invoices')) || [],
        receipts: JSON.parse(localStorage.getItem('st_receipts')) || [],
        payments: JSON.parse(localStorage.getItem('st_stripe_payments')) || [],
      };
    } catch { return { estimates:[], invoices:[], receipts:[], payments:[] }; }
  });

  const save = (key, arr) => {
    const keyMap = { estimates:'st_estimates', invoices:'st_invoices', receipts:'st_receipts', payments:'st_stripe_payments' };
    localStorage.setItem(keyMap[key], JSON.stringify(arr));
    setItems(prev => ({...prev, [key]: arr}));
  };

  const addItem = (key) => {
    const prefix = { estimates:'EST', invoices:'INV', receipts:'RCP' }[key] || 'DOC';
    const nu = items[key] || [];
    const newNum = nu.length + 1;
    const ni = { id: Date.now().toString(36), num: `${prefix}-${String(newNum).padStart(3,'0')}`, date: new Date().toISOString().split('T')[0], customer: '', amount: 0, status: 'draft', items: [] };
    save(key, [...nu, ni]);
  };

  const updateField = (key, id, field, value) => {
    save(key, (items[key] || []).map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const deleteItem = (key, id) => {
    if (!confirm('Delete?')) return;
    save(key, (items[key] || []).filter(i => i.id !== id));
  };

  const totalByStatus = (key, status) => (items[key] || []).filter(i => i.status === status).reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const grandTotal = (key) => (items[key] || []).reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const inp = 'w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#d4a843] focus:outline-none';
  const btn = 'rounded-lg px-3 py-1.5 text-xs font-semibold border-none cursor-pointer';
  const btnStyle = { background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#d4a843' };

  return (
    <div className="space-y-3">
      {/* Subtabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:'thin'}}>
        {subtabs.map(s => (
          <button key={s.id} onClick={()=>setSubtab(s.id)}
            className="rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap"
            style={{background:subtab===s.id?'#d4a843':'transparent',color:subtab===s.id?'#0a1628':'#94a3b8',border:'1px solid',borderColor:subtab===s.id?'#d4a843':'#334155',cursor:'pointer'}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Estimates */}
      {subtab === 'estimates' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs font-semibold" style={{color:'#94a3b8'}}>📝 Estimates ({(items.estimates||[]).length})</span>
            <button style={{...btnStyle,padding:'4px 10px',fontSize:'10px',borderRadius:6}} onClick={()=>addItem('estimates')}>➕ New</button>
          </div>
          {(items.estimates||[]).length === 0 && <div className="text-xs text-center py-4" style={{color:'#64748b'}}>No estimates yet.</div>}
          {(items.estimates||[]).map(e => (
            <div key={e.id} className="rounded-lg p-2" style={{border:'1px solid #334155',background:'#1a1f2e'}}>
              <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold" style={{color:'#d4a843'}}>{e.num}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:e.status==='sent'?'#1a3a2a':e.status==='approved'?'#2a3a1a':'#3a3a3a',color:e.status==='sent'?'#50fa7b':e.status==='approved'?'#f1fa8c':'#94a3b8'}}>{e.status}</span>
              </div>
              <input className={inp + ' text-xs py-1 mb-1'} placeholder="Customer name" value={e.customer} onChange={ev=>updateField('estimates',e.id,'customer',ev.target.value)} />
              <div className="flex gap-2 items-center"><input className={inp + ' text-xs py-1 flex-1'} type="number" step="0.01" placeholder="0.00" value={e.amount} onChange={ev=>updateField('estimates',e.id,'amount',ev.target.value)} />
                <select className={inp + ' text-xs py-1 w-20'} value={e.status} onChange={ev=>updateField('estimates',e.id,'status',ev.target.value)}><option value="draft">Draft</option><option value="sent">Sent</option><option value="approved">Approved</option></select>
                <button onClick={()=>deleteItem('estimates',e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:14}}>🗑️</button>
              </div>
            </div>
          ))}
          {(items.estimates||[]).length > 0 && <div className="text-[10px] text-right" style={{color:'#94a3b8'}}>Total: <span style={{color:'#d4a843',fontWeight:700}}>${grandTotal('estimates').toFixed(2)}</span></div>}
        </div>
      )}

      {/* Invoices */}
      {subtab === 'invoices' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs font-semibold" style={{color:'#94a3b8'}}>🧾 Invoices ({(items.invoices||[]).length})</span>
            <button style={{...btnStyle,padding:'4px 10px',fontSize:'10px',borderRadius:6}} onClick={()=>addItem('invoices')}>➕ New</button>
          </div>
          {(items.invoices||[]).length === 0 && <div className="text-xs text-center py-4" style={{color:'#64748b'}}>No invoices yet.</div>}
          {(items.invoices||[]).map(e => (
            <div key={e.id} className="rounded-lg p-2" style={{border:'1px solid #334155',background:'#1a1f2e'}}>
              <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold" style={{color:'#d4a843'}}>{e.num}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:e.status==='paid'?'#1a3a2a':e.status==='overdue'?'#3a1a1a':'#3a3a3a',color:e.status==='paid'?'#50fa7b':e.status==='overdue'?'#ff5555':'#94a3b8'}}>{e.status}</span>
              </div>
              <input className={inp + ' text-xs py-1 mb-1'} placeholder="Customer" value={e.customer} onChange={ev=>updateField('invoices',e.id,'customer',ev.target.value)} />
              <div className="flex gap-2 items-center"><input className={inp + ' text-xs py-1 flex-1'} type="number" step="0.01" placeholder="0.00" value={e.amount} onChange={ev=>updateField('invoices',e.id,'amount',ev.target.value)} />
                <select className={inp + ' text-xs py-1 w-20'} value={e.status} onChange={ev=>updateField('invoices',e.id,'status',ev.target.value)}><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select>
                <button onClick={()=>deleteItem('invoices',e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:14}}>🗑️</button>
              </div>
            </div>
          ))}
          {(items.invoices||[]).length > 0 && <div className="text-[10px] text-right" style={{color:'#94a3b8'}}>Paid: <span style={{color:'#50fa7b',fontWeight:700}}>${totalByStatus('invoices','paid').toFixed(2)}</span> · Outstanding: <span style={{color:'#ff5555',fontWeight:700}}>${grandTotal('invoices').toFixed(2)}</span></div>}
        </div>
      )}

      {/* Receipts */}
      {subtab === 'receipts' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs font-semibold" style={{color:'#94a3b8'}}>🧾 Receipts ({(items.receipts||[]).length})</span>
            <button style={{...btnStyle,padding:'4px 10px',fontSize:'10px',borderRadius:6}} onClick={()=>addItem('receipts')}>➕ New</button>
          </div>
          {(items.receipts||[]).length === 0 && <div className="text-xs text-center py-4" style={{color:'#64748b'}}>No receipts yet.</div>}
          {(items.receipts||[]).map(e => (
            <div key={e.id} className="rounded-lg p-2" style={{border:'1px solid #334155',background:'#1a1f2e'}}>
              <div className="text-xs font-bold mb-1" style={{color:'#d4a843'}}>#{e.num}</div>
              <input className={inp + ' text-xs py-1 mb-1'} placeholder="Customer" value={e.customer} onChange={ev=>updateField('receipts',e.id,'customer',ev.target.value)} />
              <div className="flex gap-2 items-center"><input className={inp + ' text-xs py-1 flex-1'} type="number" step="0.01" placeholder="0.00" value={e.amount} onChange={ev=>updateField('receipts',e.id,'amount',ev.target.value)} />
                <button onClick={()=>deleteItem('receipts',e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:14}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accounting */}
      {subtab === 'accounting' && (
        <div className="space-y-2">
          <div className="text-xs font-semibold mb-1" style={{color:'#94a3b8'}}>📊 Accounting Dashboard</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-3 text-center" style={{border:'1px solid #334155',background:'#0f1f3d'}}>
              <div className="text-lg font-bold" style={{color:'#50fa7b'}}>${grandTotal('invoices').toFixed(2)}</div>
              <div className="text-[10px]" style={{color:'#94a3b8'}}>Total Invoiced</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{border:'1px solid #334155',background:'#0f1f3d'}}>
              <div className="text-lg font-bold" style={{color:'#ff5555'}}>${(grandTotal('invoices')-totalByStatus('invoices','paid')).toFixed(2)}</div>
              <div className="text-[10px]" style={{color:'#94a3b8'}}>Outstanding</div>
            </div>
          </div>
          <div className="text-[10px] text-center" style={{color:'#64748b'}}>{(items.estimates||[]).length} estimates · {(items.invoices||[]).length} invoices · {(items.receipts||[]).length} receipts · {(items.payments||[]).length} Stripe payments</div>
        </div>
      )}

      {/* Stripe */}
      {subtab === 'stripe' && (
        <div className="space-y-2">
          <div className="text-xs font-semibold mb-1" style={{color:'#94a3b8'}}>💳 Stripe Payments ({(items.payments||[]).length})</div>
          <div className="rounded-lg p-2 text-center" style={{border:'1px dashed #334155',background:'#0a0f1a'}}>
            <div className="text-xs" style={{color:'#94a3b8'}}>Add your Stripe API keys in the Integrations tab to enable live payment links.</div>
          </div>
          {(items.payments||[]).length === 0 && <div className="text-xs text-center py-4" style={{color:'#64748b'}}>No payments yet.</div>}
          {(items.payments||[]).map(p => (
            <div key={p.id} className="rounded-lg p-2 text-xs" style={{border:'1px solid #334155',background:'#1a1f2e'}}>
              <div className="flex justify-between"><span style={{color:'#e2e8f0'}}>{p.customer || 'Unknown'}</span><span style={{color:'#d4a843',fontWeight:600}}>${parseFloat(p.amount||0).toFixed(2)}</span></div>
              <div style={{color:'#64748b',fontSize:9}}>{p.date || ''} · {p.status || 'pending'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────── Labor & Services Panel ──────── */
function LaborServicesPanel({ cfg, setCfg, setSaved }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sp_laborServices')) || []; } catch { return []; }
  });
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [desc, setDesc] = useState('');
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const save = (arr) => { setItems(arr); localStorage.setItem('sp_laborServices', JSON.stringify(arr)); };
  const addOrUpdate = () => {
    if (!name.trim()) return;
    const ni = { id: Date.now(), name: name.trim(), rate: parseFloat(rate) || 0, desc: desc.trim(), active: true };
    if (editing) { save(items.map(i => i.id === editing ? { ...i, ...ni } : i)); }
    else { save([...items, ni]); }
    setName(''); setRate(''); setDesc(''); setEditing(null);
  };
  const del = (id) => { if (!confirm('Delete?')) return; save(items.filter(i => i.id !== id)); };
  const toggleActive = (id) => { save(items.map(i => i.id === id ? { ...i, active: !i.active } : i)); };
  const edit = (i) => { setEditing(i.id); setName(i.name); setRate(String(i.rate)); setDesc(i.desc); };
  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()));

  const inp = { width:'100%', padding:'6px 10px', borderRadius:6, border:'1px solid #334155', background:'#1e293b', color:'#e2e8f0', fontSize:12, outline:'none' };
  const btn = { padding:'6px 14px', borderRadius:6, border:'none', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#d4a843', fontWeight:600, fontSize:11, cursor:'pointer' };

  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Manage service labor categories.</div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:12,background:'#0f1f3d'}}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Service Name</label><input style={inp} placeholder="Safe lock replacement" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Rate ($)</label><input style={inp} type="number" step="0.01" placeholder="85.00" value={rate} onChange={e=>setRate(e.target.value)} /></div>
        </div>
        <div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Description</label><input style={inp} placeholder="Labor to replace electronic safe lock" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div className="flex gap-2"><button style={btn} onClick={addOrUpdate}>{editing?'✏️ Update':'➕ Add Service'}</button>{editing&&<button style={{...btn,background:'#475569',color:'#e2e8f0'}} onClick={()=>{setEditing(null);setName('');setRate('');setDesc('');}}>Cancel</button>}</div>
      </div>
      <input style={inp} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} />
      <div className="space-y-1">
        {filtered.length===0&&<div style={{textAlign:'center',color:'#64748b',fontSize:12,padding:20}}>No services.</div>}
        {filtered.map(item=>(
          <div key={item.id} style={{borderRadius:6,border:'1px solid #334155',padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',opacity:item.active?1:0.5,background:'#1a1f2e'}}>
            <div className="flex-1">
              <div style={{fontWeight:600,fontSize:13,color:item.active?'#e2e8f0':'#64748b',display:'flex',alignItems:'center',gap:6}}>
                <span onClick={()=>toggleActive(item.id)} style={{cursor:'pointer',fontSize:12}}>{item.active?'✅':'⭕'}</span>{item.name}
              </div>
              {item.desc&&<div style={{fontSize:10,color:'#64748b',marginTop:1}}>{item.desc}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span style={{fontWeight:700,fontSize:14,color:'#d4a843'}}>${item.rate.toFixed(2)}</span><span style={{fontSize:10,color:'#64748b'}}>/hr</span>
              <button onClick={()=>edit(item)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:12}}>✏️</button>
              <button onClick={()=>del(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:12}}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────── Parts Catalog Panel ──────── */
function PartsCatalogPanel({ cfg, setCfg, setSaved }) {
  const [items, setItems] = useState(()=>{try{return JSON.parse(localStorage.getItem('sp_partsCatalog'))||[];}catch{return[];}});
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [sku, setSku] = useState(''); const [desc, setDesc] = useState('');
  const [editing, setEditing] = useState(null); const [search, setSearch] = useState('');
  const save=(arr)=>{setItems(arr);localStorage.setItem('sp_partsCatalog',JSON.stringify(arr));};
  const addOrUpdate=()=>{
    if(!name.trim())return;
    const ni={id:Date.now(),name:name.trim(),price:parseFloat(price)||0,sku:sku.trim(),desc:desc.trim()};
    if(editing){save(items.map(i=>i.id===editing?{...i,...ni}:i));}else{save([...items,ni]);}
    setName('');setPrice('');setSku('');setDesc('');setEditing(null);
  };
  const del=(id)=>{if(!confirm('Delete?'))return;save(items.filter(i=>i.id!==id));};
  const edit=(i)=>{setEditing(i.id);setName(i.name);setPrice(String(i.price));setSku(i.sku);setDesc(i.desc);};
  const filtered=items.filter(i=>!search||i.name.toLowerCase().includes(search.toLowerCase())||i.sku.toLowerCase().includes(search.toLowerCase()));
  const inp={width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',fontSize:12,outline:'none'};
  const btn={padding:'6px 14px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#d4a843',fontWeight:600,fontSize:11,cursor:'pointer'};
  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Manage parts and pricing.</div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:12,background:'#0f1f3d'}}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Part Name</label><input style={inp} placeholder="S&G 6730" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Price ($)</label><input style={inp} type="number" step="0.01" placeholder="89.99" value={price} onChange={e=>setPrice(e.target.value)} /></div>
        </div>
        <div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>SKU / Model</label><input style={inp} placeholder="S&G-6730" value={sku} onChange={e=>setSku(e.target.value)} /></div>
        <div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Description</label><input style={inp} placeholder="Electronic safe lock" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div className="flex gap-2"><button style={btn} onClick={addOrUpdate}>{editing?'✏️ Update':'➕ Add Part'}</button>{editing&&<button style={{...btn,background:'#475569',color:'#e2e8f0'}} onClick={()=>{setEditing(null);setName('');setPrice('');setSku('');setDesc('');}}>Cancel</button>}</div>
      </div>
      <input style={inp} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} />
      <div className="space-y-1">
        {filtered.length===0&&<div style={{textAlign:'center',color:'#64748b',fontSize:12,padding:20}}>No parts.</div>}
        {filtered.map(item=>(
          <div key={item.id} style={{borderRadius:6,border:'1px solid #334155',padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#1a1f2e'}}>
            <div className="flex-1"><div style={{fontWeight:600,fontSize:13,color:'#e2e8f0'}}>{item.name}</div>
              {item.sku&&<div style={{fontSize:10,color:'#64748b',marginTop:1}}>SKU: {item.sku}{item.desc&&` · ${item.desc}`}</div>}
            </div>
            <div className="flex gap-2 shrink-0"><span style={{fontWeight:700,fontSize:14,color:'#d4a843'}}>${item.price.toFixed(2)}</span>
              <button onClick={()=>edit(item)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:12}}>✏️</button>
              <button onClick={()=>del(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:12}}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────── Inventory Panel ──────── */
function InventoryPanel({ cfg, setCfg, setSaved }) {
  const [items, setItems] = useState(()=>{try{return JSON.parse(localStorage.getItem('sp_inventory'))||[];}catch{return[];}});
  const [name, setName] = useState(''); const [qty, setQty] = useState(''); const [minQty, setMinQty] = useState('');
  const [unit, setUnit] = useState('each'); const [loc, setLoc] = useState(''); const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(null); const [search, setSearch] = useState(''); const [filterLow, setFilterLow] = useState(false);
  const save=(arr)=>{setItems(arr);localStorage.setItem('sp_inventory',JSON.stringify(arr));};
  const addOrUpdate=()=>{
    if(!name.trim())return;
    const ni={id:Date.now(),name:name.trim(),qty:parseInt(qty)||0,minQty:parseInt(minQty)||1,unit,loc:loc.trim(),notes:notes.trim()};
    if(editing){save(items.map(i=>i.id===editing?{...i,...ni}:i));}else{save([...items,ni]);}
    setName('');setQty('');setMinQty('');setUnit('each');setLoc('');setNotes('');setEditing(null);
  };
  const del=(id)=>{if(!confirm('Remove?'))return;save(items.filter(i=>i.id!==id));};
  const edit=(i)=>{setEditing(i.id);setName(i.name);setQty(String(i.qty));setMinQty(String(i.minQty));setUnit(i.unit);setLoc(i.loc);setNotes(i.notes);};
  const adjustQty=(id,delta)=>{save(items.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+delta)}:i));};
  const filtered=items.filter(i=>{
    if(filterLow&&i.qty>=i.minQty)return false;
    if(!search)return true;const q=search.toLowerCase();
    return i.name.toLowerCase().includes(q)||i.loc.toLowerCase().includes(q)||i.notes.toLowerCase().includes(q);
  });
  const inp={width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',fontSize:12,outline:'none'};
  const btn={padding:'6px 14px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#d4a843',fontWeight:600,fontSize:11,cursor:'pointer'};
  const smBtn={background:'none',border:'none',cursor:'pointer',fontSize:14,fontWeight:700,color:'#94a3b8',padding:'2px 6px'};
  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Track stock and alerts.</div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:12,background:'#0f1f3d'}}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Part</label><input style={inp} placeholder="S&G 6730" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Unit</label><select style={inp} value={unit} onChange={e=>setUnit(e.target.value)}><option value="each">Each</option><option value="pair">Pair</option><option value="set">Set</option><option value="box">Box</option></select></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Qty</label><input style={inp} type="number" min="0" placeholder="5" value={qty} onChange={e=>setQty(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Min Alert</label><input style={inp} type="number" min="1" placeholder="3" value={minQty} onChange={e=>setMinQty(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Location</label><input style={inp} placeholder="Van A2" value={loc} onChange={e=>setLoc(e.target.value)} /></div>
        </div>
        <div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Notes</label><input style={inp} placeholder="Used for La Gard locks" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
        <div className="flex gap-2"><button style={btn} onClick={addOrUpdate}>{editing?'✏️ Update':'➕ Add'}</button>{editing&&<button style={{...btn,background:'#475569',color:'#e2e8f0'}} onClick={()=>{setEditing(null);setName('');setQty('');setMinQty('');setUnit('each');setLoc('');setNotes('');}}>Cancel</button>}</div>
      </div>
      <div className="flex gap-2 items-center"><input style={{...inp,flex:1}} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} />
        <label style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#facc15',cursor:'pointer',whiteSpace:'nowrap'}}>
          <input type="checkbox" checked={filterLow} onChange={e=>setFilterLow(e.target.checked)} style={{accentColor:'#d4a843'}}/>⚠️ Low
        </label>
      </div>
      <div className="space-y-1">
        {filtered.length===0&&<div style={{textAlign:'center',color:'#64748b',fontSize:12,padding:20}}>{filterLow?'All stocked.':'Empty.'}</div>}
        {filtered.map(item=>{
          const isLow=item.qty<=item.minQty;const isCritical=item.qty===0;
          return(<div key={item.id} style={{borderRadius:6,border:`1px solid ${isCritical?'#ef4444':isLow?'#facc15':'#334155'}`,padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',background:isCritical?'#2a0a0a':isLow?'#1a1a0a':'#1a1f2e'}}>
            <div className="flex-1"><div style={{fontWeight:600,fontSize:13,color:isCritical?'#ef4444':isLow?'#facc15':'#e2e8f0',display:'flex',alignItems:'center',gap:4}}>
              {isCritical?'🚫':isLow?'⚠️':'✅'}{item.name}</div>
              <div style={{fontSize:10,color:'#64748b',marginTop:1,display:'flex',gap:8}}>{item.loc&&<span>📍{item.loc}</span>}{item.notes&&<span>📝{item.notes}</span>}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={()=>adjustQty(item.id,-1)} style={smBtn}>−</button>
              <span style={{fontWeight:700,fontSize:16,color:isCritical?'#ef4444':'#d4a843',minWidth:24,textAlign:'center'}}>{item.qty}</span>
              <button onClick={()=>adjustQty(item.id,1)} style={smBtn}>+</button>
              <button onClick={()=>edit(item)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:12}}>✏️</button>
              <button onClick={()=>del(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:12}}>🗑️</button>
            </div>
          </div>);
        })}
      </div>
    </div>
  );
}

/* ──────── User Roles Panel ──────── */
function UserRolesPanel({ cfg, setCfg, setSaved }) {
  const [users, setUsers] = useState(()=>{try{return JSON.parse(localStorage.getItem('sp_users'))||[];}catch{return[];}});
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [role, setRole] = useState('tech'); const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(null); const [search, setSearch] = useState('');
  const ROLES=[{id:'admin',label:'Admin',color:'#ff5555'},{id:'tech',label:'Tech',color:'#50fa7b'},{id:'dispatcher',label:'Dispatcher',color:'#8be9fd'},{id:'customer',label:'Customer',color:'#ffb86c'}];
  const save=(arr)=>{setUsers(arr);localStorage.setItem('sp_users',JSON.stringify(arr));};
  const addOrUpdate=()=>{
    if(!name.trim()||!email.trim())return;
    const nu={id:Date.now(),name:name.trim(),email:email.trim(),phone:phone.trim(),role,password:password||'changeme',active:true,created:new Date().toISOString().split('T')[0]};
    if(editing){save(users.map(u=>u.id===editing?{...u,name:name.trim(),email:email.trim(),phone:phone.trim(),role:role}:u));}else{save([...users,nu]);}
    setName('');setEmail('');setPhone('');setRole('tech');setPassword('');setEditing(null);
  };
  const del=(id)=>{if(!confirm('Remove?'))return;save(users.filter(u=>u.id!==id));};
  const toggleActive=(id)=>{save(users.map(u=>u.id===id?{...u,active:!u.active}:u));};
  const edit=(u)=>{setEditing(u.id);setName(u.name);setEmail(u.email);setPhone(u.phone);setRole(u.role);};
  const filtered=users.filter(u=>!search||u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  const inp={width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',fontSize:12,outline:'none'};
  const btn={padding:'6px 14px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#d4a843',fontWeight:600,fontSize:11,cursor:'pointer'};
  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Manage users and roles.</div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:12,background:'#0f1f3d'}}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Name</label><input style={inp} placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Email</label><input style={inp} placeholder="john@example.com" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Phone</label><input style={inp} placeholder="(916) 555-0100" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Role</label><select style={inp} value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
        </div>
        {!editing&&<div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Password</label><input style={inp} type="password" placeholder="Default: changeme" value={password} onChange={e=>setPassword(e.target.value)} /></div>}
        <div className="flex gap-2"><button style={btn} onClick={addOrUpdate}>{editing?'✏️ Update':'➕ Add User'}</button>{editing&&<button style={{...btn,background:'#475569',color:'#e2e8f0'}} onClick={()=>{setEditing(null);setName('');setEmail('');setPhone('');setRole('tech');setPassword('');}}>Cancel</button>}</div>
      </div>
      <input style={inp} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} />
      <div className="space-y-1">
        {filtered.length===0&&<div style={{textAlign:'center',color:'#64748b',fontSize:12,padding:20}}>No users.</div>}
        {filtered.map(u=>{const ri=ROLES.find(r=>r.id===u.role)||ROLES[1];
          return(<div key={u.id} style={{borderRadius:6,border:'1px solid #334155',padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',opacity:u.active?1:0.5,background:'#1a1f2e'}}>
            <div className="flex-1"><div style={{fontWeight:600,fontSize:13,color:u.active?'#e2e8f0':'#64748b',display:'flex',alignItems:'center',gap:6}}>
              <span onClick={()=>toggleActive(u.id)} style={{cursor:'pointer',fontSize:12}}>{u.active?'🟢':'⭕'}</span>{u.name}</div>
              <div style={{fontSize:10,color:'#64748b',display:'flex',gap:8}}><span>✉️ {u.email}</span>{u.phone&&<span>📞 {u.phone}</span>}<span style={{color:ri.color,fontWeight:600}}>{ri.label}</span></div>
            </div>
            <div><button onClick={()=>edit(u)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:12}}>✏️</button>
            <button onClick={()=>del(u.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:12}}>🗑️</button></div>
          </div>);})}
      </div>
    </div>
  );
}

/* ──────── Customer Portal Panel ──────── */
function CustomerPortalPanel({ cfg, setCfg, setSaved }) {
  const [enabled, setEnabled] = useState(cfg.features?.showCustomerPortal||false);
  const toggle=()=>{const nv=!enabled;setEnabled(nv);setCfg(p=>{const n={...p};n.features={...n.features,showCustomerPortal:nv};return n;});setSaved(false);};
  const cust=(()=>{try{return JSON.parse(localStorage.getItem('sp_users')).filter(u=>u.role==='customer'&&u.active)||[];}catch{return[];}})();
  const triages=(()=>{try{return JSON.parse(localStorage.getItem('safepulse_triage_history'))||[];}catch{return[];}})();
  const inp={width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',fontSize:12,outline:'none'};
  const btn={padding:'6px 14px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#d4a843',fontWeight:600,fontSize:11,cursor:'pointer'};
  const url=`${window.location.origin}${window.location.pathname}?portal=1`;
  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Customer portal for viewing past reports.</div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0f1f3d'}}>
        <div><div style={{fontWeight:600,fontSize:13,color:'#e2e8f0'}}>🔐 Customer Portal</div><div style={{fontSize:10,color:'#64748b'}}>{enabled?'Active':'Disabled'}</div></div>
        <label style={{position:'relative',display:'inline-block',cursor:'pointer',flexShrink:0}}>
          <input type="checkbox" style={{display:'none'}} checked={enabled} onChange={toggle}/>
          <div style={{width:44,height:24,borderRadius:99,background:enabled?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
            <div style={{position:'absolute',top:3,left:enabled?23:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'0.2s'}}/>
          </div>
        </label>
      </div>
      {enabled&&<div style={{borderRadius:8,border:'1px solid #334155',padding:10,background:'#0f1f3d'}}>
        <div style={{fontWeight:600,fontSize:12,color:'#94a3b8',marginBottom:4}}>Portal URL</div>
        <div className="flex gap-2"><input style={{...inp,flex:1}} readOnly value={url} onClick={e=>e.target.select()}/><button style={btn} onClick={()=>navigator.clipboard.writeText(url)}>📋 Copy</button></div>
      </div>}
    </div>
  );
}

/* ──────── Scheduling Panel ──────── */
function SchedulingPanel({ cfg, setCfg, setSaved }) {
  const [events, setEvents] = useState(()=>{try{return JSON.parse(localStorage.getItem('sp_events'))||[];}catch{return[];}});
  const [showForm, setShowForm] = useState(false); const [title, setTitle] = useState(''); const [date, setDate] = useState('');
  const [time, setTime] = useState(''); const [duration, setDuration] = useState('60'); const [client, setClient] = useState('');
  const [address, setAddress] = useState(''); const [notes, setNotes] = useState(''); const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState(''); const [gc, setGc] = useState(false); const [oc, setOc] = useState(false);
  const save=(arr)=>{setEvents(arr);localStorage.setItem('sp_events',JSON.stringify(arr));};
  const addOrUpdate=()=>{
    if(!title.trim()||!date)return;
    const ne={id:Date.now().toString(36),title:title.trim(),date,time:time||'09:00',duration:parseInt(duration)||60,client:client.trim(),address:address.trim(),notes:notes.trim(),status:'scheduled',completed:false};
    if(editing){save(events.map(e=>e.id===editing?{...e,...ne,id:e.id}:e));}else{save([...events,ne]);}
    setTitle('');setDate('');setTime('');setDuration('60');setClient('');setAddress('');setNotes('');setEditing(null);setShowForm(false);
  };
  const del=(id)=>{if(!confirm('Delete?'))return;save(events.filter(e=>e.id!==id));};
  const edit=(e)=>{setEditing(e.id);setTitle(e.title);setDate(e.date);setTime(e.time||'09:00');setDuration(String(e.duration||60));setClient(e.client||'');setAddress(e.address||'');setNotes(e.notes||'');setShowForm(true);};
  const todayStr=new Date().toISOString().split('T')[0];
  const todayEvents=events.filter(e=>e.date===todayStr&&!e.completed).sort((a,b)=>(a.time||'00:00').localeCompare(b.time||'00:00'));
  const upcoming=events.filter(e=>e.date>=todayStr&&!e.completed).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10);
  const inp={width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',fontSize:12,outline:'none'};
  const btn={padding:'6px 14px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#d4a843',fontWeight:600,fontSize:11,cursor:'pointer'};
  const secBtn={...btn,background:'#475569',color:'#e2e8f0'};
  const formatDate=(d)=>{const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});};
  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Schedule appointments.</div>
      <div className="grid grid-cols-3 gap-2">
        <div style={{borderRadius:6,border:'1px solid #334155',padding:'6px 8px',textAlign:'center',background:'#0f1f3d'}}><div style={{fontSize:20,fontWeight:700,color:'#d4a843'}}>{todayEvents.length}</div><div style={{fontSize:9,color:'#94a3b8'}}>Today</div></div>
        <div style={{borderRadius:6,border:'1px solid #334155',padding:'6px 8px',textAlign:'center',background:'#0f1f3d'}}><div style={{fontSize:20,fontWeight:700,color:'#8be9fd'}}>{upcoming.length}</div><div style={{fontSize:9,color:'#94a3b8'}}>Upcoming</div></div>
        <div style={{borderRadius:6,border:'1px solid #334155',padding:'6px 8px',textAlign:'center',background:'#0f1f3d'}}><div style={{fontSize:20,fontWeight:700,color:'#50fa7b'}}>{events.length}</div><div style={{fontSize:9,color:'#94a3b8'}}>Total</div></div>
      </div>
      {!showForm?<button style={{...btn,width:'100%',padding:'10px',fontSize:12}} onClick={()=>setShowForm(true)}>📅 + New Appointment</button>:
      <div style={{borderRadius:8,border:'1px solid #334155',padding:12,background:'#0f1f3d'}}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Title</label><input style={inp} placeholder="Safe lock replacement" value={title} onChange={e=>setTitle(e.target.value)}/></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Client</label><input style={inp} placeholder="John Smith" value={client} onChange={e=>setClient(e.target.value)}/></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Date</label><input style={inp} type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Time</label><input style={inp} type="time" value={time} onChange={e=>setTime(e.target.value)}/></div>
          <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Duration</label><select style={inp} value={duration} onChange={e=>setDuration(e.target.value)}><option value="30">30m</option><option value="60">1h</option><option value="90">1.5h</option><option value="120">2h</option><option value="180">3h</option></select></div>
        </div>
        <div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Address</label><input style={inp} placeholder="123 Main St, Stockton" value={address} onChange={e=>setAddress(e.target.value)}/></div>
        <div className="mb-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Notes</label><input style={inp} placeholder="Gate code 1234" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <div className="flex gap-2"><button style={btn} onClick={addOrUpdate}>{editing?'✏️ Update':'📅 Add'}</button><button style={secBtn} onClick={()=>{setShowForm(false);setEditing(null);setTitle('');setDate('');setTime('');setDuration('60');setClient('');setAddress('');setNotes('');}}>Cancel</button></div>
      </div>}
      <div style={{borderRadius:8,border:'1px solid #334155',padding:10,background:'#0f1f3d'}}>
        <div style={{fontWeight:600,fontSize:12,color:'#d4a843',marginBottom:6}}>📋 Today</div>
        {todayEvents.length===0&&<div style={{fontSize:10,color:'#64748b'}}>No appointments today.</div>}
        {todayEvents.map(e=>(<div key={e.id} style={{borderRadius:4,border:'1px solid #334155',padding:'5px 8px',background:'#1a1f2e',marginBottom:3,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="flex-1"><div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontWeight:600,fontSize:11,color:'#e2e8f0'}}>{e.time?.slice(0,5)}</span><span style={{fontSize:11,color:'#e2e8f0'}}>{e.title}</span>
          </div>{e.client&&<div style={{fontSize:9,color:'#64748b',marginLeft:12}}>👤 {e.client}</div>}</div>
          <div className="flex gap-1"><button onClick={()=>edit(e)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:10}}>✏️</button>
          <button onClick={()=>del(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:10}}>🗑️</button></div>
        </div>))}
      </div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:10,background:'#0f1f3d'}}>
        <div style={{fontWeight:600,fontSize:12,color:'#8be9fd',marginBottom:6}}>📅 Upcoming</div>
        {upcoming.length===0&&<div style={{fontSize:10,color:'#64748b'}}>No upcoming.</div>}
        {upcoming.map(e=>(<div key={e.id} style={{borderRadius:4,border:'1px solid #334155',padding:'4px 8px',background:'#1a1f2e',marginBottom:2,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="flex-1"><div style={{fontSize:10,color:'#e2e8f0',display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontWeight:600,color:'#d4a843'}}>{formatDate(e.date)}</span><span>{e.time?.slice(0,5)}</span><span>—</span><span className="truncate">{e.title}</span>
          </div></div>
          <button onClick={()=>edit(e)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:10}}>✏️</button>
        </div>))}
      </div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:10,background:'#0f1f3d'}}>
        <div style={{fontWeight:600,fontSize:12,color:'#ffb86c',marginBottom:6}}>🔗 Calendar Integrations</div>
        <div style={{borderRadius:6,border:'1px solid #334155',padding:'8px 10px',background:'#1a1f2e',marginBottom:4,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><div style={{fontWeight:600,fontSize:11,color:'#e2e8f0'}}>📅 Google Calendar</div><div style={{fontSize:9,color:'#64748b'}}>{gc?'Connected':'Connect to sync'}</div></div>
          <button style={gc?{...btn,background:'#ef4444',color:'#fff',fontSize:10}:{...btn,fontSize:10}} onClick={()=>setGc(!gc)}>{gc?'Disconnect':'Connect'}</button>
        </div>
        <div style={{borderRadius:6,border:'1px solid #334155',padding:'8px 10px',background:'#1a1f2e',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><div style={{fontWeight:600,fontSize:11,color:'#e2e8f0'}}>📅 Outlook / M365</div><div style={{fontSize:9,color:'#64748b'}}>{oc?'Connected':'Connect to sync'}</div></div>
          <button style={oc?{...btn,background:'#ef4444',color:'#fff',fontSize:10}:{...btn,fontSize:10}} onClick={()=>setOc(!oc)}>{oc?'Disconnect':'Connect'}</button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Contract Templates Panel ──────── */
function ContractTemplatesPanel({ cfg, setCfg, setSaved }) {
  const [templates, setTemplates] = useState(()=>{try{return JSON.parse(localStorage.getItem('sp_contract_templates'))||[];}catch{return[];}});
  const [name, setName] = useState(''); const [body, setBody] = useState(''); const [editing, setEditing] = useState(null); const [search, setSearch] = useState(''); const [previewId, setPreviewId] = useState(null);
  const DEFAULTS=[
    {id:'default_service',name:'Safe Service Agreement',category:'service',builtIn:true,
      body:'SAFE SERVICE AGREEMENT\n\nDate: _______________\nCustomer: _______________\nAddress: _______________\nPhone: _______________\n\nSCOPE OF WORK\n_____________________________________________\n\nSERVICE FEE: $_______________\n\nTERMS & CONDITIONS\n1. Technician will perform diagnosis and/or repair of the safe locking mechanism.\n2. Customer authorizes the technician to open the safe using standard safe opening techniques.\n3. If drilling is required, customer authorizes minimal entry damage.\n4. Replacement parts will be quoted before installation.\n5. Payment is due upon completion.\n6. No warranty on safe opening services due to the nature of the work.\n\nLIABILITY\nTechnician is not liable for contents inside the safe.\n\nSIGNATURES\n\nCustomer: ___________________ Date: __________\nTechnician: __________________ Date: __________\n\nCompany: Frantz Locksmith Service\nLicense: LCO 4160\nPhone: (916) 534-4900'},
    {id:'default_waiver',name:'Liability Waiver',category:'waiver',builtIn:true,
      body:'LIABILITY WAIVER\n\nDate: _______________\nCustomer: _______________\n\nI, ___________________, acknowledge:\n1. I authorize Frantz Locksmith Service to perform safe opening/repair services.\n2. I understand safe opening may require drilling or other techniques that could damage the safe.\n3. I release Frantz Locksmith Service and its technicians from liability for damage to the safe or its contents.\n4. I confirm I am the lawful owner or have legal authorization.\n5. I agree to pay all service fees as quoted.\n\nCustomer Signature: ___________________ Date: __________\nWitness Signature: ___________________ Date: __________'},
    {id:'default_invoice',name:'Simple Invoice',category:'invoice',builtIn:true,
      body:'INVOICE\n\nInvoice #: _______________\nDate: _______________\n\nBill To:\nName: _______________\nAddress: _______________\n\nSERVICE DESCRIPTION                 AMOUNT\n________________________________    _______\n________________________________    _______\n________________________________    _______\n\nSubtotal: $_______________\nTax: $_______________\nTotal: $_______________\n\nPayment: __________________\nThank you! Frantz Locksmith Service · LCO 4160 · (916) 534-4900'},
  ];
  const all = templates.length > 0 ? templates : DEFAULTS;
  if(templates.length===0)localStorage.setItem('sp_contract_templates',JSON.stringify(DEFAULTS));
  const save=(arr)=>{setTemplates(arr);localStorage.setItem('sp_contract_templates',JSON.stringify(arr));};
  const addOrUpdate=()=>{
    if(!name.trim()||!body.trim())return;
    const nt={id:editing||'tmpl_'+Date.now().toString(36),name:name.trim(),body:body.trim(),category:'custom',builtIn:false,updated:new Date().toISOString().split('T')[0]};
    if(editing){save(all.map(t=>t.id===editing?{...t,...nt}:t));}else{save([...all,nt]);}
    setName('');setBody('');setEditing(null);
  };
  const del=(id)=>{const t=all.find(t=>t.id===id);if(t?.builtIn&&!confirm('Remove built-in?'))return;if(!t?.builtIn&&!confirm('Delete?'))return;save(all.filter(t=>t.id!==id));};
  const edit=(t)=>{setEditing(t.id);setName(t.name);setBody(t.body);};
  const filtered=all.filter(t=>!search||t.name.toLowerCase().includes(search.toLowerCase())||t.body.toLowerCase().includes(search.toLowerCase()));
  const inp={width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',fontSize:12,outline:'none'};
  const btn={padding:'6px 14px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#d4a843',fontWeight:600,fontSize:11,cursor:'pointer'};
  return (
    <div className="space-y-3">
      <div style={{color:'#94a3b8',fontSize:11,textAlign:'center'}}>Manage service agreements, waivers, and invoice templates.</div>
      <div style={{borderRadius:8,border:'1px solid #334155',padding:12,background:'#0f1f3d'}}>
        <div><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Name</label><input style={inp} placeholder="Safe Service Agreement" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="mt-2"><label style={{fontSize:10,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:2}}>Body</label>
          <textarea style={{...inp,minHeight:150,fontFamily:'monospace',fontSize:11,lineHeight:1.4,resize:'vertical'}} placeholder="Write template here. Use _______ for fill-in fields." value={body} onChange={e=>setBody(e.target.value)}/></div>
        <div className="flex gap-2 mt-3"><button style={btn} onClick={addOrUpdate}>{editing?'✏️ Update':'➕ Create'}</button>{editing&&<button style={{...btn,background:'#475569',color:'#e2e8f0'}} onClick={()=>{setEditing(null);setName('');setBody('');}}>Cancel</button>}</div>
      </div>
      <input style={inp} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="space-y-2">
        {filtered.length===0&&<div style={{textAlign:'center',color:'#64748b',fontSize:12,padding:20}}>No templates.</div>}
        {filtered.map(t=>(
          <div key={t.id} style={{borderRadius:6,border:'1px solid #334155',background:'#1a1f2e',overflow:'hidden'}}>
            <div style={{padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #334155'}}>
              <div className="flex-1"><div style={{fontWeight:600,fontSize:13,color:'#e2e8f0',display:'flex',alignItems:'center',gap:4}}>
                {t.builtIn?'📄':'📝'}{t.name}{t.builtIn&&<span style={{fontSize:9,color:'#94a3b8',background:'#334155',padding:'1px 6px',borderRadius:4}}>built-in</span>}</div>
                <div style={{fontSize:9,color:'#64748b'}}>{t.category}</div></div>
              <div className="flex gap-1"><button onClick={()=>setPreviewId(previewId===t.id?null:t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#8be9fd',fontSize:11}}>{previewId===t.id?'▲':'👁️'}</button>
              <button onClick={()=>edit(t)} style={{background:'none',border:'none',cursor:'pointer',color:'#60a5fa',fontSize:11}}>✏️</button>
              <button onClick={()=>del(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:11}}>🗑️</button></div>
            </div>
            {previewId===t.id&&<div style={{padding:'8px 10px',background:'#0a0f1a',fontFamily:'monospace',fontSize:10,lineHeight:1.3,color:'#cbd5e1',whiteSpace:'pre-wrap',maxHeight:250,overflowY:'auto'}}>{t.body}</div>}
          </div>))}
      </div>
    </div>
  );
}


function FeaturesPanel({ cfg, setCfg, setSaved }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(prev => ({...prev, [id]: !prev[id]}));

  const renderSwitch = (key, checked) => (
    <label style={{position:'relative',display:'inline-block',cursor:'pointer',flexShrink:0}}>
      <input type="checkbox" style={{display:'none'}} checked={checked}
        onChange={e=>{const n={...cfg};n.features={...n.features,[key]:e.target.checked};setCfg(n);setSaved(false);}} />
      <div style={{width:36,height:20,borderRadius:99,background:checked?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
        <div style={{position:'absolute',top:2,left:checked?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
      </div>
    </label>
  );

  const renderItem = (key, title, desc) => {
    const v = cfg.features?.[key];
    return (
      <div key={key} style={{borderRadius:8,border:'1px solid #334155',background:v?'#1e293b':'#1a1f2e',padding:10,display:'flex',alignItems:'center',justifyContent:'space-between',opacity:v?1:0.55,marginBottom:4}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:13,color:v?'#fff':'#94a3b8'}}>{title}</div>
          <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{desc}</div>
        </div>
        {renderSwitch(key, v)}
      </div>
    );
  };

  const sections = [
    {
      id:'core', label:'Tier 1 — Core (Free)', color:'#50fa7b', icon:'🆓',
      items:[
        ['showPhotoUpload','📸 Photo Upload','Customer can attach photos of the safe'],
        ['showMapCalculator','🗺️ Map & Fee Calc','Distance & trip fee calculator'],
        ['showBatteryPopup','🔋 Battery Popup','Battery warning popup for electronic locks'],
        ['serviceNotesToggle','📝 Show Service Notes','Toggle: show/hide Service Notes card on step 6 cost framework'],
        ['showTechnicianReport','📋 Tech Report','Generate & view technician report'],
        ['showInstructions','📖 Instructions','Show instructions panel'],
        ['showDarkModeToggle','🌙 Dark Mode Toggle','Switch between light/dark themes'],
        ['showQaSection','❓ Q&A Section','Knowledge base Q&A section'],
        ['showTriageHistory','📜 Triage History','Customer lookup & past triage log'],
        ['showCopyReport','📋 Copy Report','One-tap copy report to clipboard'],
        ['showPdfExport','📄 PDF Export','Download report as PDF'],
        ['showCauseLibrary','📚 Cause Library','Admin editor for cause library'],
        ['showTechStatus','🚚 Tech Status','Arrival/completion status tracking'],
      ]
    },
    {
      id:'marketing', label:'Tier 2 — Marketing ($29/mo)', color:'#8be9fd', icon:'📢',
      items:[
        ['showDispatchEmail','📧 Email Dispatch','Send dispatch emails via EmailJS'],
        ['showDispatchSms','📱 SMS Dispatch','Send dispatch SMS notifications'],
        ['showReviewRequests','⭐ Review Requests','Auto-request Google/Yelp reviews'],
      ],
    },
    {
      id:'pro', label:'Tier 3 — Pro ($59/mo)', color:'#ffb86c', icon:'💼',
      items:[
        ['showEstimates','📝 Estimates','Create & email service estimates'],
        ['showInvoicing','🧾 Invoicing','Generate & send invoices to customers'],
        ['showReceipts','🧾 Receipts','Payment receipts for completed jobs'],
        ['showCustomerPortal','🔐 Customer Portal','Customer login to view past reports'],
        ['showScheduling','📅 Scheduling','Calendar booking integration'],
        ['showLeadSourceTracking','📊 Lead Sources','Where leads come from (referral, web, call)'],
        ['showLaborServices','🔧 Labor & Services','Labor categories with hourly rates'],
        ['showPartsCatalog','🔩 Parts Catalog','Manage parts & pricing catalog'],
        ['showContractTemplates','📄 Contract Templates','Service agreement templates'],
        ['showCustomerNotifications','🔔 Customer Notifications','Auto SMS/email status updates'],
      ]
    },
    {
      id:'allinone', label:'Tier 4 — All-in-One ($99/mo)', color:'#ff5555', icon:'👑',
      items:[
        ['showStripePayments','💳 Stripe Payments','Accept credit card payments online'],
        ['showAccountingExport','📊 Accounting Export','QuickBooks/CSV export'],
        ['showInventory','📦 Inventory','Track parts used per job'],
        ['showAnalytics','📈 Analytics','Dashboard charts & metrics'],
        ['showUserRoles','👥 User Roles','Role-based access (admin, tech, dispatcher, customer)'],
        ['showAuditLog','📋 Audit Log','Track all actions & changes in the system'],
        ['showTaxCalculator','💰 Tax Calculator','Auto-calculate sales tax per location'],
        ['showDiscountCoupons','🎫 Discounts & Coupons','Promo codes & discount management'],
        ['showCommissionTracking','💵 Commission Tracking','Per-job tech commissions'],
        ['showVehicleTracking','🚐 Vehicle Tracking','Tech vehicle assignment & tracking'],
        ['showTimesheets','⏱️ Timesheets','Tech clock-in/out & hours tracking'],
        ['showPurchaseOrders','📋 Purchase Orders','PO management for supplies'],
        ['showVendorDirectory','🏪 Vendor Directory','Supply vendor contact management'],
        ['showEquipmentChecklist','✅ Equip Checklist','Pre-job equipment checklist for techs'],
        ['showCertificationTracking','🎓 Certifications','Tech license & cert expiration tracking'],
        ['showMarketingEmails','📧 Marketing Emails','Campaign email blasts to customer list'],
        ['showLoyaltyProgram','💎 Loyalty Program','Points & rewards for repeat customers'],
        ['showIntegrations','🔌 Integrations','API keys & third-party connections panel'],
        ['showDemoMode','🏪 Demo Mode','Show mock business data for sales demos'],
        ['showMultiLanguage','🌐 Multi-Language','Spanish & other language support'],
      ]
    },
    {
      id:'extras', label:'🎯 Extras (Available to All Paid Subscribers)', color:'#ff79c6', icon:'🎯',
      isExtras: true,
      addons:[
        { key:'showSocialComposer', title:'📱 Social Media Post Composer', desc:'(+$10/mo) Create & schedule posts to Facebook, Instagram, LinkedIn, X, YouTube, TikTok — standalone subscription extra', alwaysOn: false },
        { key:'showTestimonialsGallery', title:'🎬 Video Testimonials Gallery', desc:'(+$10/mo) Collect, approve & display video/photo testimonials with customer review wall — standalone subscription extra', alwaysOn: false },
      ]
    }
  ];

  return (
    <div>
      <div className="mb-3" style={{color:'#94a3b8',fontSize:'12px',textAlign:'center'}}>
        Feature toggles organized by tier. Click a section header to expand/collapse.
      </div>
      {sections.map(sec => (
        <div key={sec.id} style={{marginBottom:12,borderRadius:10,border:'1px solid #2a3a5a',overflow:'hidden'}}>
          {/* Header */}
          <div onClick={() => toggle(sec.id)}
            style={{
              padding:'10px 14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between',
              background: expanded[sec.id] ? '#1a2a4a' : '#0f1f3d', userSelect:'none',
              borderBottom: expanded[sec.id] ? '1px solid #2a3a5a' : 'none'
            }}>
            <div className="flex items-center gap-2">
              <span style={{fontSize:'16px'}}>{sec.icon}</span>
              <span style={{fontWeight:700,fontSize:'14px',color:sec.color}}>{sec.label}</span>
            </div>
            <span style={{color:'#6272a4',fontSize:'12px'}}>{expanded[sec.id] ? '▲' : '▼'}</span>
          </div>

          {expanded[sec.id] && (
            <div style={{padding:'8px'}}>
              {/* Main items */}
              {sec.items && sec.items.length > 0 && sec.items.map(([k, t, d]) => renderItem(k, t, d))}

              {/* Add-ons */}
              {sec.addons && sec.addons.length > 0 && (
                <div style={{marginTop: sec.items && sec.items.length > 0 ? 8 : 0, marginBottom:4}}>
                  {sec.isExtras ? (
                    <div style={{fontSize:'11px',fontWeight:600,color:'#ff79c6',textTransform:'uppercase',letterSpacing:'1px',marginBottom:8}}>🎯 Standalone Extras — Available with any paid subscription</div>
                  ) : (
                    <div style={{fontSize:'11px',fontWeight:600,color:'#d4a843',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>✨ Add-ons</div>
                  )}
                  {sec.addons.map(addon => (
                    <div key={addon.key} style={{borderRadius:8,border:'1px dashed #d4a843',background:'#1a1f2e',padding:10,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:13,color:'#e8edf5'}}>{addon.title}</div>
                        <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{addon.desc}</div>
                      </div>
                      {renderSwitch(addon.key, cfg.features?.[addon.key])}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
