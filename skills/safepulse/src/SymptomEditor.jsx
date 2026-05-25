import React, { useState } from 'react';

const emptySymptom = () => ({
  id: '',
  label: '',
  points: 20,
  recommendation: '',
  causes: [''],
  remedy: '',
  note: '',
  parts: ['']
});

export default function SymptomEditor({ onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load symptoms from window (injected by app)
  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('safepulse_symptoms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return window.__safepulseSymptomGroups || [];
  });

  const save = () => {
    localStorage.setItem('safepulse_symptoms', JSON.stringify(groups));
    window.__safepulseSymptomGroups = groups;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const downloadSymptoms = () => {
    const blob = new Blob([JSON.stringify(groups, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safepulse-symptoms.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addCategory = () => {
    const name = prompt('New category name:');
    if (!name) return;
    setGroups([...groups, { category: name, symptoms: [] }]);
  };

  const removeCategory = (idx) => {
    if (!confirm(`Remove "${groups[idx].category}" and all its symptoms?`)) return;
    setGroups(groups.filter((_, i) => i !== idx));
    if (activeTab === idx) setActiveTab(0);
    else if (activeTab > idx) setActiveTab(activeTab - 1);
  };

  const renameCategory = (idx) => {
    const name = prompt('Category name:', groups[idx].category);
    if (!name) return;
    const updated = [...groups];
    updated[idx] = { ...updated[idx], category: name };
    setGroups(updated);
  };

  const addSymptom = (groupIdx) => {
    const id = prompt('Symptom ID (e.g. dial_stuck):', 'new_symptom_' + Date.now());
    if (!id) return;
    const label = prompt('Symptom label (display name):', 'New Symptom');
    if (!label) return;
    const updated = [...groups];
    updated[groupIdx] = {
      ...updated[groupIdx],
      symptoms: [...updated[groupIdx].symptoms, { id, label, points: 20, recommendation: 'Describe the recommended action here.', causes: [''], remedy: '', note: '', parts: [''] }]
    };
    setGroups(updated);
  };

  const removeSymptom = (groupIdx, symptomIdx) => {
    if (!confirm(`Remove "${groups[groupIdx].symptoms[symptomIdx].label}"?`)) return;
    const updated = [...groups];
    updated[groupIdx] = {
      ...updated[groupIdx],
      symptoms: updated[groupIdx].symptoms.filter((_, i) => i !== symptomIdx)
    };
    setGroups(updated);
    if (activeSymptom === symptomIdx) setActiveSymptom(null);
  };

  const updateSymptomField = (groupIdx, symptomIdx, field, value) => {
    const updated = [...groups];
    updated[groupIdx].symptoms[symptomIdx] = { ...updated[groupIdx].symptoms[symptomIdx], [field]: value };
    setGroups(updated);
  };

  const moveSymptom = (groupIdx, symptomIdx, direction) => {
    const symptoms = [...groups[groupIdx].symptoms];
    const target = symptomIdx + direction;
    if (target < 0 || target >= symptoms.length) return;
    [symptoms[symptomIdx], symptoms[target]] = [symptoms[target], symptoms[symptomIdx]];
    const updated = [...groups];
    updated[groupIdx] = { ...updated[groupIdx], symptoms };
    setGroups(updated);
    setActiveSymptom(target);
  };

  const moveCategory = (idx, direction) => {
    const target = idx + direction;
    if (target < 0 || target >= groups.length) return;
    const updated = [...groups];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setGroups(updated);
    setActiveTab(target);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="py-8 px-4 min-h-screen">
        <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Symptom Editor</h2>
            <button onClick={onClose} className="rounded-full bg-primary text-white px-5 py-2 text-sm font-bold hover:bg-primary-hover shadow">
              Done
            </button>
          </div>

          {/* Main layout */}
          <div className="flex flex-col md:flex-row">
            {/* Category sidebar */}
            <div className="w-full md:w-64 border-r border-slate-100 p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Categories</p>
                <button onClick={addCategory} className="text-xs bg-primary text-white rounded-full px-3 py-1 hover:bg-primary-hover">+ Add</button>
              </div>
              {groups.map((group, idx) => (
                <div key={idx} className={`rounded-xl p-2 text-sm cursor-pointer transition-colors ${activeTab === idx ? 'bg-primary text-accent' : 'hover:bg-slate-100'}`}>
                  <div className="flex items-center justify-between" onClick={() => { setActiveTab(idx); setActiveSymptom(null); }}>
                    <span className="font-medium truncate">{group.category}</span>
                    <span className="text-xs opacity-60">{group.symptoms.length}</span>
                  </div>
                  <div className="flex gap-1 mt-1 ml-1">
                    <button onClick={(e) => { e.stopPropagation(); moveCategory(idx, -1); }} className={`text-xs px-1 ${activeTab === idx ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`} disabled={idx === 0}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveCategory(idx, 1); }} className={`text-xs px-1 ${activeTab === idx ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`} disabled={idx === groups.length - 1}>↓</button>
                    <button onClick={(e) => { e.stopPropagation(); renameCategory(idx); }} className="text-xs text-slate-400 hover:text-slate-600 ml-1">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); removeCategory(idx); }} className="text-xs text-red-400 hover:text-red-600 ml-1">×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Symptom list and editor */}
            <div className="flex-1 p-4">
              {groups.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No categories yet. Click "+ Add" to create one.</p>
              ) : (
                <>
                  {/* Symptom list */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700">{groups[activeTab]?.category || 'Select a category'}</p>
                    <button onClick={() => addSymptom(activeTab)} className="text-xs bg-primary text-white rounded-full px-3 py-1 hover:bg-primary-hover">+ Symptom</button>
                  </div>

                  {(!groups[activeTab]?.symptoms || groups[activeTab].symptoms.length === 0) ? (
                    <p className="text-sm text-slate-400 text-center py-6">No symptoms in this category. Click "+ Symptom" to add one.</p>
                  ) : (
                    <div className="space-y-1 mb-4">
                      {groups[activeTab].symptoms.map((sym, idx) => (
                        <div key={idx}
                          onClick={() => setActiveSymptom(idx)}
                          className={`flex items-center justify-between rounded-xl p-2 cursor-pointer text-sm transition-colors ${
                            activeSymptom === idx ? 'bg-slate-100 border border-slate-300' : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-400 text-xs w-5 shrink-0">#{idx + 1}</span>
                            <span className="font-medium truncate">{sym.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              sym.points >= 35 ? 'bg-red-100 text-red-700' : sym.points >= 25 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>{sym.points}pts</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); moveSymptom(activeTab, idx, -1); }} className="text-xs text-slate-400 hover:text-slate-600" disabled={idx === 0}>↑</button>
                            <button onClick={(e) => { e.stopPropagation(); moveSymptom(activeTab, idx, 1); }} className="text-xs text-slate-400 hover:text-slate-600" disabled={idx === groups[activeTab].symptoms.length - 1}>↓</button>
                            <button onClick={(e) => { e.stopPropagation(); removeSymptom(activeTab, idx); }} className="text-xs text-red-400 hover:text-red-600 ml-1">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Symptom detail editor */}
                  {activeSymptom !== null && groups[activeTab]?.symptoms[activeSymptom] && (
                    <div className="rounded-xl border p-4 space-y-3 bg-slate-50">
                      <p className="font-semibold text-sm text-slate-700">Edit Symptom</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="admin-label">ID</label>
                          <input className="admin-input font-mono text-xs" value={groups[activeTab].symptoms[activeSymptom].id}
                            onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'id', e.target.value)} />
                        </div>
                        <div>
                          <label className="admin-label">Label</label>
                          <input className="admin-input" value={groups[activeTab].symptoms[activeSymptom].label}
                            onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'label', e.target.value)} />
                        </div>
                        <div>
                          <label className="admin-label">Risk Points</label>
                          <input className="admin-input" type="number" min="0" max="100" value={groups[activeTab].symptoms[activeSymptom].points}
                            onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'points', parseInt(e.target.value) || 0)} />
                        </div>
                      </div>

                      {/* Triage recommendation */}
                      <div>
                        <label className="admin-label">Triage Recommendation</label>
                        <textarea className="admin-input min-h-[60px]" value={groups[activeTab].symptoms[activeSymptom].recommendation}
                          onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'recommendation', e.target.value)} />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="admin-label">Note (background context)</label>
                        <textarea className="admin-input min-h-[60px]" value={groups[activeTab].symptoms[activeSymptom].note || ''}
                          onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'note', e.target.value)} />
                      </div>

                      {/* Causes */}
                      <div>
                        <label className="admin-label">Possible Causes</label>
                        <div className="space-y-1">
                          {(groups[activeTab].symptoms[activeSymptom].causes || ['']).map((cause, ci) => (
                            <div key={ci} className="flex gap-2 items-center">
                              <input className="admin-input flex-1" value={cause}
                                onChange={(e) => {
                                  const causes = [...(groups[activeTab].symptoms[activeSymptom].causes || [''])];
                                  causes[ci] = e.target.value;
                                  updateSymptomField(activeTab, activeSymptom, 'causes', causes);
                                }} />
                              <button className="text-xs text-red-400 hover:text-red-600 shrink-0" onClick={() => {
                                const causes = groups[activeTab].symptoms[activeSymptom].causes.filter((_, i) => i !== ci);
                                updateSymptomField(activeTab, activeSymptom, 'causes', causes.length ? causes : ['']);
                              }}>×</button>
                              <button className="text-xs text-green-500 hover:text-green-700 shrink-0" onClick={() => {
                                const causes = [...groups[activeTab].symptoms[activeSymptom].causes, ''];
                                updateSymptomField(activeTab, activeSymptom, 'causes', causes);
                              }}>+</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Remedy */}
                      <div>
                        <label className="admin-label">Suggested Remedy</label>
                        <textarea className="admin-input min-h-[60px]" value={groups[activeTab].symptoms[activeSymptom].remedy}
                          onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'remedy', e.target.value)} />
                      </div>

                      {/* Parts */}
                      <div>
                        <label className="admin-label">Parts / Tools to Bring</label>
                        <div className="space-y-1">
                          {(groups[activeTab].symptoms[activeSymptom].parts || ['']).map((part, pi) => (
                            <div key={pi} className="flex gap-2 items-center">
                              <input className="admin-input flex-1" value={part}
                                onChange={(e) => {
                                  const parts = [...(groups[activeTab].symptoms[activeSymptom].parts || [''])];
                                  parts[pi] = e.target.value;
                                  updateSymptomField(activeTab, activeSymptom, 'parts', parts);
                                }} />
                              <button className="text-xs text-red-400 hover:text-red-600 shrink-0" onClick={() => {
                                const parts = groups[activeTab].symptoms[activeSymptom].parts.filter((_, i) => i !== pi);
                                updateSymptomField(activeTab, activeSymptom, 'parts', parts.length ? parts : ['']);
                              }}>×</button>
                              <button className="text-xs text-green-500 hover:text-green-700 shrink-0" onClick={() => {
                                const parts = [...groups[activeTab].symptoms[activeSymptom].parts, ''];
                                updateSymptomField(activeTab, activeSymptom, 'parts', parts);
                              }}>+</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              {saved ? '✓ Changes saved' : 'Changes saved locally. Download to deploy.'}
            </p>
            <div className="flex gap-2">
              <button onClick={downloadSymptoms} className="border border-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                Download JSON
              </button>
              <button onClick={save} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-hover shadow transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
