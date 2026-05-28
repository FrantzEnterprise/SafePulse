import React, { useState } from 'react';
import SymptomEditor from './SymptomEditor';
import SocialComposer from './SocialComposer';
import TestimonialGallery from './TestimonialGallery';
import TriageHistoryLog from './TriageHistoryLog';

const TABS = [
  { id:'branding', label:'Branding', icon:'🎨' },
  { id:'company', label:'Company', icon:'🏢' },
  { id:'service', label:'Service', icon:'📍' },
  { id:'features', label:'Features', icon:'⚙️' },
  { id:'social', label:'Social', icon:'📢' },
  { id:'testimonials', label:'Testimonials', icon:'🎬' },
  { id:'triagelog', label:'Triage Log', icon:'📜' },
  { id:'qa', label:'Q&A', icon:'💡' },
  { id:'ads', label:'Ads', icon:'📢' },
  { id:'reviews', label:'Reviews', icon:'⭐' },
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
                <LabelledInput label="Base Fee ($)" type="number" step="0.01" value={cfg.serviceArea?.baseFee} onChange={e=>setVal('serviceArea','baseFee',parseFloat(e.target.value)||0)} />
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
                          <div style={{marginTop:4,position:'relative',display:'inline-block'}}>
                            <img src={editForm.imageData} alt="ad preview" style={{maxWidth:'100%',maxHeight:100,borderRadius:6,border:'1px solid #2a3a5a'}} />
                            <button onClick={() => setEditForm({...editForm, imageData: null, fileName: ''})}
                              style={{position:'absolute',top:-6,right:-6,background:'#ff5555',color:'#fff',border:'none',borderRadius:'50%',width:18,height:18,fontSize:10,cursor:'pointer'}}>✕</button>
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
    </div>
  );
}

/* ──────── Tiers Features Panel ──────── */
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
      addons:[
        { key:'showSocialComposer', title:'📱 Social Media Post', desc:'(+$10/mo) Post to Facebook, Instagram, LinkedIn, X, YouTube, TikTok', alwaysOn: false },
        { key:'showTestimonialsGallery', title:'🎬 Video Testimonials', desc:'(+$10/mo) Collect video/photo testimonials with review wall', alwaysOn: false },
      ]
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
              {sec.items.map(([k, t, d]) => renderItem(k, t, d))}

              {/* Add-ons */}
              {sec.addons && sec.addons.length > 0 && (
                <div style={{marginTop:8,marginBottom:4}}>
                  <div style={{fontSize:'11px',fontWeight:600,color:'#d4a843',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>✨ Add-ons</div>
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
