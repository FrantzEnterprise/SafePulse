import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfig } from "./useConfig";
import AdminPanel from "./AdminPanel";

// SAFEPOINT v0.5.1 — popup modal for symptom answers
// Each symptom selection shows its result in a clean modal overlay
// instead of scrolling to the bottom mixed with other info.

// ─── SYMPTOM GROUPS ──────────────────────────────────────────────────────────
// Loaded from localStorage (editable via Symptom Editor), or uses defaults.
// This runs once at module load to seed the window global.

function buildDefaultSymptomGroups() {
  return [
    {
      category: "Dial Locks",
      symptoms: [
        { id: "dial_stuck", label: "Dial is stuck and will not move!", points: 35, recommendation: "Stuck dial — do not force. Try dialing +/- 1-3 numbers off your combination. Call technician if no success.", causes: ["Dial key locked", "Dial knocked off center", "Spindle seized from moisture", "Contents blocking bolt extension"], remedy: "Check if dial has a keyhole and is locked. Try dialing +/- 1-3 numbers off combo. If seized from moisture, do not spray chemicals — this can make it worse. Check inside safe for objects blocking bolts when locking.", note: "Stuck dials are not an easy fix. Turning the dial too hard can create detrimental issues and increase costs to open and repair.", parts: ["Replacement dial", "Spindle components", "Lock case service"] },
        { id: "dial_sticky_tight", label: "Dial is very sticky and/or tight to turn", points: 20, recommendation: "Sticky dial — try compressed air around dial. If misaligned, tap lightly into place. Wheel pack issue needs new lock.", causes: ["Bushing wear in index ring", "Dial misalignment from bump", "Wheel pack contamination", "Dried lubrication"], remedy: "Try blowing out debris with compressed air around dial. If bumped out of alignment, tap lightly into place. If wheel pack is the issue, a new lock is needed. Do not oil the bushing — messy and only temporary.", note: "This can be an issue with a bushing under the dial in the index ring, a dial misalignment, or an issue in the lock's wheel pack.", parts: ["Dial ring/bushing", "Compressed air can", "Replacement lock case"] },
        { id: "dial_loose_spin", label: "Dial is loose, seems to spin too easy and will not engage to open", points: 30, recommendation: "Dial loose from wear — try pulling dial toward you while dialing. If it opens, leave it open and call technician.", causes: ["Hard usage wear", "Long-term wear", "Drive cam worn", "Engagement teeth stripped"], remedy: "Try pulling the dial toward you while you dial. You may feel it pick up the wheels and get it open. If it opens, leave it open and call technician to service the lock.", note: "This is not a good sign and indicates wear, either from hard, rough and/or long time usage.", parts: ["Replacement dial", "Drive cam assembly", "Lock case rebuild kit"] },
        { id: "dial_drag", label: "Dialing the combination, it does not unlock easily and have to dial it multiple times to unlock it", points: 20, recommendation: "Dial not unlocking easily — try dialing slightly over/under target number. Wear will worsen over time.", causes: ["Lock wear from age", "Wheel pack friction", "Dried lubrication", "Spindle misalignment"], remedy: "Check dialing sequence first. Try dialing slightly over/under target number, or wiggle dial if it skips past engagement. This condition worsens over time — technician needed.", note: "If you're dialing the sequence correctly, this is usually caused by wear, your lock will need servicing to repair it.", parts: ["Lock case service kit", "Lubrication/graphite", "Wheel pack bushings"] },
        { id: "dial_lost_combo", label: "Lost or forgotten combination, probate, damaged in a burglary, or simply a broken dial lock", points: 40, recommendation: "Lost combination or broken dial lock — technician required to open and repair.", causes: ["Lost combination", "Forgotten combination", "Probate/estate safe", "Burglary damage", "Broken dial lock"], remedy: "You will need to call the technician to open and repair the safe. A skilled safe technician can get through this, possibly without any damage.", note: "Those are always difficult issues, I'm sorry you have to go through this.", parts: ["Dial removal tools", "Replacement lock", "Safe opening tools"] },
      ],
    },
    {
      category: "Electronic Locks",
      symptoms: [
        { id: "keypad_no_response", label: "My keypad does not respond when I touch a key", points: 20, recommendation: "Keypad unresponsive — check battery connections, cable to lock, and battery cartridge terminals.", causes: ["Battery wires unplugged", "Keypad cable ruptured", "Battery cartridge terminal issues", "Missing cartridge spring"], remedy: "Check battery connections are plugged in. Verify keypad cable to lock body is connected and undamaged. If using battery cartridge, ensure terminals make contact and the cartridge spring is present.", note: "There are a few things you can try before you need to call the technician.", parts: ["Battery cartridge", "Keypad cable", "9V batteries"] },
        { id: "repeating_beep_timeout", label: "I put my combination in 3 times or more and now it beeps every 10 or 15 seconds", points: 25, recommendation: "Lockout beeping — let stop, unplug battery, press all keys, plug back in, re-enter correct combination.", causes: ["Lockout after 3 incorrect attempts", "Low battery timeout mode", "Temporary keypad lockout"], remedy: "Do not unplug the battery. Wait until the beeping stops. Unplug the battery, push all keys on the keypad, plug the battery back in, make sure you have the correct combination, and enter it again.", note: "Safe locks usually give you three tries before they go into a time-out.", parts: ["Duracell Quantum batteries", "Energizer batteries"] },
        { id: "keys_not_register", label: "Some of my keys do not register when I push them", points: 25, recommendation: "Keys not registering — unplug battery, press all keys, replug and retry. Keypad may need replacement.", causes: ["Failed keypad", "Keypad membrane worn", "Internal keypad circuit damage", "Battery voltage too low"], remedy: "Unplug the battery, push all the keys on the keypad, plug the battery back in, and try again. If this does not work the keypad has likely failed and needs replacement.", note: "This is not a good sign, it usually means your keypad failed.", parts: ["Replacement keypad", "Keypad cable", "9V batteries"] },
        { id: "click_no_release", label: "I put in my combination, hear the solenoid click or motor turn, but the handle will not turn", points: 35, recommendation: "Solenoid clicks but handle won't turn — move handle to neutral, try pushing toward lock and enter combo. Re-locker may have fired.", causes: ["Handle off neutral position", "Bolt pressure on lock", "Fired re-locker mechanism", "Internal disconnected linkage"], remedy: "Move handle to neutral position first. If handle has no play, push it toward lock direction, hold it, and enter combination. If handle has play and travels past normal, a re-locker may have fired — call technician.", note: "Electronic locks can be finicky, first move the handle to a neutral position first.", parts: ["Replacement lock body", "Re-locker reset/servicing", "Lock solenoid"] },
        { id: "elec_lost_combo", label: "I lost or forgot my combination", points: 30, recommendation: "Lost electronic combination — technician needed. May be reset, shorted, or drilled depending on lock make.", causes: ["Lost combination", "Forgotten combination", "Lock memory erased", "Deactivated codes"], remedy: "A lost combination cannot be found. Some electronic locks can be reset, some can be shorted, some have to be drilled. It depends on the make of the lock, not the safe manufacturer.", note: "This is challenging but don't worry, a safe technician can get through this.", parts: ["Programming instructions", "Reset tools", "Replacement lock"] },
      ],
    },
    {
      category: "Mechanical Issues",
      symptoms: [
        { id: "handle_stuck_no_play", label: "Handle is stuck and does not have any play", points: 30, recommendation: "Stuck handle — push handle toward closed position, hold it, enter combo and try to open. Do not force.", causes: ["Bolt pressure binding", "Re-locker fired", "Internal linkage jam"], remedy: "Push the handle toward the closed position, hold it there, enter the combination, and try the handle again. If a re-locker has fired, do not force anything.", note: "A stuck handle with no play often means something inside has shifted or a re-locker has fired.", parts: ["Re-locker reset tools", "Linkage parts"] },
        { id: "handle_spins_no_release", label: "My handle moves or spins but it does not release the bolts to open the door", points: 40, recommendation: "Handle spins but bolts don't release — check setscrew on handle hub. If tight, internal issue needs technician.", causes: ["Loose handle setscrew", "Handle hub stripped", "Broken spindle"], remedy: "Check the setscrew on the handle hub — it may have come loose. If the setscrew is tight, there is likely an internal disconnect in the handle to bolt-work, requiring a technician.", note: "This could be simple (tighten a screw), or more involved (internal damage).", parts: ["Setscrew/Allen key", "Replacement handle hub", "Spindle"] },
        { id: "handle_resistance", label: "My handle moves a little bit and I feel resistance when trying to open it", points: 25, recommendation: "Handle has resistance — push on door while slowly moving handle to open. Stop if no progress.", causes: ["Door sag misalignment", "Bolt drag on frame", "Rust or debris in bolt path"], remedy: "Apply pressure to the door while slowly moving the handle to open. If the safe is open, check the bolt alignment. If it does not open, stop trying and call the technician.", note: "Keep trying gently while pushing on the door. This often works for door sag or bolt drag.", parts: ["Lubricant spray", "Door alignment shims"] },
        { id: "door_stops_partial", label: "When opening the safe the door only comes open a little bit and stops", points: 35, recommendation: "Door only opens partway — likely severed bolt connection. Call technician immediately. Do not force.", causes: ["Broken internal bolt connection", "Detached bolt-work link", "Obstruction behind bolts"], remedy: "Do not force the door open further. This usually indicates a broken bolt connection. Call a technician immediately.", note: "This could mean a severed connection between the handle or lock to the bolts.", parts: ["Bolt-work repair kit", "Relock trigger assembly"] },
        { id: "cannot_lock_safe", label: "I cannot lock my safe! I close it and throw the bolts but they will not lock in place", points: 20, recommendation: "Cannot lock — check for obstruction blocking bolts. Open door 90°, release bolt detent, extend bolts fully.", causes: ["Obstruction in bolt path", "Bolt detent not engaging", "Alignment shift"], remedy: "Check for any obstruction where the bolts extend. Open the door 90°, release the bolt detent, and extend the bolts fully to verify they move freely.", note: "Make sure nothing is blocking the bolts from fully extending.", parts: ["Bolt lubricant", "Replacement detent spring"] },
      ],
    },
    {
      category: "Environmental Issues",
      symptoms: [
        { id: "no_heater_desiccant", label: "I don't have a heater or desiccant in my safe", points: 10, recommendation: "Install reusable desiccant can or electric safe dryer to protect contents from moisture.", causes: ["No moisture control", "High humidity area"], remedy: "Install a reusable desiccant can (recharge in microwave) or an electric safe dryer to protect your safe contents from moisture damage.", note: "Moisture is the number one enemy of safes and their contents.", parts: ["Reusable desiccant can", "Electric safe dryer"] },
        { id: "garage_location", label: "I keep my safe in the garage, is that bad?", points: 10, recommendation: "Garage safe — temperature extremes affect locks. Warm with hair dryer in winter, cool with fan in summer.", causes: ["Temperature extremes", "Humidity changes", "Condensation"], remedy: "Temperature extremes affect safe locks. If the lock is sluggish due to cold, warm it with a hair dryer on low. In summer, use a fan to reduce heat.", note: "Garages fluctuate in temperature and humidity, which can affect safe performance over time.", parts: ["Hair dryer", "Dehumidifier rod"] },
        { id: "keypad_wet", label: "I washed my keypad and it does not work right now", points: 15, recommendation: "Keypad wet — let dry fully, use hair dryer on low from distance. If still fails, call technician.", causes: ["Water ingress into keypad", "Short circuit from moisture"], remedy: "Allow the keypad to dry fully. You may use a hair dryer on low from a distance. If it still fails after thorough drying, call the technician.", note: "Water and electronics don't mix. Patience is the first tool here.", parts: ["Replacement keypad"] },
        { id: "bottom_rust", label: "My safe is rusting at the bottom where it is anchored to the ground. Is that OK?", points: 15, recommendation: "Bottom rust — create water barrier. Excessive rust compromises security. Replace and re-anchor ASAP.", causes: ["Concrete moisture wicking", "Flood or water exposure", "No moisture barrier under safe"], remedy: "Create a water barrier by installing a plastic or rubber mat under the safe. If rust has significantly weakened the bottom, the safe should be replaced and re-anchored.", note: "Bottom rust from concrete moisture is common but should be addressed before it compromises the floor.", parts: ["Rubber/plastic mat", "Replacement safe", "Anchor bolts"] },
      ],
    },
  ];
}

// Initialize once: check localStorage, otherwise use defaults
function loadSymptomGroups() {
  try {
    const saved = localStorage.getItem('safepulse_symptoms');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].category && parsed[0].symptoms) {
        window.__safepulseSymptomGroups = parsed;
        return parsed;
      }
    }
  } catch (e) { /* fall through */ }
  const defaults = buildDefaultSymptomGroups();
  window.__safepulseSymptomGroups = defaults;
  return defaults;
}

const symptomGroups = loadSymptomGroups();
const symptomOptions = symptomGroups.flatMap((group) => group.symptoms);

function buildLockTypeVisibility(groups) {
  const allCategories = groups.map(g => g.category);
  return {
    "Electronic keypad": allCategories.filter(c => c !== "Dial Locks"),
    "Mechanical dial": allCategories.filter(c => c !== "Electronic Locks"),
    "Key lock": allCategories.filter(c => c === "Mechanical Issues" || c === "Environmental Issues"),
    Unknown: allCategories,
  };
}

const lockTypeVisibility = buildLockTypeVisibility(symptomGroups);

const serviceFramework = {
  low: { standard: "$275 - $350", highSecurity: "$800 - $1,000", notes: "Issue may be resolved with simple troubleshooting or preventive service." },
  medium: { standard: "$275 - $500", highSecurity: "$800 - $1,200", notes: "Moderate service may be required depending on lock condition and accessibility." },
  high: { standard: "$275 - $750", highSecurity: "$800 - $1,800", notes: "Likely requires onsite safe technician evaluation and possible repair work." },
  urgent: { standard: "$275 - $1,500", highSecurity: "$800 - $2,500+", notes: "Urgent condition with increased risk of lockout, major repair, or specialized service." },
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

// Build possibleCauseLibrary dynamically from symptom data
function buildCauseLibrary(groups) {
  const lib = {};
  groups.forEach(group => {
    group.symptoms.forEach(sym => {
      lib[sym.id] = {
        causes: sym.causes || ['Check symptom details'],
        remedy: sym.remedy || sym.recommendation || 'Technician evaluation recommended.',
        note: sym.note || '',
        parts: sym.parts || ['Technician tools'],
      };
    });
  });
  return lib;
}
const possibleCauseLibrary = buildCauseLibrary(symptomGroups);


function getRisk(score) {
  if (score >= 75) return { level: "Urgent", advice: "Stop repeated attempts and contact a safe technician immediately." };
  if (score >= 50) return { level: "High", advice: "Schedule service soon. Continued use may increase lockout risk." };
  if (score >= 25) return { level: "Medium", advice: "Try basic non-invasive checks, then monitor symptoms closely." };
  return { level: "Low", advice: "Issue may be simple, but continue monitoring for worsening symptoms." };
}

function getSymptomLabel(id) {
  return symptomOptions.find((symptom) => symptom.id === id)?.label || id;
}

function formatPhone(value) {
  // Strip non-digits
  const digits = value.replace(/\D/g, '');
  // Format as (xxx) xxx-xxxx
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
}

function CustomerIntake({ form, setForm, showSymptoms, setShowSymptoms, visibleGroups, triageHistory, toggleSymptom, uploadedPhotos, setUploadedPhotos, showPhotoUpload, setShowPhotoUpload, distanceMiles, setDistanceMiles, calculatedTripFee, setCalculatedTripFee, config, serviceEstimate, dispatchType, score, risk }) {
  const [step, setStep] = useState(1);
  const goToStep = (s) => { setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const totalSteps = 6;

  const calculateStep5Fee = () => {
    const cfg = config?.serviceArea || { baseFee: 75, baseMilesIncluded: 17, perExtraMileRate: 2.5 };
    const miles = Number(distanceMiles);
    if (!miles || miles <= cfg.baseMilesIncluded) {
      setCalculatedTripFee(cfg.baseFee);
      return;
    }
    const extraMiles = Math.ceil(miles) - cfg.baseMilesIncluded;
    setCalculatedTripFee(cfg.baseFee + extraMiles * cfg.perExtraMileRate);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <button
          key={s}
          onClick={() => { if (s < step) goToStep(s); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
            s === step
              ? 'bg-primary text-accent scale-110 shadow-md'
              : s < step
              ? 'bg-green-500 text-white'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          {s < step ? '✓' : s}
        </button>
      ))}
      <span className="ml-2 text-xs text-slate-400">Step {step} of {totalSteps}</span>
    </div>
  );

  return (
    <>
      <StepIndicator />

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Contact Information</h3>
          <input className="w-full rounded-xl border p-3" placeholder="Customer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full rounded-xl border p-3" placeholder="(916) 555-1234" value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} />
          <input className="w-full rounded-xl border p-3" placeholder="Enter email for a copy of results - Optional" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <button onClick={() => goToStep(2)} className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
            Next — Safe Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Safe Details</h3>
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
              <p className="font-medium text-lg">What have you already tried?</p>
              <p className="text-sm text-slate-500">Helps avoid repeated troubleshooting.</p>
            </div>
            <textarea className="w-full rounded-xl border p-3" placeholder="Battery changes, combinations attempted, observations..." value={form.tried} onChange={(e) => setForm({ ...form, tried: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => goToStep(1)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              ← Back
            </button>
            <button onClick={() => goToStep(3)} className="flex-1 rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
              Next — Symptoms
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Symptoms</h3>
          <SymptomsSelector form={form} showSymptoms={showSymptoms} setShowSymptoms={setShowSymptoms} visibleGroups={visibleGroups} triageHistory={triageHistory} toggleSymptom={toggleSymptom} />
          <div className="flex gap-2">
            <button onClick={() => goToStep(2)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              ← Back
            </button>
            <button onClick={() => goToStep(4)} className="flex-1 rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
              Next — Photos
            </button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Photo Upload</h3>
          <PhotoUpload uploadedPhotos={uploadedPhotos} setUploadedPhotos={setUploadedPhotos} showPhotoUpload={showPhotoUpload} setShowPhotoUpload={setShowPhotoUpload} />
          <div className="flex gap-2">
            <button onClick={() => goToStep(3)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              ← Back
            </button>
            <button onClick={() => goToStep(5)} className="flex-1 rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
              Next — Service Quote
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Service Area & Quote</h3>
          <p className="text-sm text-slate-600">Enter the driving distance from your shop to estimate the trip fee.</p>
          <div className="rounded-2xl border bg-white p-4 space-y-4">
            <button onClick={() => setShowMapCalculator(true)} className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
              Open Map Calculator
            </button>
            <hr className="border-slate-200" />
            <div className="space-y-1">
              <label className="text-sm font-medium">Distance from shop (miles)</label>
              <input className="w-full rounded-xl border p-3" type="number" min="0" placeholder="Example: 24" value={distanceMiles} onChange={(e) => setDistanceMiles(e.target.value)} />
            </div>
            <button onClick={calculateStep5Fee} className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
              Calculate Fee
            </button>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated Service / Trip Fee</p>
              <p className="text-3xl font-bold text-accent">${calculatedTripFee.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">$75 minimum includes 17 miles. Mile 18 and above is $2.50 per mile.</p>
            </div>
            {distanceMiles && Number(distanceMiles) > 0 && (
              <div className="rounded-xl border p-3 text-sm">
                <p className="font-medium">Trip Breakdown</p>
                <p>Base fee: $75.00 (first 17 miles)</p>
                {Number(distanceMiles) > 17 && <p>Extra miles: {Math.ceil(Number(distanceMiles)) - 17} × $2.50</p>}
                <p className="mt-1 font-semibold">Total: ${calculatedTripFee.toFixed(2)}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => goToStep(4)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              ← Back
            </button>
            <button onClick={() => goToStep(6)} className="flex-1 rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
              Next — Review & Cost
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Service & Cost Framework</h3>
          <p className="text-sm text-slate-600">Ballpark estimates based on your selections. Final pricing depends on safe type, lock condition, and complexity.</p>
          <div className="rounded-2xl border bg-white p-4 space-y-4">
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="font-semibold">Service Trip Fee</p>
              <p className="text-3xl font-bold text-accent">${calculatedTripFee.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">$75 minimum includes 17 miles. $2.50/mile beyond.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border p-3">
                <p className="text-sm text-slate-500">Standard Safes</p>
                <p className="text-xl font-bold">{serviceEstimate?.standard || '$275 - $350'}</p>
                <p className="text-sm text-slate-500 mt-1">Starting at $275</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-sm text-slate-500">High Security Safes</p>
                <p className="text-xl font-bold">{serviceEstimate?.highSecurity || '$800 - $1,000'}</p>
                <p className="text-sm text-slate-500 mt-1">Starting at $800</p>
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <p className="font-semibold text-sm">Service Notes</p>
              <p className="text-sm text-slate-600">{serviceEstimate?.notes || 'Issue may be resolved with simple troubleshooting or preventive service.'}</p>
            </div>
            {distanceMiles && Number(distanceMiles) > 0 && (
              <div className="rounded-xl border p-3 text-sm">
                <p className="font-medium">Trip Breakdown</p>
                <p>Base fee: $75.00 (first 17 miles)</p>
                {Number(distanceMiles) > 17 && <p>Extra miles: {Math.ceil(Number(distanceMiles)) - 17} × $2.50</p>}
                <p className="mt-1 font-semibold">Total: ${calculatedTripFee.toFixed(2)}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => goToStep(5)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              ← Back
            </button>
          </div>
        </div>
      )}
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

function TriageResults({ score, risk, symptomRecommendations, customerDamageRisk, dispatchType, serviceEstimate, calculatedTripFee, possibleCauses, batteryAttempted, form, setForm, config, triageHistory, getSymptomLabel, uploadedPhotos, photoSummary, distanceMiles }) {
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
            <div className="text-2xl font-bold">{risk.level === "Low" && "✓ LOW RISK"}{risk.level === "Medium" && "⚠ MODERATE RISK"}{risk.level === "High" && "⚠ HIGH RISK"}{risk.level === "Urgent" && "⛔ URGENT CONDITION"}</div>
            <div className="text-3xl font-bold" style={{color: score >= 75 ? '#dc2626' : score >= 50 ? '#ea580c' : score >= 25 ? '#ca8a04' : '#16a34a'}}>{score}/100</div>
          </div>
          <p className="mt-2 text-sm font-medium">{risk.advice}</p>
        </div>
        <div className="flex gap-2 no-print mb-4"><Button onClick={() => { setForm({ ...form, helped: "Yes" }); }}>Advice Helped</Button><Button onClick={() => {
          setForm({ ...form, helped: "No" });
          // Build SMS notification
          const companyPhone = config?.company?.phone || '';
          const safePhone = companyPhone.replace(/[\s\(\)\-]/g, '');
          const photoSummarySMS = Object.entries(uploadedPhotos || {}).filter(([,f]) => f).map(([,f]) => '  - ' + f.name).join('\n') || '  None';
          const msg = encodeURIComponent(
`SAFE-TRIAGE TECHNICIAN REPORT\n\nCustomer: ${form.name || 'Not provided'}\nPhone: ${form.phone || 'Not provided'}\nSafe Brand: ${form.brand || 'Unknown'}\nLock Type: ${form.lockType}\nSafe Currently Open: ${form.safeOpen}\nYears Since Service: ${form.serviceAge || 'Unknown'}\n\nCurrent Symptoms: ${form.symptoms.map(getSymptomLabel).join(', ') || 'None'}\nRisk Score: ${score}/100 — ${risk.level}\nRecommendation: ${risk.advice}\n\nWhat Customer Tried:\n${form.tried || 'Not provided'}\n\nPhotos:\n${photoSummarySMS}\n\nEstimated Fee: \$${calculatedTripFee.toFixed(2)}\nDistance: ${distanceMiles || 'Not calculated'} miles`
          );
          // SMS to tech - use location.href for reliable mobile sms: protocol
          if (safePhone) {
            window.location.href = `sms:${safePhone}?body=${msg}`;
          }
          // Auto-reply to customer via email - delayed to allow SMS to process first
          if (form.phone && form.phone.replace(/\D/g,'').length >= 10) {
            const autoReply = encodeURIComponent(
`Hi ${form.name || 'Valued Customer'},\n\nThank you for using Frantz Locksmith Service's SafeTriage tool.\n\nRobert has received your safe service request and will contact you ASAP at ${form.phone}.\n\n=== SAFE-TRIAGE REPORT ===\n\nCustomer: ${form.name || 'Not provided'}\nPhone: ${form.phone || 'Not provided'}\nSafe Brand: ${form.brand || 'Unknown'}\nLock Type: ${form.lockType}\nSafe Status: Currently ${form.safeOpen}\nYears Since Service: ${form.serviceAge || 'Unknown'}\n\nSymptoms Reported:\n${triageHistory.map(getSymptomLabel).join(', ') || 'None selected'}\n\nRisk Score: ${score}/100 — ${risk.level}\nRecommendation: ${risk.advice}\n\nPhotos Uploaded:\n${Object.entries(uploadedPhotos || {}).filter(([,f]) => f).map(([,f]) => '  - ' + f.name).join('\n') || '  None'}\n\nWhat Customer Tried:\n${form.tried || 'Not provided'}\n\n---\nIf you have additional details, call (916) 534-4900.\n\nBest,\nRobert Frantz\nFrantz Locksmith Service\n(916) 534-4900\nfrantzlocksmith@hotmail.com\nCA LCO 4160`
            );
            const recipient = config?.company?.email || '';
            const customerEmail = form.email || '';
            const toField = customerEmail || recipient;
            const bccField = customerEmail ? recipient : '';
            if (recipient) {
              document.location.href = `mailto:${toField}?bcc=${bccField}&subject=SafeTriage%20Request%20-%20${encodeURIComponent(form.name || 'Customer')}&body=${autoReply}`;
            }
          }
        }}>Still Needs Tech</Button></div>
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
          <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Estimated Service / Trip Fee</p><p className="font-semibold">${calculatedTripFee.toFixed(2)} minimum</p><p className="mt-1 text-xs text-slate-500">Base rate includes first 17 miles. Add $2.50 per mile from mile 18 and up.</p></div><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Estimated Labor — Standard Safes</p><p className="font-semibold text-lg">{serviceEstimate?.standard} <span className="text-sm font-normal text-slate-400">starting at $275</span></p><p className="mt-2 text-sm text-slate-500">Estimated Labor — High Security Safes</p><p className="font-semibold text-lg">{serviceEstimate?.highSecurity} <span className="text-sm font-normal text-slate-400">starting at $800</span></p></div></div>

          <div className="rounded-xl border p-3"><p className="font-semibold">Service Notes</p><p className="text-sm">{serviceEstimate?.notes}</p></div>
          {possibleCauses.length > 0 && <div className="space-y-3"><p className="font-semibold">Possible Causes & Remedies</p>{possibleCauses.map((item, index) => <div key={index} className="rounded-xl border bg-slate-50 p-3"><p className="font-medium">Possible Causes</p><ul className="ml-5 list-disc text-sm">{item.causes.map((cause, causeIndex) => <li key={causeIndex}>{cause}</li>)}</ul><p className="mt-3 font-medium">Suggested Remedy</p><p className="text-sm">{item.remedy}</p><p className="mt-3 font-medium">Possible Parts Needed</p><ul className="ml-5 list-disc text-sm">{item.parts.map((part, partIndex) => <li key={partIndex}>{part}</li>)}</ul></div>)}</div>}
        </div>
        {batteryAttempted && <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-blue-900"><p className="font-semibold">Customer attempted recommended premium batteries.</p><p className="mt-1 text-sm">If the issue continues after installing fresh Duracell Quantum or Energizer batteries, further diagnosis or technician service may be required.</p></div>}
        <div className="flex gap-2 no-print"><Button onClick={() => { setForm({ ...form, helped: "Yes" }); }}>Advice Helped</Button><Button onClick={() => {
          setForm({ ...form, helped: "No" });
          // Build SMS notification
          const companyPhone = config?.company?.phone || '';
          const safePhone = companyPhone.replace(/[\s\(\)\-]/g, '');
          const photoSummarySMS = Object.entries(uploadedPhotos || {}).filter(([,f]) => f).map(([,f]) => '  - ' + f.name).join('\n') || '  None';
          const msg = encodeURIComponent(
`SAFE-TRIAGE TECHNICIAN REPORT\n\nCustomer: ${form.name || 'Not provided'}\nPhone: ${form.phone || 'Not provided'}\nSafe Brand: ${form.brand || 'Unknown'}\nLock Type: ${form.lockType}\nSafe Currently Open: ${form.safeOpen}\nYears Since Service: ${form.serviceAge || 'Unknown'}\n\nCurrent Symptoms: ${form.symptoms.map(getSymptomLabel).join(', ') || 'None'}\nRisk Score: ${score}/100 — ${risk.level}\nRecommendation: ${risk.advice}\n\nWhat Customer Tried:\n${form.tried || 'Not provided'}\n\nPhotos:\n${photoSummarySMS}\n\nEstimated Fee: $${calculatedTripFee.toFixed(2)}\nDistance: ${distanceMiles || 'Not calculated'} miles`
          );
          // SMS to tech - use location.href for reliable mobile sms: protocol
          if (safePhone) {
            window.location.href = `sms:${safePhone}?body=${msg}`;
          }
          // Auto-reply to customer via email - delayed to allow SMS to process first
          if (form.phone && form.phone.replace(/\D/g,'').length >= 10) {
            const autoReply = encodeURIComponent(
`Hi ${form.name || 'Valued Customer'},

Thank you for using Frantz Locksmith Service's SafeTriage tool.

Robert has received your safe service request and will contact you ASAP at ${form.phone}.

=== SAFE-TRIAGE REPORT ===

Customer: ${form.name || 'Not provided'}
Phone: ${form.phone || 'Not provided'}
Safe Brand: ${form.brand || 'Unknown'}
Lock Type: ${form.lockType}
Safe Status: Currently ${form.safeOpen}
Years Since Service: ${form.serviceAge || 'Unknown'}

Symptoms Reported:
${triageHistory.map(getSymptomLabel).join(', ') || 'None selected'}

Risk Score: ${score}/100 — ${risk.level}
Recommendation: ${risk.advice}

Photos Uploaded:
${Object.entries(uploadedPhotos || {}).filter(([,f]) => f).map(([,f]) => '  - ' + f.name).join('\n') || '  None'}

What Customer Tried:
${form.tried || 'Not provided'}

---
If you have additional details, call (916) 534-4900.

Best,
Robert Frantz
Frantz Locksmith Service
(916) 534-4900
frantzlocksmith@hotmail.com
CA LCO 4160`
            );
            const recipient = config?.company?.email || '';
            // BCC using the company email, send TO the customer if they provided an email
            const customerEmail = form.email || '';
            const toField = customerEmail || recipient;
            const bccField = customerEmail ? recipient : '';
            if (recipient) {
              document.location.href = `mailto:${toField}?bcc=${bccField}&subject=SafeTriage%20Request%20-%20${encodeURIComponent(form.name || 'Customer')}&body=${autoReply}`;
            }
          }
        }}>Still Needs Tech</Button></div>
      </CardContent>
    </Card>
  );
}

function InstructionsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="py-8 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">How to use SafePulse</h2>
          <button onClick={onClose} className="shrink-0 rounded-full bg-blue-600 text-accent px-5 py-2 text-sm font-bold hover:bg-blue-700 shadow">&larr; Back</button>
        </div>

        <div className="space-y-5">
          <section>
            <h3 className="font-semibold text-base text-slate-900 mb-2">1. Customer Intake</h3>
            <p className="text-sm text-slate-600">Fill in the customer's name, phone, safe brand, lock type, and whether the safe is currently open. Enter how many years since the last service. This helps the triage engine calculate an accurate risk score.</p>
          </section>

          <section>
            <h3 className="font-semibold text-base text-slate-900 mb-2">2. Select Symptoms</h3>
            <p className="text-sm text-slate-600">Tap <strong>"Show Symptoms"</strong> to browse symptom categories. Only categories relevant to your lock type will appear. Tap a symptom to see a popup with possible causes and the suggested remedy. Each symptom adds points to your risk score. You can select multiple symptoms.</p>
          </section>

          <section>
            <h3 className="font-semibold text-base text-slate-900 mb-2">3. Upload Photos (Optional)</h3>
            <p className="text-sm text-slate-600">Take photos of the safe, lock/keypad, door edge, or any visible damage. Photos help the technician prepare before arriving on site.</p>
          </section>

          <section>
            <h3 className="font-semibold text-base text-slate-900 mb-2">4. Review Results</h3>
            <p className="text-sm text-slate-600">The results panel on the right shows your risk score, risk level, and recommended actions. Use the map calculator to estimate distance and trip fees. A technician report is generated automatically at the bottom of the page.</p>
          </section>

          <section>
            <h3 className="font-semibold text-base text-slate-900 mb-2">Risk Levels</h3>
            <ul className="list-disc ml-5 text-sm space-y-1 text-slate-600">
              <li><strong>Low (0&ndash;24):</strong> Simple troubleshooting or preventive service.</li>
              <li><strong>Medium (25&ndash;49):</strong> Non-invasive checks recommended, monitor symptoms.</li>
              <li><strong>High (50&ndash;74):</strong> Schedule service soon, continued use may increase risk.</li>
              <li><strong>Urgent (75&ndash;100):</strong> Stop all attempts, contact a technician immediately.</li>
            </ul>
          </section>

          <section className="rounded-xl border-l-4 border-l-blue-500 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">SafePulse is a triage tool to help identify safe issues and guide next steps. Always consult a qualified safe technician for any repair work.</p>
          </section>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={onClose} className="w-full max-w-xs rounded-xl bg-blue-600 text-accent py-3 text-base font-bold hover:bg-blue-700 shadow transition-colors">&larr; Return to Triage</button>
        </div>
        </div>
      </div>
    </div>
  );
}

function SymptomResultModal({ symptomId, symptomData, symptomLabel, onClose }) {
  if (!symptomData) return null;
  const modalContent = (
    <div className="rounded-2xl bg-white p-5 shadow-xl max-h-full overflow-y-auto">
      {/* Top bar with title + close */}
      <div className="pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">{symptomLabel}</h2>
          <button onClick={onClose} className="shrink-0 rounded-full bg-blue-600 text-accent px-5 py-2 text-sm font-bold hover:bg-blue-700 shadow">
            ← Back</button>
        </div>
      </div>
      {/* Note */}
      {symptomData.note && (
        <div className="rounded-xl border-l-4 border-l-blue-500 bg-blue-50 p-4 mb-4">
          <p className="text-sm font-medium text-blue-900">{symptomData.note}</p>
        </div>
      )}
      {/* Causes */}
      <div className="rounded-xl border bg-white p-4 mb-4">
        <p className="font-semibold text-base mb-2">Possible Causes</p>
        <ul className="ml-5 list-disc text-sm space-y-1">
          {symptomData.causes.map((cause, i) => <li key={i}>{cause}</li>)}
        </ul>
      </div>
      {/* Remedy */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-4">
        <p className="font-semibold text-base mb-2">Suggested Remedy</p>
        <p className="text-sm text-green-900">{symptomData.remedy}</p>
      </div>
      {/* Bottom return button */}
      <div className="mt-6 flex justify-center">
        <button onClick={onClose} className="w-full max-w-xs rounded-xl bg-blue-600 text-accent py-3 text-base font-bold hover:bg-blue-700 shadow transition-colors">
          ← Return to Symptom Selection
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-2xl">
          {modalContent}
        </div>
      </div>
    </div>
  );
}

function ServiceLockoutModal() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-red-950/80">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl border-4 border-red-400 bg-white p-6 text-center shadow-2xl">
          <div className="text-5xl">⛔</div>
          <h2 className="mt-3 text-3xl font-bold text-red-700">Contact for Safe Service</h2>
          <p className="mt-3 text-lg font-semibold text-slate-900">This triage has reached the maximum risk threshold.</p>
          <p className="mt-3 text-slate-700">Further customer input has been stopped to avoid confusing the service report. Based on the symptoms selected, this safe should be evaluated by a qualified safe technician.</p>
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-left text-sm text-red-900">
            <p className="font-semibold">Recommended next step:</p>
            <p>Stop repeated attempts and schedule safe service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BatteryPopup({ setShowBatteryPopup, setBatteryAttempted }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Recommended Battery Replacement</h2>
          <p className="mt-2 text-slate-600">Many electronic safe lock problems are caused by weak or poor-quality batteries.</p>
          <div className="mt-4 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
            <p className="font-semibold">Recommended Batteries</p>
            <ul className="mt-2 ml-5 list-disc text-sm space-y-1">
              <li>Duracell Quantum</li>
              <li>Energizer</li>
            </ul>
            <p className="mt-4 font-semibold">Do NOT Use:</p>
            <ul className="mt-2 ml-5 list-disc text-sm space-y-1">
              <li>Cheap batteries</li>
              <li>Rechargeable batteries</li>
            </ul>
          </div>
          <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">Install fresh premium batteries first, then retry the safe. If the keypad is beeping every 10–15 seconds, remove the batteries, press every keypad button for about one second, then install fresh Duracell Quantum or Energizer batteries before retrying the correct combination after the timeout period.</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => { setBatteryAttempted(true); setShowBatteryPopup(false); }}>I Will Try Recommended Batteries</Button>
            <Button variant="outline" onClick={() => setShowBatteryPopup(false)}>Continue Triage</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapCalculatorModal({ distanceMiles, setDistanceMiles, calculatedTripFee, setCalculatedTripFee, setShowMapCalculator, config }) {
  const calculateTripFee = () => {
    const cfg = config?.serviceArea || { baseFee: 75, baseMilesIncluded: 17, perExtraMileRate: 2.5 };
    const miles = Number(distanceMiles);
    if (!miles || miles <= cfg.baseMilesIncluded) {
      setCalculatedTripFee(cfg.baseFee);
      return;
    }
    const extraMiles = Math.ceil(miles) - cfg.baseMilesIncluded;
    setCalculatedTripFee(cfg.baseFee + extraMiles * cfg.perExtraMileRate);
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Service Area Map Calculator</h2>
              <p className="text-sm text-slate-600">Demo framework: enter calculated driving miles from your shop. Later this can connect to Google Maps or another distance API.</p>
            </div>
            <Button variant="outline" onClick={() => { setShowMapCalculator(false); }}>Close</Button>
          </div>
          <div className="mb-4 h-64 rounded-2xl border bg-slate-100 p-4">
            <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-center text-slate-600">
              <div>
                <p className="font-semibold">Map Placeholder</p>
                <p className="text-sm">Future version: customer address, shop address, route distance, and live map preview.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Distance from shop in miles</label>
              <input className="w-full rounded-xl border p-3" type="number" min="0" placeholder="Example: 24" value={distanceMiles} onChange={(e) => setDistanceMiles(e.target.value)} />
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-sm text-slate-500">Calculated Service / Trip Fee</p>
              <p className="text-2xl font-bold">{calculatedTripFee.toFixed(2)}</p>
              <p className="text-xs text-slate-500">$75 minimum includes 17 miles. Mile 18 and above is $2.50 per mile.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={calculateTripFee}>Calculate Fee</Button>
            <Button variant="outline" onClick={() => { setDistanceMiles(""); setCalculatedTripFee(75); }}>Reset to Minimum</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SafePulseDemo() {
  const { config, loaded, updateConfig, cssVars } = useConfig();
  const [showAdmin, setShowAdmin] = useState(() => new URLSearchParams(window.location.search).get('admin') === 'true');
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
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Lock body scroll when any modal is open
  const anyModalOpen = showResultModal || showInstructions || showBatteryPopup || showMapCalculator || lockedForService;

  // Apply CSS vars from config
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [cssVars]);
  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [anyModalOpen]);

  const [form, setForm] = useState({ name: "", phone: "", email: "", brand: "", lockType: "Electronic keypad", safeOpen: "Yes", serviceAge: "", symptoms: [], tried: "", helped: "Not answered yet" });

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

  const report = `SAFE-TRIAGE TECHNICIAN REPORT

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
      <div className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{config.company.name}</h1>
            <p className="text-slate-600"><span className="text-primary font-semibold">SafeTriage</span> by {config.tagline || 'Sacramento\'s Safe Specialist'}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowInstructions(true)} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm">
              ? Instructions
            </button>
            <button onClick={() => setShowAdmin(true)} className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm" title="Admin Settings">
              &#9881; Admin
            </button>
            {config?.features?.showQaSection && config?.qaUrl && (
              <a href={config.qaUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm">
                Knowledge Base
              </a>
            )}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-4 p-5">
              <CustomerIntake 
                form={form} setForm={setForm}
                showSymptoms={showSymptoms} setShowSymptoms={setShowSymptoms}
                visibleGroups={visibleGroups}
                triageHistory={triageHistory} toggleSymptom={toggleSymptom}
                uploadedPhotos={uploadedPhotos} setUploadedPhotos={setUploadedPhotos}
                showPhotoUpload={showPhotoUpload} setShowPhotoUpload={setShowPhotoUpload}
                distanceMiles={distanceMiles} setDistanceMiles={setDistanceMiles}
                calculatedTripFee={calculatedTripFee} setCalculatedTripFee={setCalculatedTripFee}
                config={config}
                serviceEstimate={serviceEstimate}
                dispatchType={dispatchType}
                score={score} risk={risk}
              />
            </CardContent>
          </Card>
          <TriageResults score={score} risk={risk} symptomRecommendations={symptomRecommendations} customerDamageRisk={customerDamageRisk} dispatchType={dispatchType} serviceEstimate={serviceEstimate} calculatedTripFee={calculatedTripFee} possibleCauses={possibleCauses} batteryAttempted={batteryAttempted} form={form} setForm={setForm} triageHistory={triageHistory} getSymptomLabel={getSymptomLabel} config={config} uploadedPhotos={uploadedPhotos} photoSummary={photoSummary} distanceMiles={distanceMiles} />
        </div>
        <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5"><h2 className="text-xl font-semibold">Technician Text Report</h2><textarea className="h-72 w-full rounded-xl border p-3 font-mono text-sm" value={report} readOnly /></CardContent></Card>
        <button onClick={() => window.location.reload()} className="mt-4 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
          Start Over — Clear All
        </button>
      </div>
      {lockedForService && <ServiceLockoutModal />}
      {showMapCalculator && <MapCalculatorModal distanceMiles={distanceMiles} setDistanceMiles={setDistanceMiles} calculatedTripFee={calculatedTripFee} setCalculatedTripFee={setCalculatedTripFee} setShowMapCalculator={setShowMapCalculator} config={config} />}
      {showBatteryPopup && <BatteryPopup setShowBatteryPopup={setShowBatteryPopup} setBatteryAttempted={setBatteryAttempted} />}
      {showResultModal && lastSelectedSymptom && (
        <SymptomResultModal
          symptomId={lastSelectedSymptom}
          symptomData={possibleCauseLibrary[lastSelectedSymptom]}
          symptomLabel={getSymptomLabel(lastSelectedSymptom)}
          onClose={() => { setShowResultModal(false); setLastSelectedSymptom(null); }}
        />
      )}
      {showAdmin && <AdminPanel config={config} updateConfig={updateConfig} onClose={() => setShowAdmin(false)} />}
      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </div>
  );
}

