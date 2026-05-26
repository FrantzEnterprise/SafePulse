import React, { useState } from 'react';
import SymptomEditor from './SymptomEditor';

const tabMeta = [
  { id:'branding', label:'Branding', icon:'🎨' },
  { id:'company', label:'Company', icon:'🏢' },
  { id:'service', label:'Service', icon:'📍' },
  { id:'features', label:'Features', icon:'⚙️' },
  { id:'qa', label:'Q&A', icon:'💡' },
  { id:'symptoms', label:'Symptoms', icon:'🩺' },
  { id:'integrations', label:'Integrations', icon:'🔌' },
  { id:'export', label:'Export', icon:'📦' },
];

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400';

export default function AdminPanel({ config, updateConfig, onClose }) {
  const [tab, setTab] = useState('branding');
  const [cfg, setCfg] = useState(JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const set = (section, key, val) => {
    const next = { ...cfg };
    if (section === 'root') next[key] = val;
    else next[section] = { ...next[section], [key]: val };
    setCfg(next);
    setSaved(false);
  };

  const save = () => { updateConfig(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const dl = (name, data) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], {type:'application/json'}));
    a.download = name; a.click(); URL.revokeObjectURL(a.href);
  };

  const importSymptoms = () => {
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='.json';
    inp.onchange = e => {
      const f = e.target.files[0]; if(!f) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const d = JSON.parse(ev.target.result);
          if(Array.isArray(d) && d[0]?.category && d[0]?.symptoms) {
            localStorage.setItem('safepulse_symptoms', JSON.stringify(d));
            window.__safepulseSymptomGroups = d;
            window.location.reload();
          } else alert('Invalid format');
        } catch(err) { alert('Parse error: '+err.message); }
      };
      r.readAsText(f);
    };
    inp.click();
  };

  const resetSymptoms = () => {
    if(confirm('Reset all symptoms to defaults?')) {
      localStorage.removeItem('safepulse_symptoms');
      window.location.reload();
    }
  };

  const stats = [
    { label:'Symptoms', value:(window.__safepulseSymptomGroups||[]).flatMap(g=>g.symptoms).length, icon:'🩺' },
    { label:'Categories', value:(window.__safepulseSymptomGroups||[]).length, icon:'📂' },
    { label:'Radius', value:(cfg.serviceArea?.maxRadiusMiles||0)+'mi', icon:'📍' },
  ];

  return (
    <>
      <div className="fixed z-50 inset-0 flex flex-col bg-slate-900/95" style={{overscrollBehavior:'contain'}}>
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1a3a5c] px-3 py-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">⚙️</span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">SafeTriage</div>
              <div className="text-[10px] text-[#d4a843]">Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saved && <span className="text-[10px] text-green-300 font-medium">✓ Saved</span>}
            <button onClick={onClose} className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">✕</button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-px bg-slate-700 overflow-x-auto shrink-0">
          {stats.map((s,i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-2 shrink-0 min-w-0 flex-1">
              <div className="h-7 w-7 rounded-md bg-[#d4a843]/20 flex items-center justify-center text-sm shrink-0">{s.icon}</div>
              <div className="min-w-0">
                <div className="text-base font-bold text-white leading-none">{s.value}</div>
                <div className="text-[9px] text-slate-400 truncate">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-2 pt-2 overflow-x-auto shrink-0 bg-slate-900" style={{WebkitOverflowScrolling:'touch'}}>
          {tabMeta.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                tab===t.id ? 'bg-[#1a3a5c] text-[#d4a843]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}>
              <span className="text-sm">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 pt-2" style={{overscrollBehavior:'contain'}}>
          <div className="max-w-3xl mx-auto space-y-3">

            {tab==='branding' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:'Primary', key:'primaryColor'},
                  {label:'Header BG', key:'headerBg'},
                  {label:'Header Text', key:'headerText'},
                  {label:'Accent', key:'accentColor'},
                  {label:'Accent Hover', key:'accentHover'},
                  {label:'Body Text', key:'bodyTextColor'},
                ].map(item => (
                  <div key={item.key} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <label className="text-[10px] font-medium text-slate-400 uppercase">{item.label}</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" className="h-8 w-10 rounded border-0 cursor-pointer shrink-0"
                        value={cfg.branding[item.key]||'#000000'}
                        onChange={e => set('branding', item.key, e.target.value)} />
                      <input className={inputCls+' text-[11px]'} value={cfg.branding[item.key]||''}
                        onChange={e => set('branding', item.key, e.target.value)} />
                    </div>
                  </div>
                ))}
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                  <label className="text-[10px] font-medium text-slate-400 uppercase">Font</label>
                  <input className={inputCls+' mt-1 text-xs'} value={cfg.branding.fontFamily}
                    onChange={e => set('branding','fontFamily',e.target.value)} />
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 flex items-end gap-2">
                  {['primaryColor','accentColor','headerBg'].map(k => (
                    <div key={k} className="h-8 w-10 rounded border border-slate-600" style={{background:cfg.branding[k]}} />
                  ))}
                </div>
              </div>
            )}

            {tab==='company' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:'Company Name', key:'name', section:'company'},
                  {label:'Tagline', key:'tagline', section:'root'},
                  {label:'Phone', key:'phone', section:'company'},
                  {label:'Email', key:'email', section:'company'},
                  {label:'Address', key:'address', section:'company'},
                  {label:'Logo URL', key:'logoUrl', section:'company'},
                ].map(item => (
                  <div key={item.key} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <label className="text-[10px] font-medium text-slate-400 uppercase">{item.label}</label>
                    <input className={inputCls+' mt-1 text-xs'}
                      placeholder={'Enter '+item.label.toLowerCase()}
                      value={item.section==='root' ? (cfg[item.key]||'') : (cfg.company?.[item.key]||'')}
                      onChange={e => set(item.section==='root'?'root':'company', item.key, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {tab==='service' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-lg border border-slate-700 bg-slate-800 p-3">
                  <label className="text-[10px] font-medium text-slate-400 uppercase">Shop Address</label>
                  <input className={inputCls+' mt-1 text-xs'} value={cfg.serviceArea.shopAddress||''}
                    onChange={e => set('serviceArea','shopAddress',e.target.value)} />
                </div>
                {[
                  {label:'Base Fee ($)', key:'baseFee'},
                  {label:'Miles Included', key:'baseMilesIncluded'},
                  {label:'Per Extra Mile ($)', key:'perExtraMileRate'},
                  {label:'Max Radius (mi)', key:'maxRadiusMiles'},
                ].map(item => (
                  <div key={item.key} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <label className="text-[10px] font-medium text-slate-400 uppercase">{item.label}</label>
                    <input className={inputCls+' mt-1 text-xs'} type="number" step="0.01"
                      value={cfg.serviceArea[item.key]}
                      onChange={e => set('serviceArea', item.key, parseFloat(e.target.value)||0)} />
                  </div>
                ))}
              </div>
            )}

            {tab==='features' && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(cfg.features).filter(([k])=>k!=='maxScoreBeforeLockout').map(([k,v]) => (
                  <div key={k} className="rounded-lg border border-slate-700 bg-slate-800 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white capitalize">
                        {k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()).replace('Qa','Q&A')}
                      </div>
                      <div className="text-[10px] text-slate-400">{v?'On':'Off'}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={v}
                        onChange={e => {
                          const next = {...cfg};
                          next.features = {...next.features, [k]: e.target.checked};
                          setCfg(next); setSaved(false);
                        }} />
                      <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4a843]"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {tab==='qa' && (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">🔗 Knowledge Base</div>
                    <div className="text-[10px] text-slate-400">Show KB button in header</div>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={cfg.features.showQaSection||false}
                      onChange={e => {
                        const next = {...cfg};
                        next.features = {...next.features, showQaSection: e.target.checked};
                        setCfg(next); setSaved(false);
                      }} />
                    <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4a843]"></div>
                  </label>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                  <label className="text-[10px] font-medium text-slate-400 uppercase">KB URL</label>
                  <input className={inputCls+' mt-1 text-xs'} placeholder="https://..."
                    value={cfg.qaUrl||''} onChange={e => set('root','qaUrl',e.target.value)} />
                </div>
              </div>
            )}

            {tab==='symptoms' && (
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
                  <div className="text-sm font-semibold text-white">🩺 Symptom Manager</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Edit, import, export, or reset symptom data</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={()=>setShowEditor(true)}
                    className="rounded-lg bg-[#1a3a5c] px-4 py-2 text-xs font-bold text-[#d4a843]">✏️ Open Editor</button>
                  <button onClick={importSymptoms}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-medium text-slate-300">📥 Import</button>
                  <button onClick={()=>dl('safetriage-symptoms.json', window.__safepulseSymptomGroups||[])}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-medium text-slate-300">📤 Export</button>
                  <button onClick={resetSymptoms}
                    className="rounded-lg border border-red-800/40 px-4 py-2 text-xs font-medium text-red-400">↺ Reset</button>
                </div>
              </div>
            )}

            {tab==='integrations' && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🗺️</span>
                  <div className="text-sm font-semibold text-white">Google Maps API Key</div>
                </div>
                <div className="text-[10px] text-slate-400 mb-2">For address autocomplete and distance calculation</div>
                <input className={inputCls+' text-xs font-mono'} type="password" placeholder="AIzaSy..."
                  value={cfg.googleMapsApiKey||''}
                  onChange={e => set('root','googleMapsApiKey',e.target.value)} />
                <div className="flex items-center gap-2 mt-2">
                  <button className="text-[10px] text-slate-400 underline"
                    onClick={e => {
                      const inp = e.target.closest('div').parentElement.querySelector('input');
                      inp.type = inp.type==='password'?'text':'password';
                      e.target.textContent = inp.type==='password'?'Show':'Hide';
                    }}>Show</button>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener"
                    className="text-[10px] text-blue-400 underline">Get key →</a>
                </div>
              </div>
            )}

            {tab==='export' && (
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
                  <div className="text-sm font-semibold text-white">📦 Export Data</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Download config and symptom files</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={()=>dl('safetriage-config.json', cfg)}
                    className="rounded-lg bg-[#1a3a5c] px-4 py-2 text-xs font-bold text-[#d4a843]">⚙️ Download Config</button>
                  <button onClick={()=>dl('safetriage-symptoms.json', window.__safepulseSymptomGroups||[])}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-medium text-slate-300">🩺 Download Symptoms</button>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex items-center justify-between pt-1 pb-3">
              <div className="text-[10px] text-slate-500">v0.9.x</div>
              <button onClick={save}
                className="rounded-lg bg-[#d4a843] px-5 py-2 text-sm font-bold text-[#1a3a5c]">💾 Save</button>
            </div>

          </div>
        </div>

      </div>

      {showEditor && <SymptomEditor onClose={()=>setShowEditor(false)} />}
    </>
  );
}
