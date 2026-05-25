import React, { useState } from 'react';
import SymptomEditor from './SymptomEditor';

export default function AdminPanel({ config, updateConfig, onClose }) {
  const [activeTab, setActiveTab] = useState('branding');
  const [localConfig, setLocalConfig] = useState(JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [showSymptomEditor, setShowSymptomEditor] = useState(false);

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
    a.download = 'safepulse-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSymptomsToRepo = () => {
    const data = window.__safepulseSymptomGroups || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safepulse-symptoms.json';
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
            // Force page reload to pick up new symptoms
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
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'export', label: 'Export' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
        <div className="py-8 px-4 min-h-screen">
          <div className="w-full max-w-3xl mx-auto rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Admin Settings</h2>
              <button onClick={onClose} className="rounded-full bg-primary text-white px-5 py-2 text-sm font-bold hover:bg-primary-hover shadow">
                Done
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-1 p-4 border-b border-slate-100">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">

              {/* Branding */}
              {activeTab === 'branding' && (
                <div className="space-y-4">
                  <div className="admin-section">
                    <label className="admin-label">Primary Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="h-10 w-16 rounded-xl border cursor-pointer" value={localConfig.branding.primaryColor}
                        onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)} />
                      <input className="admin-input flex-1" value={localConfig.branding.primaryColor}
                        onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Header Background</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="h-10 w-16 rounded-xl border cursor-pointer" value={localConfig.branding.headerBg}
                        onChange={(e) => handleChange('branding', 'headerBg', e.target.value)} />
                      <input className="admin-input flex-1" value={localConfig.branding.headerBg}
                        onChange={(e) => handleChange('branding', 'headerBg', e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Header Text Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="h-10 w-16 rounded-xl border cursor-pointer" value={localConfig.branding.headerText}
                        onChange={(e) => handleChange('branding', 'headerText', e.target.value)} />
                      <input className="admin-input flex-1" value={localConfig.branding.headerText}
                        onChange={(e) => handleChange('branding', 'headerText', e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Accent Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="h-10 w-16 rounded-xl border cursor-pointer" value={localConfig.branding.accentColor}
                        onChange={(e) => handleChange('branding', 'accentColor', e.target.value)} />
                      <input className="admin-input flex-1" value={localConfig.branding.accentColor}
                        onChange={(e) => handleChange('branding', 'accentColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Accent Hover Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="h-10 w-16 rounded-xl border cursor-pointer" value={localConfig.branding.accentHover || localConfig.branding.accentColor}
                        onChange={(e) => handleChange('branding', 'accentHover', e.target.value)} />
                      <input className="admin-input flex-1" value={localConfig.branding.accentHover || localConfig.branding.accentColor}
                        onChange={(e) => handleChange('branding', 'accentHover', e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Body Text Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" className="h-10 w-16 rounded-xl border cursor-pointer" value={localConfig.branding.bodyTextColor || '#4a4f55'}
                        onChange={(e) => handleChange('branding', 'bodyTextColor', e.target.value)} />
                      <input className="admin-input flex-1" value={localConfig.branding.bodyTextColor || '#4a4f55'}
                        onChange={(e) => handleChange('branding', 'bodyTextColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Font Family</label>
                    <input className="admin-input" value={localConfig.branding.fontFamily}
                      onChange={(e) => handleChange('branding', 'fontFamily', e.target.value)} />
                  </div>
                  <div className="rounded-xl border p-4 bg-slate-50">
                    <p className="admin-label mb-3">Color Preview</p>
                    <div className="flex gap-3 flex-wrap">
                      <div className="h-10 w-20 rounded-xl flex items-center justify-center text-xs text-white" style={{ background: localConfig.branding.primaryColor }}>Primary</div>
                      <div className="h-10 w-20 rounded-xl flex items-center justify-center text-xs text-white" style={{ background: localConfig.branding.accentColor }}>Accent</div>
                      <div className="h-10 w-20 rounded-xl flex items-center justify-center text-xs text-white" style={{ background: localConfig.branding.headerBg }}>Header</div>
                      <div className="h-10 w-20 rounded-xl border flex items-center justify-center text-xs" style={{ background: localConfig.branding.backgroundColor }}>BG</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Info */}
              {activeTab === 'company' && (
                <div className="space-y-4">
                  <div className="admin-section">
                    <label className="admin-label">Company Name</label>
                    <input className="admin-input" value={localConfig.company.name}
                      onChange={(e) => handleChange('company', 'name', e.target.value)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Tagline</label>
                    <input className="admin-input" placeholder="Sacramento's Safe Specialist — Mobile Service Since 1985" value={localConfig.tagline || ''}
                      onChange={(e) => handleChange('root', 'tagline', e.target.value)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Phone</label>
                    <input className="admin-input" value={localConfig.company.phone}
                      onChange={(e) => handleChange('company', 'phone', e.target.value)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Email</label>
                    <input className="admin-input" value={localConfig.company.email}
                      onChange={(e) => handleChange('company', 'email', e.target.value)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Address</label>
                    <input className="admin-input" value={localConfig.company.address}
                      onChange={(e) => handleChange('company', 'address', e.target.value)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Logo URL (optional)</label>
                    <input className="admin-input" placeholder="https://yourwebsite.com/logo.png" value={localConfig.company.logoUrl}
                      onChange={(e) => handleChange('company', 'logoUrl', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Service Area */}
              {activeTab === 'service' && (
                <div className="space-y-4">
                  <div className="admin-section">
                    <label className="admin-label">Shop Address</label>
                    <input className="admin-input" value={localConfig.serviceArea.shopAddress}
                      onChange={(e) => handleChange('serviceArea', 'shopAddress', e.target.value)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Base Fee ($)</label>
                    <input className="admin-input" type="number" step="0.01" value={localConfig.serviceArea.baseFee}
                      onChange={(e) => handleChange('serviceArea', 'baseFee', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Miles Included in Base Fee</label>
                    <input className="admin-input" type="number" step="1" value={localConfig.serviceArea.baseMilesIncluded}
                      onChange={(e) => handleChange('serviceArea', 'baseMilesIncluded', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Per Extra Mile Rate ($)</label>
                    <input className="admin-input" type="number" step="0.01" value={localConfig.serviceArea.perExtraMileRate}
                      onChange={(e) => handleChange('serviceArea', 'perExtraMileRate', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">Max Service Radius (miles)</label>
                    <input className="admin-input" type="number" step="1" value={localConfig.serviceArea.maxRadiusMiles}
                      onChange={(e) => handleChange('serviceArea', 'maxRadiusMiles', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              )}

              {/* Features */}
              {activeTab === 'features' && (
                <div className="space-y-4">
                  {Object.entries(localConfig.features).map(([key, val]) => (
                    <div key={key} className="admin-section flex items-center justify-between">
                      <label className="capitalize font-medium text-sm text-slate-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={val}
                          onChange={(e) => {
                            const updated = { ...localConfig };
                            updated.features = { ...updated.features, [key]: e.target.checked };
                            setLocalConfig(updated);
                            setSaved(false);
                          }} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Symptoms */}
              {activeTab === 'symptoms' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Edit symptom categories, individual symptoms, risk points, notes, causes, remedies, and parts.
                    Changes are saved to browser storage and used immediately.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowSymptomEditor(true)}
                      className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-hover shadow transition-colors">
                      Open Symptom Editor
                    </button>
                    <button onClick={importSymptoms}
                      className="border border-slate-300 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                      Import JSON
                    </button>
                    <button onClick={exportSymptomsToRepo}
                      className="border border-slate-300 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                      Export as JSON
                    </button>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <button onClick={resetSymptomsToDefault}
                      className="text-sm text-red-500 hover:text-red-700 underline">
                      Reset to default symptoms
                    </button>
                    <p className="text-xs text-slate-400 mt-1">This will clear all custom symptoms and restore the original set.</p>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-3">
                    Add API keys for third-party services. Keys are stored in config and never shared.
                  </p>
                  <div className="admin-section">
                    <label className="admin-label">Google Maps API Key</label>
                    <p className="text-xs text-slate-500 mb-2">Required for address autocomplete and distance calculation. Get one at console.cloud.google.com — enable Maps JavaScript API + Places API.</p>
                    <input
                      className="admin-input font-mono text-xs"
                      type="password"
                      placeholder="AIzaSy..."
                      value={localConfig.googleMapsApiKey || ''}
                      onChange={(e) => handleChange('root', 'googleMapsApiKey', e.target.value)}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="text-xs text-slate-500 hover:text-slate-700 underline"
                        onClick={(e) => {
                          const input = e.target.closest('.admin-section').querySelector('input');
                          input.type = input.type === 'password' ? 'text' : 'password';
                          e.target.textContent = input.type === 'password' ? 'Show' : 'Hide';
                        }}
                      >Show</button>
                      <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Get a key →</a>
                    </div>
                  </div>
                  <div className="admin-section">
                    <label className="admin-label">SMS / Email Provider (coming soon)</label>
                    <p className="text-xs text-slate-500">Future integration for automated notifications. SMS currently uses your phone's native messaging app via sms: links.</p>
                    <input className="admin-input mt-2 text-slate-400" disabled placeholder="API key placeholder for future use" />
                  </div>
                </div>
              )}

              {/* Export */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Download your config and symptom data as JSON files. Upload them to your server or repository to apply changes.
                  </p>
                  <div className="admin-section flex gap-3">
                    <button onClick={downloadConfig} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-hover shadow transition-colors">
                      Download Config
                    </button>
                    <button onClick={exportSymptomsToRepo} className="border border-slate-300 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                      Download Symptoms
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                {saved ? '✓ Changes saved' : 'Changes are saved locally. Download config to deploy.'}
              </p>
              <button onClick={saveConfig} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-hover shadow transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Editor modal */}
      {showSymptomEditor && (
        <SymptomEditor onClose={() => setShowSymptomEditor(false)} />
      )}
    </>
  );
}
