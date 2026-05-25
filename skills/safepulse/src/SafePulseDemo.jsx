import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// SAFEPOINT v0.5.1 — popup modal for symptom answers
// Each symptom selection shows its result in a clean modal overlay
// instead of scrolling to the bottom mixed with other info.

// ─── SYMPTOM GROUPS ──────────────────────────────────────────────────────────
// Categories: Dial Locks, Electronic Locks, Mechanical Issues, Environmental Issues
// Each symptom includes a note (background/context) and remedies array from your data.

const symptomGroups = [
  {
    category: "Dial Locks",
    symptoms: [
      { id: "dial_stuck", label: "Dial is stuck and will not move!", points: 35, recommendation: "Stuck dial — do not force. Try dialing +/- 1-3 numbers off your combination. Call technician if no success." },
      { id: "dial_sticky_tight", label: "Dial is very sticky and/or tight to turn", points: 20, recommendation: "Sticky dial — try compressed air around dial. If misaligned, tap lightly into place. Wheel pack issue needs new lock." },
      { id: "dial_loose_spin", label: "Dial is loose, seems to spin too easy and will not engage to open", points: 30, recommendation: "Dial loose from wear — try pulling dial toward you while dialing. If it opens, leave it open and call technician." },
      { id: "dial_drag", label: "Dialing the combination, it does not unlock easily and have to dial it multiple times to unlock it", points: 20, recommendation: "Dial not unlocking easily — try dialing slightly over/under target number. Wear will worsen over time." },
      { id: "dial_lost_combo", label: "Lost or forgotten combination, probate, damaged in a burglary, or simply a broken dial lock", points: 40, recommendation: "Lost combination or broken dial lock — technician required to open and repair." },
    ],
  },
  {
    category: "Electronic Locks",
    symptoms: [
      { id: "keypad_no_response", label: "My keypad does not respond when I touch a key", points: 20, recommendation: "Keypad unresponsive — check battery connections, cable to lock, and battery cartridge terminals." },
      { id: "repeating_beep_timeout", label: "I put my combination in 3 times or more and now it beeps every 10 or 15 seconds", points: 25, recommendation: "Lockout beeping — let stop, unplug battery, press all keys, plug back in, re-enter correct combination." },
      { id: "keys_not_register", label: "Some of my keys do not register when I push them", points: 25, recommendation: "Keys not registering — unplug battery, press all keys, replug and retry. Keypad may need replacement." },
      { id: "click_no_release", label: "I put in my combination, hear the solenoid click or motor turn, but the handle will not turn", points: 35, recommendation: "Solenoid clicks but handle won't turn — move handle to neutral, try pushing toward lock and enter combo. Re-locker may have fired." },
      { id: "elec_lost_combo", label: "I lost or forgot my combination", points: 30, recommendation: "Lost electronic combination — technician needed. May be reset, shorted, or drilled depending on lock make." },
    ],
  },
  {
    category: "Mechanical Issues",
    symptoms: [
      { id: "handle_stuck_no_play", label: "Handle is stuck and does not have any play", points: 30, recommendation: "Stuck handle — push handle toward closed position, hold it, enter combo and try to open. Do not force." },
      { id: "handle_spins_no_release", label: "My handle moves or spins but it does not release the bolts to open the door", points: 40, recommendation: "Handle spins but bolts don't release — check setscrew on handle hub. If tight, internal issue needs technician." },
      { id: "handle_resistance", label: "My handle moves a little bit and I feel resistance when trying to open it", points: 25, recommendation: "Handle has resistance — push on door while slowly moving handle to open. Stop if no progress." },
      { id: "door_stops_partial", label: "When opening the safe the door only comes open a little bit and stops", points: 35, recommendation: "Door only opens partway — likely severed bolt connection. Call technician immediately. Do not force." },
      { id: "cannot_lock_safe", label: "I cannot lock my safe! I close it and throw the bolts but they will not lock in place", points: 20, recommendation: "Cannot lock — check for obstruction blocking bolts. Open door 90°, release bolt detent, extend bolts fully." },
    ],
  },
  {
    category: "Environmental Issues",
    symptoms: [
      { id: "no_heater_desiccant", label: "I don't have a heater or desiccant in my safe", points: 10, recommendation: "Install reusable desiccant can or electric safe dryer to protect contents from moisture." },
      { id: "garage_location", label: "I keep my safe in the garage, is that bad?", points: 10, recommendation: "Garage safe — temperature extremes affect locks. Warm with hair dryer in winter, cool with fan in summer." },
      { id: "keypad_wet", label: "I washed my keypad and it does not work right now", points: 15, recommendation: "Keypad wet — let dry fully, use hair dryer on low from distance. If still fails, call technician." },
      { id: "bottom_rust", label: "My safe is rusting at the bottom where it is anchored to the ground. Is that OK?", points: 15, recommendation: "Bottom rust — create water barrier. Excessive rust compromises security. Replace and re-anchor ASAP." },
    ],
  },
];

const symptomOptions = symptomGroups.flatMap((group) => group.symptoms);

const lockTypeVisibility = {
  "Electronic keypad": ["Electronic Locks", "Mechanical Issues", "Environmental Issues"],
  "Mechanical dial": ["Dial Locks", "Mechanical Issues", "Environmental Issues"],
  "Key lock": ["Mechanical Issues", "Environmental Issues"],
  Unknown: symptomGroups.map((group) => group.category),
};

const serviceFramework = {
  low: { laborRange: "$0 - $125", notes: "Issue may be resolved with simple troubleshooting or preventive service." },
  medium: { laborRange: "$150 - $450", notes: "Moderate service may be required depending on lock condition and accessibility." },
  high: { laborRange: "$350 - $950+", notes: "Likely requires onsite safe technician evaluation and possible repair work." },
  urgent: { laborRange: "$500 - $2500+", notes: "Urgent condition with increased risk of lockout, major repair, or specialized service." },
};

const damageRiskTriggers = [
  "handle_stuck_no_play", "handle_spins_no_release", "handle_resistance",
  "door_stops_partial", "dial_stuck", "click_no_release",
];
const batteryTriggers = ["keypad_no_response", "repeating_beep_timeout", "keys_not_register"];

const dispatchRecommendations = {
  Low: { type: "Phone Assistance Recommended", time: "15–30 minutes" },
  Medium: { type: "Standard Service Call Recommended", time: "30–90 minutes" },
  High: { type: "Priority Same-Day Service Recommended", time: "1–3 hours" },
  Urgent: { type: "Emergency Safe Service Recommended", time: "2–6+ hours depending on safe condition" },
};

const photoUploadSlots = [
  { id: "full_safe_photo", label: "Full safe photo", helper: "Stand back and capture the entire safe if possible." },
  { id: "lock_or_keypad_photo", label: "Lock, dial, or keypad photo", helper: "Capture the keypad, dial, or key lock area clearly." },
  { id: "door_edge_photo", label: "Door edge / hinge side photo", helper: "Useful for drag, sag, boltwork, or alignment concerns." },
  { id: "damage_or_corrosion_photo", label: "Damage, rust, or moisture photo", helper: "Show visible corrosion, impact damage, or moisture exposure." },
];

const possibleCauseLibrary = {
  dial_stuck: {
    causes: ["Dial key locked", "Dial knocked off center", "Spindle seized from moisture", "Contents blocking bolt extension"],
    remedy: "Check if dial has a keyhole and is locked. Try dialing +/- 1-3 numbers off combo. If seized from moisture, do not spray chemicals — this can make it worse. Check inside safe for objects blocking bolts when locking.",
    note: "Stuck dials are not an easy fix. Turning the dial too hard can create detrimental issues and increase costs to open and repair.",
    parts: ["Replacement dial", "Spindle components", "Lock case service"],
  },
  dial_sticky_tight: {
    causes: ["Bushing wear in index ring", "Dial misalignment from bump", "Wheel pack contamination", "Dried lubrication"],
    remedy: "Try blowing out debris with compressed air around dial. If bumped out of alignment, tap lightly into place. If wheel pack is the issue, a new lock is needed. Do not oil the bushing — messy and only temporary.",
    note: "This can be an issue with a bushing under the dial in the index ring, a dial misalignment, or an issue in the lock's wheel pack.",
    parts: ["Dial ring/bushing", "Compressed air can", "Replacement lock case"],
  },
  dial_loose_spin: {
    causes: ["Hard usage wear", "Long-term wear", "Drive cam worn", "Engagement teeth stripped"],
    remedy: "Try pulling the dial toward you while you dial. You may feel it pick up the wheels and get it open. If it opens, leave it open and call technician to service the lock.",
    note: "This is not a good sign and indicates wear, either from hard, rough and/or long time usage.",
    parts: ["Replacement dial", "Drive cam assembly", "Lock case rebuild kit"],
  },
  dial_drag: {
    causes: ["Lock wear from age", "Wheel pack friction", "Dried lubrication", "Spindle misalignment"],
    remedy: "Check dialing sequence first. Try dialing slightly over/under target number, or wiggle dial if it skips past engagement. This condition worsens over time — technician needed.",
    note: "If you're dialing the sequence correctly, this is usually caused by wear, your lock will need servicing to repair it.",
    parts: ["Lock case service kit", "Lubrication/graphite", "Wheel pack bushings"],
  },
  dial_lost_combo: {
    causes: ["Lost combination", "Forgotten combination", "Probate/estate safe", "Burglary damage", "Broken dial lock"],
    remedy: "You will need to call the technician to open and repair the safe. A skilled safe technician can get through this, possibly without any damage.",
    note: "Those are always difficult issues, I'm sorry you have to go through this.",
    parts: ["Dial removal tools", "Replacement lock", "Safe opening tools"],
  },
  keypad_no_response: {
    causes: ["Battery wires unplugged", "Keypad cable ruptured", "Battery cartridge terminal issues", "Missing cartridge spring"],
    remedy: "Check battery connections are plugged in. Verify keypad cable to lock body is connected and undamaged. If using battery cartridge, ensure terminals make contact and the cartridge spring is present.",
    note: "There are a few things you can try before you need to call the technician.",
    parts: ["Battery cartridge", "Keypad cable", "9V batteries"],
  },
  repeating_beep_timeout: {
    causes: ["Lockout after 3 incorrect attempts", "Low battery timeout mode", "Temporary keypad lockout"],
    remedy: "Do not unplug the battery. Wait until the beeping stops. Unplug the battery, push all keys on the keypad, plug the battery back in, make sure you have the correct combination, and enter it again.",
    note: "Safe locks usually give you three tries before they go into a time-out.",
    parts: ["Duracell Quantum batteries", "Energizer batteries"],
  },
  keys_not_register: {
    causes: ["Failed keypad", "Keypad membrane worn", "Internal keypad circuit damage", "Battery voltage too low"],
    remedy: "Unplug the battery, push all the keys on the keypad, plug the battery back in, and try again. If this does not work the keypad has likely failed and needs replacement.",
    note: "This is not a good sign, it usually means your keypad failed.",
    parts: ["Replacement keypad", "Keypad cable", "9V batteries"],
  },
  click_no_release: {
    causes: ["Handle off neutral position", "Bolt pressure on lock", "Fired re-locker mechanism", "Internal disconnected linkage"],
    remedy: "Move handle to neutral position first. If handle has no play, push it toward lock direction, hold it, and enter combination. If handle has play and travels past normal, a re-locker may have fired — call technician.",
    note: "Electronic locks can be finicky, first move the handle to a neutral position first.",
    parts: ["Replacement lock body", "Re-locker reset/servicing", "Lock solenoid"],
  },
  elec_lost_combo: {
    causes: ["Lost combination", "Forgotten combination", "Lock memory erased", "Deactivated codes"],
    remedy: "A lost combination cannot be found. Some electronic locks can be reset, some can be shorted, some have to be drilled. It depends on the make of the lock, not the safe manufacturer.",
    note: "A skilled and well equipped Safe Technician can get you through this, and possibly without any damage.",
    parts: ["Lock-specific programming tools", "Replacement lock", "Drill bit (if needed)"],
  },
  handle_stuck_no_play: {
    causes: ["Lock bolt pressure", "Handle clutch engaged", "Internal mechanical bind"],
    remedy: "Push the handle toward the closed position and hold it, then enter the combination and try to open. Do not force the handle to the point the clutch breaks free.",
    note: "Do Not Force the handle to the point the clutch breaks free. Wearing this down will make it more difficult for the technician to open.",
    parts: ["Handle assembly", "Clutch rebuild kit"],
  },
  handle_spins_no_release: {
    causes: ["Loose setscrew on handle hub", "Broken spindle", "Disconnected handle linkage", "Stripped clutch gear"],
    remedy: "Check if your handle has a setscrew on the outer hub — make sure it is tight. If tight and no movement felt, the issue is inside the door and technician needed.",
    note: "Most don't know there are a few parts that can get worn or loose over time and require servicing.",
    parts: ["Setscrew/hex key", "Handle assembly", "Spindle"],
  },
  handle_resistance: {
    causes: ["Boltwork friction", "Door pressure", "Internal mechanical issue", "Warped frame"],
    remedy: "Try to push on the door and slowly move the handle to the opening position. Listen and feel for movement. If nothing changes after a few gentle tries, stop and contact technician.",
    note: "Internal mechanical issues are difficult to open, however, not impossible with minimal or no damage.",
    parts: ["Boltwork components", "Adjustment hardware", "Lubrication materials"],
  },
  door_stops_partial: {
    causes: ["Severed bolt connection", "Broken linkage bar", "Disconnected bolt arm", "Spot weld failure"],
    remedy: "Call the technician right away. The more you play with it the harder it will get to open and repair, take more time, and cost you more.",
    note: "This issue is more likely due to a severed connection to the locking bolts or tabs.",
    parts: ["Linkage bar", "Bolt arm assembly", "Door panel removal tools"],
  },
  cannot_lock_safe: {
    causes: ["Obstruction blocking bolts", "Bolt detent engaged", "Bad bolt detent", "Electronic lock not resetting"],
    remedy: "Check for anything blocking bolt extension. Open door 90 degrees, find the bolt detent release button (hinge side or bottom of door), push to release and extend bolts fully. If it still won't lock, call technician.",
    note: "With an electronic lock it will not reset to locked state if bolts are not fully extended.",
    parts: ["Boltwork adjustment tools", "Detent spring replacement"],
  },
  no_heater_desiccant: {
    causes: ["No moisture protection installed", "High humidity environment", "Condensation inside safe"],
    remedy: "Get a large reusable desiccant can or an electric safe dryer if the safe has an outlet ASAP.",
    note: "Keeping contents in your safe dry is essential or your cherished contents will rust and deteriorate.",
    parts: ["Reusable desiccant can", "Electric safe dryer/rod", "Hygrometer"],
  },
  garage_location: {
    causes: ["Temperature extremes", "Winter freeze", "Summer heat", "Humidity fluctuations"],
    remedy: "If lock fails in winter, warm it with hair dryer or heat gun from distance — don't melt the keypad. If fails in summer, put a fan on it to cool it down.",
    note: "In extreme climates make sure you have a quality lock.",
    parts: ["Quality lock upgrade", "Safe insulation", "Dehumidifier"],
  },
  keypad_wet: {
    causes: ["Water ingress into keypad", "Moisture under membrane", "Short circuit from cleaning"],
    remedy: "Let the keypad dry out completely. Use hair dryer or heat gun on low from a distance and try again. If that fails the keypad may need replacement.",
    note: "You should moisten a cloth to wipe your keypad and not leave any water on it.",
    parts: ["Replacement keypad", "Silicone sealant"],
  },
  bottom_rust: {
    causes: ["Daily mopping in work environment", "Water pooling at base", "Moisture wicking up from floor"],
    remedy: "Create a barrier to repel water away from the safe base. If rust is excessive the safe may be pried upward and removed. Replace and re-anchor a new safe ASAP.",
    note: "This condition exists mostly in working environments where the floor gets mopped daily.",
    parts: ["Water barrier/sealant", "Anchor bolts", "Replacement safe"],
  },
};

function getRisk(score) {
  if (score >= 75) return { level: "Urgent", advice: "Stop repeated attempts and contact a safe technician immediately." };
  if (score >= 50) return { level: "High", advice: "Schedule service soon. Continued use may increase lockout risk." };
  if (score >= 25) return { level: "Medium", advice: "Try basic non-invasive checks, then monitor symptoms closely." };
  return { level: "Low", advice: "Issue may be simple, but continue monitoring for worsening symptoms." };
}

function getSymptomLabel(id) {
  return symptomOptions.find((symptom) => symptom.id === id)?.label || id;
}

function CustomerIntake({ form, setForm }) {
  return (
    <>
      <input className="w-full rounded-xl border p-3" placeholder="Customer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full rounded-xl border p-3" placeholder="Phone or text number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input className="w-full rounded-xl border p-3" placeholder="Safe brand/model if known" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
      <div className="space-y-1">
        <label className="text-sm font-medium">Type of lock</label>
        <select className="w-full rounded-xl border p-3" value={form.lockType} onChange={(e) => setForm({ ...form, lockType: e.target.value })}>
          <option>Electronic keypad</option>
          <option>Mechanical dial</option>
          <option>Key lock</option>
          <option>Unknown</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Is the safe currently open?</label>
        <select className="w-full rounded-xl border p-3" value={form.safeOpen} onChange={(e) => setForm({ ...form, safeOpen: e.target.value })}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Years since last service</label>
        <select className="w-full rounded-xl border p-3" value={form.serviceAge} onChange={(e) => setForm({ ...form, serviceAge: e.target.value })}>
          <option value="">Select service history</option>
          <option value="1">Less than 1 year</option>
          <option value="3">Less than 3 years</option>
          <option value="7">Less than 7 years</option>
          <option value="8">8 years or more</option>
          <option value="50">Antique, 50 years and older</option>
        </select>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3">
          <p className="font-medium text-lg">Before We Begin, What have you already tried?</p>
          <p className="text-sm text-slate-500">This helps avoid repeated troubleshooting steps and improves technician recommendations.</p>
        </div>
        <textarea className="w-full rounded-xl border p-3" placeholder="Describe any steps, battery changes, combinations attempted, or observations." value={form.tried} onChange={(e) => setForm({ ...form, tried: e.target.value })} />
      </div>
    </>
  );
}

function SymptomsSelector({ form, showSymptoms, setShowSymptoms, visibleGroups, triageHistory, toggleSymptom }) {
  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-lg">Symptoms</p>
          <p className="text-sm text-slate-500">Select one symptom at a time. Results update automatically.</p>
        </div>
        <Button variant="outline" onClick={() => setShowSymptoms((current) => !current)}>{showSymptoms ? "Hide Symptoms" : "Select Symptoms"}</Button>
      </div>
      {triageHistory.length > 0 && (
        <div className="rounded-2xl border bg-orange-50 p-3">
          <p className="mb-2 text-sm font-medium text-orange-900">Symptoms Counted Toward Risk</p>
          <div className="flex flex-wrap gap-2">{triageHistory.map((id) => <span key={id} className="rounded-full bg-orange-200 px-3 py-1 text-sm text-orange-950">{getSymptomLabel(id)}</span>)}</div>
          <p className="mt-2 text-xs text-orange-900">These symptoms remain counted even if a selection is removed, so the risk score reflects the full triage history.</p>
        </div>
      )}
      {form.symptoms.length > 0 && (
        <div className="rounded-2xl border bg-white p-3">
          <p className="mb-2 text-sm font-medium text-slate-600">Current Selected Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {form.symptoms.map((id) => <button key={id} onClick={() => toggleSymptom(id)} className="rounded-full bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300" title="Click to remove from current selections">{getSymptomLabel(id)} ×</button>)}
          </div>
        </div>
      )}
      {showSymptoms && (
        <div className="space-y-4 rounded-2xl border bg-slate-50 p-4">
          {symptomGroups.filter((group) => visibleGroups.includes(group.category)).map((group) => (
            <div key={group.category} className="rounded-2xl border bg-white p-4">
              <h3 className="mb-3 font-semibold text-slate-700">{group.category}</h3>
              <div className="space-y-2">
                {group.symptoms.map((symptom) => (
                  <button key={symptom.id} onClick={() => toggleSymptom(symptom.id)} className={`w-full rounded-xl border p-3 text-left text-sm transition hover:bg-slate-100 ${form.symptoms.includes(symptom.id) ? "border-slate-700 bg-slate-200 font-semibold" : "bg-white"}`}>{symptom.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoUpload({ uploadedPhotos, setUploadedPhotos, showPhotoUpload, setShowPhotoUpload }) {
  const attachedCount = Object.values(uploadedPhotos).filter(Boolean).length;
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-lg">Photo Upload</p>
          <p className="text-sm text-slate-500">Optional photos help the technician identify the safe, lock type, and visible issues before arrival.</p>
        </div>
        <Button variant="outline" onClick={() => setShowPhotoUpload((current) => !current)}>{showPhotoUpload ? "Hide Photo Upload" : "Add Photos"}</Button>
      </div>
      {attachedCount > 0 && (
        <div className="mt-3 rounded-2xl border bg-green-50 p-3">
          <p className="mb-2 text-sm font-medium text-green-900">Attached Photos / Videos</p>
          <div className="space-y-1">
            {Object.entries(uploadedPhotos).filter(([, file]) => file).map(([slotId, file]) => {
              const slot = photoUploadSlots.find((item) => item.id === slotId);
              return <p key={slotId} className="text-sm text-green-800">{slot?.label}: {file.name}</p>;
            })}
          </div>
        </div>
      )}
      {showPhotoUpload && (
        <div className="mt-4 space-y-3 rounded-2xl border bg-slate-50 p-4">
          {photoUploadSlots.map((slot) => (
            <div key={slot.id} className="rounded-xl border bg-white p-3">
              <label className="block text-sm font-semibold text-slate-700">{slot.label}</label>
              <p className="mb-2 text-xs text-slate-500">{slot.helper}</p>
              <input type="file" accept="image/*,video/*" className="w-full rounded-lg border bg-white p-2 text-sm" onChange={(e) => setUploadedPhotos({ ...uploadedPhotos, [slot.id]: e.target.files?.[0] || null })} />
              {uploadedPhotos[slot.id] && <p className="mt-2 text-xs font-medium text-green-700">Attached: {uploadedPhotos[slot.id].name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TriageResults({ score, risk, symptomRecommendations, customerDamageRisk, dispatchType, serviceEstimate, calculatedTripFee, possibleCauses, setShowMapCalculator, batteryAttempted, form, setForm }) {
  const riskBannerStyles = {
    Low: "bg-green-100 border-green-300 text-green-800",
    Medium: "bg-yellow-100 border-yellow-300 text-yellow-800",
    High: "bg-orange-100 border-orange-300 text-orange-800",
    Urgent: "bg-red-100 border-red-300 text-red-800",
  };
  return (
    <Card id="triage-results" className="rounded-2xl shadow-sm">
      <CardContent className="space-y-4 p-5">
        <h2 className="text-xl font-semibold">AI Triage Result</h2>
        <div className={`rounded-2xl border p-4 ${riskBannerStyles[risk.level]}`}>
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-sm font-medium uppercase tracking-wide">Safe Status</p><p className="mt-1 text-2xl font-bold">{risk.level === "Low" && "✓ LOW RISK"}{risk.level === "Medium" && "⚠ MODERATE RISK"}{risk.level === "High" && "⚠ HIGH RISK"}{risk.level === "Urgent" && "⛔ URGENT CONDITION"}</p></div>
            <div className="text-right"><p className="text-sm font-medium">Risk Score</p><p className="text-4xl font-bold">{score}/100</p><p className="mt-1 text-lg font-semibold">{risk.level}</p></div>
          </div>
          <p className="mt-3 text-sm font-medium">{risk.advice}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 space-y-3">
          <div><p className="font-semibold">General Recommendation</p><p>{risk.advice}</p></div>
          {symptomRecommendations.length > 0 && <div><p className="font-semibold">Symptom Analysis</p><ul className="ml-5 list-disc text-sm space-y-2">{symptomRecommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        </div>
        {customerDamageRisk && <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900"><div className="flex items-start gap-3"><div className="text-2xl">⚠</div><div><p className="font-semibold">Continued Attempts May Increase Repair Costs</p><p className="mt-1 text-sm">Repeated attempts, excessive handle pressure, or forcing the lock may worsen the condition or create a complete lockout.</p></div></div></div>}
        <div className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Safe Basic Advice</p>
          <ul className="ml-5 list-disc text-sm"><li>Do not force the handle.</li><li>Use fresh Duracell Quantum or Energizer batteries if electronic.</li><li>Do not use cheap batteries or rechargeable batteries.</li><li>Check for door obstruction only if safe is open.</li><li>Stop repeated attempts if symptoms worsen.</li></ul>
        </div>
        <div className="rounded-2xl bg-white p-4 space-y-3">
          <div className="rounded-xl border bg-slate-50 p-4"><p className="text-sm text-slate-500">Recommended Service Type</p><p className="mt-1 text-xl font-bold">{dispatchType.type}</p><p className="mt-2 text-sm text-slate-600">Typical estimated onsite time: {dispatchType.time}</p></div>
          <div><p className="font-semibold text-lg">Possible Service & Cost Framework</p><p className="text-sm text-slate-600">Ballpark estimates only. Final pricing depends on safe type, lock condition, accessibility, parts required, and service complexity.</p></div>
          <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Estimated Service / Trip Fee</p><p className="font-semibold">${calculatedTripFee.toFixed(2)} minimum</p><p className="mt-1 text-xs text-slate-500">Base rate includes first 17 miles. Add $2.50 per mile from mile 18 and up.</p></div><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Estimated Labor Range</p><p className="font-semibold">{serviceEstimate?.laborRange}</p></div></div>
          <div className="rounded-xl border p-3"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">Service Area Calculator</p><p className="text-sm text-slate-600">Calculate the trip fee based on distance from your shop.</p></div><Button onClick={() => setShowMapCalculator(true)}>Open Map Calculator</Button></div><p className="text-sm">Current calculated fee: <strong>${calculatedTripFee.toFixed(2)}</strong></p></div>
          <div className="rounded-xl border p-3"><p className="font-semibold">Service Notes</p><p className="text-sm">{serviceEstimate?.notes}</p></div>
          {possibleCauses.length > 0 && <div className="space-y-3"><p className="font-semibold">Possible Causes & Remedies</p>{possibleCauses.map((item, index) => <div key={index} className="rounded-xl border bg-slate-50 p-3"><p className="font-medium">Possible Causes</p><ul className="ml-5 list-disc text-sm">{item.causes.map((cause, causeIndex) => <li key={causeIndex}>{cause}</li>)}</ul><p className="mt-3 font-medium">Suggested Remedy</p><p className="text-sm">{item.remedy}</p><p className="mt-3 font-medium">Possible Parts Needed</p><ul className="ml-5 list-disc text-sm">{item.parts.map((part, partIndex) => <li key={partIndex}>{part}</li>)}</ul></div>)}</div>}
        </div>
        {batteryAttempted && <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-blue-900"><p className="font-semibold">Customer attempted recommended premium batteries.</p><p className="mt-1 text-sm">If the issue continues after installing fresh Duracell Quantum or Energizer batteries, further diagnosis or technician service may be required.</p></div>}
        <div className="flex gap-2"><Button onClick={() => setForm({ ...form, helped: "Yes" })}>Advice Helped</Button><Button variant="outline" onClick={() => setForm({ ...form, helped: "No" })}>Still Needs Tech</Button></div>
      </CardContent>
    </Card>
  );
}

function SymptomResultModal({ symptomId, symptomData, symptomLabel, onClose }) {
  if (!symptomData) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{symptomLabel}</h2>
            <p className="text-sm text-slate-500 mt-1">Symptom analysis and recommended action</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300">Close ×</button>
        </div>
        {symptomData.note && (
          <div className="rounded-xl border bg-slate-50 p-4 mb-4">
            <p className="text-sm text-slate-700">{symptomData.note}</p>
          </div>
        )}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="font-semibold text-lg mb-2">Possible Causes</p>
            <ul className="ml-5 list-disc text-sm space-y-1">
              {symptomData.causes.map((cause, i) => <li key={i}>{cause}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border bg-green-50 p-4">
            <p className="font-semibold text-lg mb-2">Suggested Remedy</p>
            <p className="text-sm">{symptomData.remedy}</p>
          </div>
          {symptomData.parts && symptomData.parts.length > 0 && (
            <div className="rounded-xl border bg-white p-4">
              <p className="font-semibold text-lg mb-2">Parts / Tools to Bring</p>
              <ul className="ml-5 list-disc text-sm space-y-1">
                {symptomData.parts.map((part, i) => <li key={i}>{part}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function ServiceLockoutModal() {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/80 p-4"><div className="w-full max-w-xl rounded-2xl border-4 border-red-400 bg-white p-6 text-center shadow-2xl"><div className="text-5xl">⛔</div><h2 className="mt-3 text-3xl font-bold text-red-700">Contact for Safe Service</h2><p className="mt-3 text-lg font-semibold text-slate-900">This triage has reached the maximum risk threshold.</p><p className="mt-3 text-slate-700">Further customer input has been stopped to avoid confusing the service report. Based on the symptoms selected, this safe should be evaluated by a qualified safe technician.</p><div className="mt-5 rounded-xl bg-red-50 p-4 text-left text-sm text-red-900"><p className="font-semibold">Recommended next step:</p><p>Stop repeated attempts and schedule safe service.</p></div></div></div>;
}

function BatteryPopup({ setShowBatteryPopup, setBatteryAttempted }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"><h2 className="text-2xl font-bold text-slate-900">Recommended Battery Replacement</h2><p className="mt-2 text-slate-600">Many electronic safe lock problems are caused by weak or poor-quality batteries.</p><div className="mt-4 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900"><p className="font-semibold">Recommended Batteries</p><ul className="mt-2 ml-5 list-disc text-sm space-y-1"><li>Duracell Quantum</li><li>Energizer</li></ul><p className="mt-4 font-semibold">Do NOT Use:</p><ul className="mt-2 ml-5 list-disc text-sm space-y-1"><li>Cheap batteries</li><li>Rechargeable batteries</li></ul></div><div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">Install fresh premium batteries first, then retry the safe. If the keypad is beeping every 10–15 seconds, remove the batteries, press every keypad button for about one second, then install fresh Duracell Quantum or Energizer batteries before retrying the correct combination after the timeout period.</div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => { setBatteryAttempted(true); setShowBatteryPopup(false); }}>I Will Try Recommended Batteries</Button><Button variant="outline" onClick={() => setShowBatteryPopup(false)}>Continue Triage</Button></div></div></div>;
}

function MapCalculatorModal({ distanceMiles, setDistanceMiles, calculatedTripFee, setCalculatedTripFee, setShowMapCalculator }) {
  const calculateTripFee = () => {
    const miles = Number(distanceMiles);
    if (!miles || miles <= 17) {
      setCalculatedTripFee(75);
      return;
    }
    const extraMiles = Math.ceil(miles) - 17;
    setCalculatedTripFee(75 + extraMiles * 2.5);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl"><div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Service Area Map Calculator</h2><p className="text-sm text-slate-600">Demo framework: enter calculated driving miles from your shop. Later this can connect to Google Maps or another distance API.</p></div><Button variant="outline" onClick={() => setShowMapCalculator(false)}>Close</Button></div><div className="mb-4 h-64 rounded-2xl border bg-slate-100 p-4"><div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-center text-slate-600"><div><p className="font-semibold">Map Placeholder</p><p className="text-sm">Future version: customer address, shop address, route distance, and live map preview.</p></div></div></div><div className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><label className="text-sm font-medium">Distance from shop in miles</label><input className="w-full rounded-xl border p-3" type="number" min="0" placeholder="Example: 24" value={distanceMiles} onChange={(e) => setDistanceMiles(e.target.value)} /></div><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Calculated Service / Trip Fee</p><p className="text-2xl font-bold">${calculatedTripFee.toFixed(2)}</p><p className="text-xs text-slate-500">$75 minimum includes 17 miles. Mile 18 and above is $2.50 per mile.</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Button onClick={calculateTripFee}>Calculate Fee</Button><Button variant="outline" onClick={() => { setDistanceMiles(""); setCalculatedTripFee(75); }}>Reset to Minimum</Button></div></div></div>;
}

export default function SafePulseDemo() {
  const [showMapCalculator, setShowMapCalculator] = useState(false);
  const [showBatteryPopup, setShowBatteryPopup] = useState(false);
  const [batteryAttempted, setBatteryAttempted] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [lockedForService, setLockedForService] = useState(false);
  const [triageHistory, setTriageHistory] = useState([]);
  const [distanceMiles, setDistanceMiles] = useState("");
  const [calculatedTripFee, setCalculatedTripFee] = useState(75);
  const [uploadedPhotos, setUploadedPhotos] = useState({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastSelectedSymptom, setLastSelectedSymptom] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", brand: "", lockType: "Electronic keypad", safeOpen: "Yes", serviceAge: "", symptoms: [], tried: "", helped: "Not answered yet" });

  const score = useMemo(() => {
    let total = 0;
    for (const symptomId of triageHistory) {
      const symptom = symptomOptions.find((item) => item.id === symptomId);
      if (symptom) total += symptom.points;
    }
    if (form.safeOpen === "No") total += 20;
    if (Number(form.serviceAge) >= 5) total += 15;
    return Math.min(total, 100);
  }, [form.safeOpen, form.serviceAge, triageHistory]);

  const risk = getRisk(score);
  const visibleGroups = lockTypeVisibility[form.lockType] || symptomGroups.map((group) => group.category);
  const serviceEstimate = serviceFramework[risk.level.toLowerCase()];
  const dispatchType = dispatchRecommendations[risk.level];
  const possibleCauses = triageHistory.map((id) => possibleCauseLibrary[id]).filter(Boolean);
  const customerDamageRisk = triageHistory.some((symptom) => damageRiskTriggers.includes(symptom));
  const symptomRecommendations = symptomOptions.filter((symptom) => triageHistory.includes(symptom.id)).map((symptom) => symptom.recommendation);

  const toggleSymptom = (id) => {
    if (lockedForService) return;
    if (batteryTriggers.includes(id)) setShowBatteryPopup(true);
    setTriageHistory((prev) => {
      if (prev.includes(id)) return prev;
      const nextHistory = [...prev, id];
      const symptomScore = nextHistory.reduce((total, symptomId) => {
        const symptom = symptomOptions.find((item) => item.id === symptomId);
        return total + (symptom?.points || 0);
      }, 0);
      const openPenalty = form.safeOpen === "No" ? 20 : 0;
      const servicePenalty = Number(form.serviceAge) >= 5 ? 15 : 0;
      const nextScore = Math.min(symptomScore + openPenalty + servicePenalty, 100);
      if (nextScore >= 100) {
        setLockedForService(true);
        setShowSymptoms(false);
      }
      return nextHistory;
    });
    setForm((prev) => ({ ...prev, symptoms: prev.symptoms.includes(id) ? prev.symptoms.filter((s) => s !== id) : [...prev.symptoms, id] }));
    setShowSymptoms(false);
    // Show popup modal with the symptom result
    setLastSelectedSymptom(id);
    setShowResultModal(true);
  };

  const photoSummary = Object.entries(uploadedPhotos).filter(([, file]) => file).map(([slotId, file]) => {
    const slot = photoUploadSlots.find((item) => item.id === slotId);
    return `${slot?.label || slotId}: ${file.name}`;
  }).join("\n") || "No photos uploaded";

  const report = `SAFEPULSE TECHNICIAN REPORT

Customer: ${form.name || "Not provided"}
Phone/Text: ${form.phone || "Not provided"}
Safe Brand: ${form.brand || "Unknown"}
Lock Type: ${form.lockType}
Safe Currently Open: ${form.safeOpen}
Years Since Service: ${form.serviceAge || "Unknown"}
Current Selected Symptoms: ${form.symptoms.map(getSymptomLabel).join(", ") || "None selected"}
Symptoms Counted Toward Risk: ${triageHistory.map(getSymptomLabel).join(", ") || "None counted"}
Customer Tried: ${form.tried || "Not provided"}
Uploaded Photos:
${photoSummary}
Estimated Distance: ${distanceMiles || "Not calculated"} miles
Calculated Service/Trip Fee: $${calculatedTripFee.toFixed(2)}
Risk Score: ${score}/100
Risk Level: ${risk.level}
Recommendation: ${risk.advice}
Advice Helpful?: ${form.helped}`;

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-3xl font-bold">SafePulse Demo</h1><p className="text-slate-600">Simple safe-service triage for customers and technicians.</p></div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-semibold">Customer Intake</h2>
              <CustomerIntake form={form} setForm={setForm} />
              <SymptomsSelector form={form} showSymptoms={showSymptoms} setShowSymptoms={setShowSymptoms} visibleGroups={visibleGroups} triageHistory={triageHistory} toggleSymptom={toggleSymptom} />
              <PhotoUpload uploadedPhotos={uploadedPhotos} setUploadedPhotos={setUploadedPhotos} showPhotoUpload={showPhotoUpload} setShowPhotoUpload={setShowPhotoUpload} />
            </CardContent>
          </Card>
          <TriageResults score={score} risk={risk} symptomRecommendations={symptomRecommendations} customerDamageRisk={customerDamageRisk} dispatchType={dispatchType} serviceEstimate={serviceEstimate} calculatedTripFee={calculatedTripFee} possibleCauses={possibleCauses} setShowMapCalculator={setShowMapCalculator} batteryAttempted={batteryAttempted} form={form} setForm={setForm} />
        </div>
        <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5"><h2 className="text-xl font-semibold">Technician Text Report</h2><textarea className="h-72 w-full rounded-xl border p-3 font-mono text-sm" value={report} readOnly /></CardContent></Card>
      </div>
      {lockedForService && <ServiceLockoutModal />}
      {showBatteryPopup && <BatteryPopup setShowBatteryPopup={setShowBatteryPopup} setBatteryAttempted={setBatteryAttempted} />}
      {showMapCalculator && <MapCalculatorModal distanceMiles={distanceMiles} setDistanceMiles={setDistanceMiles} calculatedTripFee={calculatedTripFee} setCalculatedTripFee={setCalculatedTripFee} setShowMapCalculator={setShowMapCalculator} />}
      {showResultModal && lastSelectedSymptom && (
        <SymptomResultModal
          symptomId={lastSelectedSymptom}
          symptomData={possibleCauseLibrary[lastSelectedSymptom]}
          symptomLabel={getSymptomLabel(lastSelectedSymptom)}
          onClose={() => { setShowResultModal(false); setLastSelectedSymptom(null); }}
        />
      )}
    </div>
  );
}

