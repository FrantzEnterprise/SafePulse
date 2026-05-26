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
              {Object.entries(cfg.features).filter(([k])=>k!=='maxScoreBeforeLockout').map(([k,v]) => (
                <div key={k} style={{borderRadius:8,border:'1px solid #334155',background:'#1e293b',padding:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:'#fff'}}>
                      {k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()).replace('Qa','Q&A')}
                    </div>
                    <div style={{fontSize:9,color:'#94a3b8'}}>{v?'On':'Off'}</div>
                  </div>
                  <label style={{position:'relative',display:'inline-block',cursor:'pointer'}}>
                    <input type="checkbox" style={{display:'none'}} checked={v}
                      onChange={e=>{const n={...cfg};n.features={...n.features,[k]:e.target.checked};setCfg(n);setSaved(false);}} />
                    <div style={{width:36,height:20,borderRadius:99,background:v?'#d4a843':'#475569',transition:'0.2s',position:'relative'}}>
                      <div style={{position:'absolute',top:2,left:v?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'0.2s'}} />
                    </div>
                  </label>
                </div>
              ))}
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
