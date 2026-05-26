import React, { useState } from 'react';
import SymptomEditor from './SymptomEditor';

const tabIcons = {
  branding: '🎨',
  company: '🏢',
  service: '📍',
  features: '⚙️',
  qa: '💡',
  symptoms: '🩺',
  integrations: '🔌',
  export: '📦',
};

const tabDescriptions = {
  branding: 'Customize colors, fonts, and visual identity',
  company: 'Business name, contact details, and tagline',
  service: 'Pricing, mileage zones, and service radius',
  features: 'Toggle app features on or off',
  qa: 'Link to your website\'s knowledge base',
  symptoms: 'Manage triage symptoms and categories',
  integrations: 'API keys for external services',
  export: 'Download configuration and data files',
};

export default function AdminPanel({ config, updateConfig, onClose }) {
  const [activeTab, setActiveTab] = useState('branding');
  const [localConfig, setLocalConfig] = useState(JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [showSymptomEditor, setShowSymptomEditor] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);

  const handleChange = (section, key, value) => {
    const updated = { ...localConfig };
    if (section === 'company') updated.company = { ...updated.company, [key]: value };
    else if (section === 'branding') updated.branding = { ...updated.branding, [key]: value };
    else if (section === 'serviceArea') updated.serviceArea = { ...updated.serviceArea, [key]: value };
    else if (section === 'features') updated.features = { ...updated.features, [key]: value };
    else if (section === 'root') updated[key] = value;
    setLocalConfig(updated);
    setSaved(false);
  };

  const saveConfig = () => {
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(localConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safetriage-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSymptomsToRepo = () => {
    const data = window.__safepulseSymptomGroups || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safetriage-symptoms.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSymptoms = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (Array.isArray(data) && data.length > 0 && data[0].category && data[0].symptoms) {
            localStorage.setItem('safepulse_symptoms', JSON.stringify(data));
            window.__safepulseSymptomGroups = data;
            window.location.reload();
          } else {
            alert('Invalid symptom data format. Expected array of { category, symptoms } objects.');
          }
        } catch (err) {
          alert('Failed to parse JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const resetSymptomsToDefault = () => {
    if (!confirm('This will reset all symptoms to the original default set. Are you sure?')) return;
    localStorage.removeItem('safepulse_symptoms');
    window.location.reload();
  };

  const tabs = [
    { id: 'branding', label: 'Branding' },
    { id: 'company', label: 'Company Info' },
    { id: 'service', label: 'Service Area' },
    { id: 'features', label: 'Features' },
    { id: 'qa', label: 'Q&A' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'export', label: 'Export' },
  ];

  const handleInputStyle = {
    base: 'w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 backdrop-blur-sm transition-all duration-200 focus:border-[#d4a843] focus:outline-none focus:ring-2 focus:ring-[#d4a843]/20 hover:border-slate-300',
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <div className="min-h-screen px-4 py-6 flex items-start justify-center">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/50 overflow-hidden" style={{ backdropFilter: 'blur(20px)' }}>
            
            {/* ─── Dashboard Header ─── */}
            <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0f2440] px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[#d4a843]/20 flex items-center justify-center text-sm shadow-inner shrink-0">⚙️</div>
                <div classname="min-w-0">
                  <h2 className="text-base font-bold text-white tracking-tight truncate">SafeTriage Dashboard</h2>
                  <p className="text-[10px] text-[#d4a843]/80 font-medium">Control Center</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full transition-all duration-300 ${saved ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'}`}>
                  {saved ? '✓' : ''}
                </span>
                <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-all duration-200 border border-white/10">
                  ✕
                </button>
              </div>
            </div>

            {/* ─── Quick Stats Bar — Single Horizontal Row ─── */}
            <div className="flex overflow-x-auto gap-px bg-slate-100">
              {[
                { label: 'Symptoms', value: (window.__safepulseSymptomGroups || []).flatMap(g => g.symptoms).length, icon: '🩺', color: 'from-blue-500 to-blue-600' },
                { label: 'Categories', value: (window.__safepulseSymptomGroups || []).length, icon: '📂', color: 'from-purple-500 to-purple-600' },
                { label: 'Brand Colors', value: '7', icon: '🎨', color: 'from-amber-500 to-amber-600' },
                { label: 'Service Radius', value: (localConfig.serviceArea?.maxRadiusMiles || 0) + ' mi', icon: '📍', color: 'from-emerald-500 to-emerald-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white px-3 py-2 flex items-center gap-2 shrink-0 min-w-0">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-sm shadow-sm shrink-0`}>{stat.icon}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-800 leading-none">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate max-w-20">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Body: Tab Buttons with Content Below ─── */}
            <div className="w-full min-w-0">
              {/* Tab buttons — scrollable row */}
              <div className="px-3 pt-3 overflow-x-auto" style={{WebkitOverflowScrolling:'touch'}}>
                <div className="flex gap-2" style={{minWidth:'fit-content'}}>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-[#1a3a5c] text-[#d4a843] shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                      }`}
                    >
                      <span className="text-base">{tabIcons[tab.id]}</span>
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Panel */}
              <div className="p-3 max-h-[60vh] overflow-y-auto overflow-x-hidden">

                {/* Branding */}
                {activeTab === 'branding' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-800 mb-4">🖌️ Core Colors</p>
                        <div className="space-y-3">
                          {[
                            { label: 'Primary', key: 'primaryColor' },
                            { label: 'Header Background', key: 'headerBg' },
                            { label: 'Header Text', key: 'headerText' },
                            { label: 'Accent', key: 'accentColor' },
                            { label: 'Accent Hover', key: 'accentHover' },
                            { label: 'Body Text', key: 'bodyTextColor' },
                          ].map(item => (
                            <div key={item.key} className="flex items-center gap-3">
                              <input type="color" className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                                value={localConfig.branding[item.key] || '#000000'}
                                onChange={(e) => handleChange('branding', item.key, e.target.value)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-600">{item.label}</p>
                                <input className={handleInputStyle.base + ' text-xs mt-0.5'} value={localConfig.branding[item.key] || ''}
                                  onChange={(e) => handleChange('branding', item.key, e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-800 mb-4">🔤 Typography</p>
                        <div className="space-y-4">
                          <div>
                            <label className="admin-label text-xs">Font Family</label>
                            <input className={handleInputStyle.base} value={localConfig.branding.fontFamily}
                              onChange={(e) => handleChange('branding', 'fontFamily', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-slate-800 mb-3">🎨 Color Preview</p>
                          <div className="flex gap-2 flex-wrap">
                            <div className="h-10 w-16 rounded-lg flex items-center justify-center text-[10px] text-white font-medium shadow-sm" style={{ background: localConfig.branding.primaryColor }}>PRI</div>
                            <div className="h-10 w-16 rounded-lg flex items-center justify-center text-[10px] text-white font-medium shadow-sm" style={{ background: localConfig.branding.accentColor }}>ACC</div>
                            <div className="h-10 w-16 rounded-lg flex items-center justify-center text-[10px] text-white font-medium shadow-sm" style={{ background: localConfig.branding.headerBg }}>HDR</div>
                            <div className="h-10 w-16 rounded-lg flex items-center justify-center text-[10px] text-slate-600 font-medium shadow-sm border" style={{ background: localConfig.branding.backgroundColor }}>BG</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Info */}
                {activeTab === 'company' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Company Name', key: 'name', section: 'company' },
                      { label: 'Tagline', key: 'tagline', section: 'root', field: 'tagline' },
                      { label: 'Phone', key: 'phone', section: 'company' },
                      { label: 'Email', key: 'email', section: 'company' },
                      { label: 'Address', key: 'address', section: 'company' },
                      { label: 'Logo URL', key: 'logoUrl', section: 'company' },
                    ].map(item => (
                      <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{item.label}</label>
                        <input className={handleInputStyle.base + ' mt-2'} placeholder={`Enter ${item.label.toLowerCase()}`}
                          value={item.section === 'root' ? (localConfig[item.field || item.key] || '') : (localConfig.company?.[item.key] || '')}
                          onChange={(e) => {
                            if (item.section === 'root') handleChange('root', item.field || item.key, e.target.value);
                            else handleChange('company', item.key, e.target.value);
                          }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Service Area */}
                {activeTab === 'service' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Shop Address</label>
                      <input className={handleInputStyle.base + ' mt-2'} value={localConfig.serviceArea.shopAddress}
                        onChange={(e) => handleChange('serviceArea', 'shopAddress', e.target.value)} />
                    </div>
                    {[
                      { label: 'Base Fee ($)', key: 'baseFee', type: 'number', step: '0.01' },
                      { label: 'Miles Included', key: 'baseMilesIncluded', type: 'number', step: '1' },
                      { label: 'Per Extra Mile ($)', key: 'perExtraMileRate', type: 'number', step: '0.01' },
                      { label: 'Max Radius (mi)', key: 'maxRadiusMiles', type: 'number', step: '1' },
                    ].map(item => (
                      <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{item.label}</label>
                        <input className={handleInputStyle.base + ' mt-2'} type={item.type} step={item.step}
                          value={localConfig.serviceArea[item.key]}
                          onChange={(e) => handleChange('serviceArea', item.key, item.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />
                      </div>
                    ))}
                    <div className="md:col-span-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-blue-800">📐 Mileage Fee Preview</p>
                      <p className="text-xs text-blue-600 mt-1">${localConfig.serviceArea.baseFee} base fee covers {localConfig.serviceArea.baseMilesIncluded} miles. Beyond that: ${localConfig.serviceArea.perExtraMileRate}/mi. Max radius: {localConfig.serviceArea.maxRadiusMiles} mi.</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                {activeTab === 'features' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(localConfig.features).filter(([k]) => k !== 'maxScoreBeforeLockout').map(([key, val]) => (
                      <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace('Qa', 'Q&A')}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{val ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={val}
                            onChange={(e) => {
                              const updated = { ...localConfig };
                              updated.features = { ...updated.features, [key]: e.target.checked };
                              setLocalConfig(updated);
                              setSaved(false);
                            }} />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a3a5c]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Q&A */}
                {activeTab === 'qa' && (
                  <div className="max-w-xl space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">🔗 Show Knowledge Base Link</p>
                        <p className="text-xs text-slate-500 mt-0.5">Displays a "Knowledge Base" button in the app header</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={localConfig.features.showQaSection || false}
                          onChange={(e) => {
                            const updated = { ...localConfig };
                            updated.features = { ...updated.features, showQaSection: e.target.checked };
                            setLocalConfig(updated);
                            setSaved(false);
                          }} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a3a5c]"></div>
                      </label>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Knowledge Base URL</label>
                      <input className={handleInputStyle.base + ' mt-2'} placeholder="https://frantzlocksmithservice.com/knowledge-base"
                        value={localConfig.qaUrl || ''} onChange={(e) => handleChange('root', 'qaUrl', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                {activeTab === 'symptoms' && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-amber-800">🩺 Symptom Manager</p>
                      <p className="text-xs text-amber-700 mt-1">Edit categories, symptoms, risk points, causes, remedies, and parts. All changes save to browser storage.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => setShowSymptomEditor(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1a3a5c] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#0f2440] shadow-sm transition-all duration-200">
                        🖊️ Open Symptom Editor
                      </button>
                      <button onClick={importSymptoms}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200">
                        📥 Import JSON
                      </button>
                      <button onClick={exportSymptomsToRepo}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200">
                        📤 Export as JSON
                      </button>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <button onClick={resetSymptomsToDefault}
                        className="text-sm text-red-500 hover:text-red-700 underline underline-offset-2">
                        ↺ Reset to default symptoms
                      </button>
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {activeTab === 'integrations' && (
                  <div className="space-y-4 max-w-xl">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🗺️</span>
                        <p className="text-sm font-semibold text-slate-800">Google Maps API Key</p>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Needed for address autocomplete and distance calculation. Enable Maps JavaScript API + Places API in Google Cloud Console.</p>
                      <input className={handleInputStyle.base + ' font-mono text-xs'} type="password" placeholder="AIzaSy..."
                        value={localConfig.googleMapsApiKey || ''}
                        onChange={(e) => handleChange('root', 'googleMapsApiKey', e.target.value)} />
                      <div className="flex items-center gap-3 mt-3">
                        <button className="text-xs text-slate-500 hover:text-slate-700 font-medium underline underline-offset-2"
                          onClick={(e) => {
                            const input = e.target.closest('.rounded-xl').querySelector('input');
                            input.type = input.type === 'password' ? 'text' : 'password';
                            e.target.textContent = input.type === 'password' ? 'Show Key' : 'Hide Key';
                          }}>Show Key</button>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2">Get a key →</a>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm opacity-60">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📧</span>
                        <p className="text-sm font-semibold text-slate-800">SMS / Email Provider</p>
                      </div>
                      <p className="text-xs text-slate-500">Coming soon — automated notifications. Currently uses native sms: links.</p>
                    </div>
                  </div>
                )}

                {/* Export */}
                {activeTab === 'export' && (
                  <div className="space-y-4 max-w-lg">
                    <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-emerald-800">📦 Export Data</p>
                      <p className="text-xs text-emerald-700 mt-1">Download config and symptom files to deploy to your server or GitHub.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={downloadConfig}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1a3a5c] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#0f2440] shadow-sm transition-all duration-200">
                        ⚙️ Download Config
                      </button>
                      <button onClick={exportSymptomsToRepo}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200">
                        🩺 Download Symptoms
                      </button>
                    </div>
                  </div>
                )}

                </div>
            </div>

            {/* ─── Footer ─── */}
            <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between bg-slate-50/80 gap-2">
              <p className="text-[10px] text-slate-400 truncate">
                SafeTriage v0.9.x
              </p>
              <button onClick={saveConfig}
                className="shrink-0 rounded-lg bg-gradient-to-r from-[#1a3a5c] to-[#0f2440] text-white px-4 py-2 text-xs font-bold hover:from-[#0f2440] hover:to-[#091a30] shadow-sm transition-all duration-200">
                💾 Save
              </button>
            </div>

          </div>
        </div>
      </div>

      {showSymptomEditor && (
        <SymptomEditor onClose={() => setShowSymptomEditor(false)} />
      )}
    </>
  );
}
