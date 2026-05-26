import React, { useState } from 'react';

const emptySymptom = () => ({
  id: '',
  label: '',
  points: 20,
  recommendation: '',
  causes: [''],
  remedy: '',
  note: '',
  parts: [''],
  triggersBatteryPopup: false,
  triggersDamageWarning: false,
  showPopupOnSelect: false,
  popupTitle: '',
  popupMessage: ''
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
      symptoms: [...updated[groupIdx].symptoms, { id, label, points: 20, recommendation: 'Describe the recommended action here.', causes: [''], remedy: '', note: '', parts: [''], triggersBatteryPopup: false, triggersDamageWarning: false, showPopupOnSelect: false, popupTitle: '', popupMessage: '' }]
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
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{background:'#1e1e2e'}}>
      <div className="py-8 px-4 min-h-screen">
        <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl" style={{background:'#282a36'}}>
          {/* Header */}
          <div className="flex items-center justify-between p-5" style={{borderBottom:'1px solid #44475a'}}>
            <h2 className="text-xl font-bold" style={{color:'#f8f8f2'}}>Symptom Editor</h2>
            <button onClick={onClose} className="rounded-full px-5 py-2 text-sm font-bold shadow" style={{background:'#1a3a5c',color:'#d4a843',border:'none',cursor:'pointer'}}>
              Done
            </button>
          </div>

          {/* Main layout */}
          <div className="flex flex-col md:flex-row">
            {/* Category sidebar */}
            <div className="w-full md:w-64 p-3 space-y-2" style={{borderRight:'1px solid #44475a'}}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide" style={{color:'#6272a4'}}>Categories</p>
                <button onClick={addCategory} className="text-xs rounded-full px-3 py-1" style={{background:'#1a3a5c',color:'#d4a843',border:'none',cursor:'pointer'}}>+ Add</button>
              </div>
              {groups.map((group, idx) => (
                <div key={idx} className="rounded-xl p-2 text-sm cursor-pointer transition-colors" style={{background:activeTab===idx?'#1a3a5c':'transparent',color:activeTab===idx?'#d4a843':'#f8f8f2'}}>
                  <div className="flex items-center justify-between" onClick={() => { setActiveTab(idx); setActiveSymptom(null); }}>
                    <span className="font-medium truncate">{group.category}</span>
                    <span className="text-xs opacity-60">{group.symptoms.length}</span>
                  </div>
                  <div className="flex gap-1 mt-1 ml-1">
                    <button onClick={(e) => { e.stopPropagation(); moveCategory(idx, -1); }} className="text-xs px-1" style={{color:activeTab===idx?'#d4a843':'#6272a4'}} disabled={idx === 0}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveCategory(idx, 1); }} className="text-xs px-1" style={{color:activeTab===idx?'#d4a843':'#6272a4'}} disabled={idx === groups.length - 1}>↓</button>
                    <button onClick={(e) => { e.stopPropagation(); renameCategory(idx); }} className="text-xs ml-1" style={{color:'#6272a4'}}>✎</button>
                    <button onClick={(e) => { e.stopPropagation(); removeCategory(idx); }} className="text-xs ml-1" style={{color:'#ff5555'}}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Symptom list and editor */}
            <div className="flex-1 p-4">
              {groups.length === 0 ? (
                <p className="text-sm text-center py-8" style={{color:'#6272a4'}}>No categories yet. Click "+ Add" to create one.</p>
              ) : (
                <>
                  {/* Symptom list */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{color:'#f8f8f2'}}>{groups[activeTab]?.category || 'Select a category'}</p>
                    <button onClick={() => addSymptom(activeTab)} className="text-xs rounded-full px-3 py-1" style={{background:'#1a3a5c',color:'#d4a843',border:'none',cursor:'pointer'}}>+ Symptom</button>
                  </div>

                  {(!groups[activeTab]?.symptoms || groups[activeTab].symptoms.length === 0) ? (
                    <p className="text-sm text-center py-6" style={{color:'#6272a4'}}>No symptoms in this category. Click "+ Symptom" to add one.</p>
                  ) : (
                    <div className="space-y-1 mb-4">
                      {groups[activeTab].symptoms.map((sym, idx) => (
                        <div key={idx}
                          onClick={() => setActiveSymptom(idx)}
                          className="flex items-center justify-between rounded-xl p-2 cursor-pointer text-sm transition-colors"
                          style={{background:activeSymptom===idx?'#44475a':'transparent',border:activeSymptom===idx?'1px solid #6272a4':'1px solid transparent'}}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs w-5 shrink-0" style={{color:'#6272a4'}}>#{idx + 1}</span>
                            <span className="font-medium truncate" style={{color:'#f8f8f2'}}>{sym.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0`}
                              style={{background:sym.points>=35?'#ff5555':sym.points>=25?'#ffb86c':'#f1fa8c',color:sym.points>=35?'#fff':'#282a36'}}
                            >{sym.points}pts</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); moveSymptom(activeTab, idx, -1); }} className="text-xs" style={{color:'#6272a4'}} disabled={idx === 0}>↑</button>
                            <button onClick={(e) => { e.stopPropagation(); moveSymptom(activeTab, idx, 1); }} className="text-xs" style={{color:'#6272a4'}} disabled={idx === groups[activeTab].symptoms.length - 1}>↓</button>
                            <button onClick={(e) => { e.stopPropagation(); removeSymptom(activeTab, idx); }} className="text-xs ml-1" style={{color:'#ff5555'}}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Symptom detail editor */}
                  {activeSymptom !== null && groups[activeTab]?.symptoms[activeSymptom] && (
                    <div className="rounded-xl p-4 space-y-3" style={{background:'#1e1e2e',border:'1px solid #44475a'}}>
                      <p className="font-semibold text-sm" style={{color:'#f8f8f2'}}>Edit Symptom</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="admin-label-dracula">ID</label>
                          <input className="admin-input-dracula font-mono text-xs" value={groups[activeTab].symptoms[activeSymptom].id}
                            onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'id', e.target.value)} />
                        </div>
                        <div>
                          <label className="admin-label-dracula">Label</label>
                          <input className="admin-input-dracula" value={groups[activeTab].symptoms[activeSymptom].label}
                            onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'label', e.target.value)} />
                        </div>
                        <div>
                          <label className="admin-label-dracula">Risk Points</label>
                          <input className="admin-input-dracula" type="number" min="0" max="100" value={groups[activeTab].symptoms[activeSymptom].points}
                            onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'points', parseInt(e.target.value) || 0)} />
                        </div>
                      </div>

                      {/* Triage recommendation */}
                      <div>
                        <label className="admin-label-dracula">Triage Recommendation</label>
                        <textarea className="admin-input-dracula min-h-[60px]" value={groups[activeTab].symptoms[activeSymptom].recommendation}
                          onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'recommendation', e.target.value)} />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="admin-label-dracula">Note (background context)</label>
                        <textarea className="admin-input-dracula min-h-[60px]" value={groups[activeTab].symptoms[activeSymptom].note || ''}
                          onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'note', e.target.value)} />
                      </div>

                      {/* Causes */}
                      <div>
                        <label className="admin-label-dracula">Possible Causes</label>
                        <div className="space-y-1">
                          {(groups[activeTab].symptoms[activeSymptom].causes || ['']).map((cause, ci) => (
                            <div key={ci} className="flex gap-2 items-center">
                              <input className="admin-input-dracula flex-1" value={cause}
                                onChange={(e) => {
                                  const causes = [...(groups[activeTab].symptoms[activeSymptom].causes || [''])];
                                  causes[ci] = e.target.value;
                                  updateSymptomField(activeTab, activeSymptom, 'causes', causes);
                                }} />
                              <button className="text-xs shrink-0" style={{color:'#ff5555'}} onClick={() => {
                                const causes = groups[activeTab].symptoms[activeSymptom].causes.filter((_, i) => i !== ci);
                                updateSymptomField(activeTab, activeSymptom, 'causes', causes.length ? causes : ['']);
                              }}>×</button>
                              <button className="text-xs shrink-0" style={{color:'#50fa7b'}} onClick={() => {
                                const causes = [...groups[activeTab].symptoms[activeSymptom].causes, ''];
                                updateSymptomField(activeTab, activeSymptom, 'causes', causes);
                              }}>+</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Remedy */}
                      <div>
                        <label className="admin-label-dracula">Suggested Remedy</label>
                        <textarea className="admin-input-dracula min-h-[60px]" value={groups[activeTab].symptoms[activeSymptom].remedy}
                          onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'remedy', e.target.value)} />
                      </div>

                      {/* Parts */}
                      <div>
                        <label className="admin-label-dracula">Parts / Tools to Bring</label>
                        <div className="space-y-1">
                          {(groups[activeTab].symptoms[activeSymptom].parts || ['']).map((part, pi) => (
                            <div key={pi} className="flex gap-2 items-center">
                              <input className="admin-input-dracula flex-1" value={part}
                                onChange={(e) => {
                                  const parts = [...(groups[activeTab].symptoms[activeSymptom].parts || [''])];
                                  parts[pi] = e.target.value;
                                  updateSymptomField(activeTab, activeSymptom, 'parts', parts);
                                }} />
                              <button className="text-xs shrink-0" style={{color:'#ff5555'}} onClick={() => {
                                const parts = groups[activeTab].symptoms[activeSymptom].parts.filter((_, i) => i !== pi);
                                updateSymptomField(activeTab, activeSymptom, 'parts', parts.length ? parts : ['']);
                              }}>×</button>
                              <button className="text-xs shrink-0" style={{color:'#50fa7b'}} onClick={() => {
                                const parts = [...groups[activeTab].symptoms[activeSymptom].parts, ''];
                                updateSymptomField(activeTab, activeSymptom, 'parts', parts);
                              }}>+</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Popup Triggers */}
                      <div className="rounded-xl p-3 space-y-3" style={{background:'#282a36',border:'1px solid #44475a'}}>
                        <p className="font-semibold text-sm flex items-center gap-2" style={{color:'#f8f8f2'}}>🔔 Popup Triggers & Messages</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{color:'#f8f8f2'}}>
                            <input type="checkbox" className="w-4 h-4 accent-amber-500"
                              checked={!!groups[activeTab].symptoms[activeSymptom].triggersBatteryPopup}
                              onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'triggersBatteryPopup', e.target.checked)} />
                            <span>🔋 Battery Popup</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{color:'#f8f8f2'}}>
                            <input type="checkbox" className="w-4 h-4 accent-red-500"
                              checked={!!groups[activeTab].symptoms[activeSymptom].triggersDamageWarning}
                              onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'triggersDamageWarning', e.target.checked)} />
                            <span>⚠️ Damage Warning</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{color:'#f8f8f2'}}>
                            <input type="checkbox" className="w-4 h-4 accent-blue-500"
                              checked={!!groups[activeTab].symptoms[activeSymptom].showPopupOnSelect}
                              onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'showPopupOnSelect', e.target.checked)} />
                            <span>💬 Custom Popup</span>
                          </label>
                        </div>
                        {groups[activeTab].symptoms[activeSymptom].showPopupOnSelect && (
                          <div className="space-y-2 pt-2" style={{borderTop:'1px solid #44475a'}}>
                            <div>
                              <label className="admin-label-dracula">Popup Title</label>
                              <input className="admin-input-dracula" placeholder="e.g. Important Notice" 
                                value={groups[activeTab].symptoms[activeSymptom].popupTitle || ''}
                                onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'popupTitle', e.target.value)} />
                            </div>
                            <div>
                              <label className="admin-label-dracula">Popup Message</label>
                              <textarea className="admin-input-dracula min-h-[60px]" placeholder="Enter the message to show when this symptom is selected..."
                                value={groups[activeTab].symptoms[activeSymptom].popupMessage || ''}
                                onChange={(e) => updateSymptomField(activeTab, activeSymptom, 'popupMessage', e.target.value)} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5" style={{borderTop:'1px solid #44475a'}}>
            <p className="text-sm" style={{color:'#6272a4'}}>
              {saved ? '✓ Changes saved' : 'Changes saved locally. Download to deploy.'}
            </p>
            <div className="flex gap-2">
              <button onClick={downloadSymptoms} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors" style={{border:'1px solid #6272a4',color:'#f8f8f2',background:'transparent',cursor:'pointer'}}>
                Download JSON
              </button>
              <button onClick={save} className="px-6 py-2 rounded-xl text-sm font-bold shadow transition-colors" style={{background:'#d4a843',color:'#1a3a5c',border:'none',cursor:'pointer'}}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
