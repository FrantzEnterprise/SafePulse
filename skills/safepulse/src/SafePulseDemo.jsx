import React, { useMemo, useState, useEffect, Component } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfig } from "./useConfig";
import AdminPanel from "./AdminPanel";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null, info: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { this.setState({ info }); }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,textAlign:'center',fontFamily:'sans-serif',background:'#0f172a',minHeight:'100vh',color:'#fff'}}>
          <h1 style={{color:'#ef4444'}}>🔐 SafeTriage — Render Error</h1>
          <p style={{color:'#ef4444',marginTop:20}}>{this.state.error.toString()}</p>
          <p style={{color:'#94a3b8',marginTop:10,fontSize:12}}>{this.state.info?.componentStack || ''}</p>
          <button onClick={() => window.location.reload()} style={{marginTop:20,background:'#d4a843',color:'#1a3a5c',border:'none',padding:'12px 24px',borderRadius:8,fontWeight:'bold',cursor:'pointer'}}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import LoginModal from "./LoginModal";
import { isLoggedIn, logout } from "./auth";

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
        { id: "dial_stuck", label: "Dial is stuck and will not move!", points: 35, recommendation: "Stuck dial — do not force. Try dialing +/- 1-3 numbers off your combination. Call technician if no success.", causes: ["Dial key locked", "Dial knocked off center", "Spindle seized from moisture", "Contents blocking bolt extension"], remedy: "Check if dial has a keyhole and is locked. Try dialing +/- 1-3 numbers off combo. If seized from moisture, do not spray chemicals — this can make it worse. Check inside safe for objects blocking bolts when locking.", note: "Stuck dials are not an easy fix. Turning the dial too hard can create detrimental issues and increase costs to open and repair.", parts: ["Replacement dial", "Spindle components", "Lock case service"], triggersBatteryPopup: false, triggersDamageWarning: true, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "dial_sticky_tight", label: "Dial is very sticky and/or tight to turn", points: 20, recommendation: "Sticky dial — try compressed air around dial. If misaligned, tap lightly into place. Wheel pack issue needs new lock.", causes: ["Bushing wear in index ring", "Dial misalignment from bump", "Wheel pack contamination", "Dried lubrication"], remedy: "Try blowing out debris with compressed air around dial. If bumped out of alignment, tap lightly into place. If wheel pack is the issue, a new lock is needed. Do not oil the bushing — messy and only temporary.", note: "This can be an issue with a bushing under the dial in the index ring, a dial misalignment, or an issue in the lock's wheel pack.", parts: ["Dial ring/bushing", "Compressed air can", "Replacement lock case"] },
        { id: "dial_loose_spin", label: "Dial is loose, seems to spin too easy and will not engage to open", points: 30, recommendation: "Dial loose from wear — try pulling dial toward you while dialing. If it opens, leave it open and call technician.", causes: ["Hard usage wear", "Long-term wear", "Drive cam worn", "Engagement teeth stripped"], remedy: "Try pulling the dial toward you while you dial. You may feel it pick up the wheels and get it open. If it opens, leave it open and call technician to service the lock.", note: "This is not a good sign and indicates wear, either from hard, rough and/or long time usage.", parts: ["Replacement dial", "Drive cam assembly", "Lock case rebuild kit"] },
        { id: "dial_drag", label: "Dialing the combination, it does not unlock easily and have to dial it multiple times to unlock it", points: 20, recommendation: "Dial not unlocking easily — try dialing slightly over/under target number. Wear will worsen over time.", causes: ["Lock wear from age", "Wheel pack friction", "Dried lubrication", "Spindle misalignment"], remedy: "Check dialing sequence first. Try dialing slightly over/under target number, or wiggle dial if it skips past engagement. This condition worsens over time — technician needed.", note: "If you're dialing the sequence correctly, this is usually caused by wear, your lock will need servicing to repair it.", parts: ["Lock case service kit", "Lubrication/graphite", "Wheel pack bushings"] },
        { id: "dial_lost_combo", label: "Lost or forgotten combination, probate, damaged in a burglary, or simply a broken dial lock", points: 40, recommendation: "Lost combination or broken dial lock — technician required to open and repair.", causes: ["Lost combination", "Forgotten combination", "Probate/estate safe", "Burglary damage", "Broken dial lock"], remedy: "You will need to call the technician to open and repair the safe. A skilled safe technician can get through this, possibly without any damage.", note: "Those are always difficult issues, I'm sorry you have to go through this.", parts: ["Dial removal tools", "Replacement lock", "Safe opening tools"] },
        { id: "dial_forgot_combo", label: "I forgot how to dial my combination!", points: 10, recommendation: "We understand it is confusing. Follow the exact dialing sequence provided. Left = counter-clockwise (numbers increase). Right = clockwise (numbers decrease). If you pass a target number you must start over.", causes: ["Confusing dialing direction", "Passing the target number", "Wrong sequence used"], remedy: "Rules:\nLeft is counter clockwise, when you dial left the numbers on the dial increases.\nRight is clockwise, when you dial right the numbers on the dial decreases.\nAny time you pass a number, no matter how close to the last number, it counts as one. {This is the number 1 mistake people make,}\nIf you pass your target number you cannot go back, you must start over.\n\nThe Sequence\nDial your 1st number 4 times to the Left\nDial your 2nd number 3 times to the Right\nDial your 3rd number 2 times to the Left\nDial to the right until you feel it engage and continue until you hit a dead stop. Usually between 85 and 95.\nTurn your handle to open\n\nSome safes have a more simple sequence\nDial your 1st number 3 times to the Right\nDial your 2nd number 2 times to the Left\nDial your 3rd number 1 time to the Right\nTurn your handle to open\n\nSome are the exact reverse sequence\nDial your 1st number 3 times to the Left\nDial Your 2nd number 2 times to the right\nDial your 3rd number 1 time to the Left\nTurn your handle to open", note: "I forgot how to dial is the most common issue people face with mechanical dial locks. Follow these sequences carefully and make sure you stop exactly on each target number.", parts: ["Practice dial", "Combination card", "Pen and paper to write down numbers"] },
      ],
    },
    {
      category: "Electronic Locks",
      symptoms: [
        { id: "keypad_no_response", label: "My keypad does not respond when I touch a key", points: 20, recommendation: "Keypad unresponsive — check battery connections, cable to lock, and battery cartridge terminals.", causes: ["Battery wires unplugged", "Keypad cable ruptured", "Battery cartridge terminal issues", "Missing cartridge spring"], remedy: "Check battery connections are plugged in. Verify keypad cable to lock body is connected and undamaged. If using battery cartridge, ensure terminals make contact and the cartridge spring is present.", note: "There are a few things you can try before you need to call the technician.", parts: ["Battery cartridge", "Keypad cable", "9V batteries"], triggersBatteryPopup: true, triggersDamageWarning: false, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "repeating_beep_timeout", label: "I put my combination in 3 times or more and now it beeps every 10 or 15 seconds", points: 25, recommendation: "Lockout beeping — let stop, unplug battery, press all keys, plug back in, re-enter correct combination.", causes: ["Lockout after 3 incorrect attempts", "Low battery timeout mode", "Temporary keypad lockout"], remedy: "Do not unplug the battery. Wait until the beeping stops. Unplug the battery, push all keys on the keypad, plug the battery back in, make sure you have the correct combination, and enter it again.", note: "Safe locks usually give you three tries before they go into a time-out.", parts: ["Duracell Quantum batteries", "Energizer batteries"], triggersBatteryPopup: true, triggersDamageWarning: false, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "keys_not_register", label: "Some of my keys do not register when I push them", points: 25, recommendation: "Keys not registering — unplug battery, press all keys, replug and retry. Keypad may need replacement.", causes: ["Failed keypad", "Keypad membrane worn", "Internal keypad circuit damage", "Battery voltage too low"], remedy: "Unplug the battery, push all the keys on the keypad, plug the battery back in, and try again. If this does not work the keypad has likely failed and needs replacement.", note: "This is not a good sign, it usually means your keypad failed.", parts: ["Replacement keypad", "Keypad cable", "9V batteries"], triggersBatteryPopup: true, triggersDamageWarning: false, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "click_no_release", label: "I put in my combination, hear the solenoid click or motor turn, but the handle will not turn", points: 35, recommendation: "Solenoid clicks but handle won't turn — move handle to neutral, try pushing toward lock and enter combo. Re-locker may have fired.", causes: ["Handle off neutral position", "Bolt pressure on lock", "Fired re-locker mechanism", "Internal disconnected linkage"], remedy: "Move handle to neutral position first. If handle has no play, push it toward lock direction, hold it, and enter combination. If handle has play and travels past normal, a re-locker may have fired — call technician.", note: "Electronic locks can be finicky, first move the handle to a neutral position first.", parts: ["Replacement lock body", "Re-locker reset/servicing", "Lock solenoid"], triggersBatteryPopup: false, triggersDamageWarning: true, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "elec_lost_combo", label: "I lost or forgot my combination", points: 30, recommendation: "Lost electronic combination — technician needed. May be reset, shorted, or drilled depending on lock make.", causes: ["Lost combination", "Forgotten combination", "Lock memory erased", "Deactivated codes"], remedy: "A lost combination cannot be found. Some electronic locks can be reset, some can be shorted, some have to be drilled. It depends on the make of the lock, not the safe manufacturer.", note: "This is challenging but don't worry, a safe technician can get through this.", parts: ["Programming instructions", "Reset tools", "Replacement lock"] },
      ],
    },
    {
      category: "Mechanical Issues",
      symptoms: [
        { id: "handle_stuck_no_play", label: "Handle is stuck and does not have any play", points: 30, recommendation: "Stuck handle — push handle toward closed position, hold it, enter combo and try to open. Do not force.", causes: ["Bolt pressure binding", "Re-locker fired", "Internal linkage jam"], remedy: "Push the handle toward the closed position, hold it there, enter the combination, and try the handle again. If a re-locker has fired, do not force anything.", note: "A stuck handle with no play often means something inside has shifted or a re-locker has fired.", parts: ["Re-locker reset tools", "Linkage parts"], triggersBatteryPopup: false, triggersDamageWarning: true, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "handle_spins_no_release", label: "My handle moves or spins but it does not release the bolts to open the door", points: 40, recommendation: "Handle spins but bolts don't release — check setscrew on handle hub. If tight, internal issue needs technician.", causes: ["Loose handle setscrew", "Handle hub stripped", "Broken spindle"], remedy: "Check the setscrew on the handle hub — it may have come loose. If the setscrew is tight, there is likely an internal disconnect in the handle to bolt-work, requiring a technician.", note: "This could be simple (tighten a screw), or more involved (internal damage).", parts: ["Setscrew/Allen key", "Replacement handle hub", "Spindle"], triggersBatteryPopup: false, triggersDamageWarning: true, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "handle_resistance", label: "My handle moves a little bit and I feel resistance when trying to open it", points: 25, recommendation: "Handle has resistance — push on door while slowly moving handle to open. Stop if no progress.", causes: ["Door sag misalignment", "Bolt drag on frame", "Rust or debris in bolt path"], remedy: "Apply pressure to the door while slowly moving the handle to open. If the safe is open, check the bolt alignment. If it does not open, stop trying and call the technician.", note: "Keep trying gently while pushing on the door. This often works for door sag or bolt drag.", parts: ["Lubricant spray", "Door alignment shims"], triggersBatteryPopup: false, triggersDamageWarning: true, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
        { id: "door_stops_partial", label: "When opening the safe the door only comes open a little bit and stops", points: 35, recommendation: "Door only opens partway — likely severed bolt connection. Call technician immediately. Do not force.", causes: ["Broken internal bolt connection", "Detached bolt-work link", "Obstruction behind bolts"], remedy: "Do not force the door open further. This usually indicates a broken bolt connection. Call a technician immediately.", note: "This could mean a severed connection between the handle or lock to the bolts.", parts: ["Bolt-work repair kit", "Relock trigger assembly"], triggersBatteryPopup: false, triggersDamageWarning: true, showPopupOnSelect: false, popupTitle: "", popupMessage: "" },
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
        // Migration: add missing trigger fields to any symptom that lacks them
        let migrated = false;
        parsed.forEach(group => {
          group.symptoms.forEach(sym => {
            if (sym.triggersBatteryPopup === undefined) {
              sym.triggersBatteryPopup = false;
              migrated = true;
            }
            if (sym.triggersDamageWarning === undefined) {
              sym.triggersDamageWarning = false;
              migrated = true;
            }
            if (sym.showPopupOnSelect === undefined) {
              sym.showPopupOnSelect = false;
              migrated = true;
            }
            if (sym.popupTitle === undefined) {
              sym.popupTitle = '';
              migrated = true;
            }
            if (sym.popupMessage === undefined) {
              sym.popupMessage = '';
              migrated = true;
            }
          });
        });
        if (migrated) {
          localStorage.setItem('safepulse_symptoms', JSON.stringify(parsed));
        }
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

// Used two places below — checks each symptom's triggersDamageWarning flag
const hasDamageWarning = (id) => symptomOptions.find(s => s.id === id)?.triggersDamageWarning === true;
const hasBatteryPopup = (id) => symptomOptions.find(s => s.id === id)?.triggersBatteryPopup === true;
const hasCustomPopup = (id) => symptomOptions.find(s => s.id === id)?.showPopupOnSelect === true && symptomOptions.find(s => s.id === id)?.popupMessage;


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

function CustomerIntake({ form, setForm, showSymptoms, setShowSymptoms, visibleGroups, triageHistory, toggleSymptom, uploadedPhotos, setUploadedPhotos, showPhotoUpload, setShowPhotoUpload, distanceMiles, setDistanceMiles, calculatedTripFee, setCalculatedTripFee, config, serviceEstimate, dispatchType, score, risk, step, goToStep }) {
  // step & goToStep come from parent now
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
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Symptoms</h3>
          <SymptomsSelector form={form} showSymptoms={showSymptoms} setShowSymptoms={setShowSymptoms} visibleGroups={visibleGroups} triageHistory={triageHistory} toggleSymptom={toggleSymptom} />
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Photo Upload</h3>
          <PhotoUpload uploadedPhotos={uploadedPhotos} setUploadedPhotos={setUploadedPhotos} showPhotoUpload={showPhotoUpload} setShowPhotoUpload={setShowPhotoUpload} />
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
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Service & Cost Framework</h3>
          <p className="text-sm text-slate-600">Ballpark estimates based on your selections. Final pricing depends on safe type, lock condition, and complexity.</p>
          <div className="rounded-2xl border bg-white p-4 space-y-4">
            {/* Pricing — Standard & High Security first */}
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
            
            {/* Parts statement */}
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-center">
              <p className="font-bold text-amber-900" style={{fontSize:'15px',letterSpacing:'0.5px'}}>Parts Are Additional</p>
            </div>

            {config?.serviceNotesToggle && (
              <div className="rounded-xl border p-3">
                <p className="font-semibold text-sm">Service Notes</p>
                <p className="text-sm text-slate-600">{config?.serviceNotes || 'Issue may be resolved with simple troubleshooting or preventive service.'}</p>
              </div>
            )}

            {/* Trip Fee & Mileage Breakdown — below Parts */}
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="font-semibold">Service Trip Fee</p>
              <p className="text-3xl font-bold text-accent">${calculatedTripFee.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">$75 minimum includes 17 miles. $2.50/mile beyond.</p>
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

function TriageResults({ score, risk, symptomRecommendations, customerDamageRisk, dispatchType, serviceEstimate, calculatedTripFee, possibleCauses, batteryAttempted, form, setForm, config, triageHistory, getSymptomLabel, uploadedPhotos, photoSummary, distanceMiles, setShowDispatch, sendDispatch, setShowReview }) {
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
          <p className="mt-2 text-sm font-medium" style={{color:'#475569'}}>{score < 25 ? "You're Looking Good So Far" : score < 50 ? 'You should be concerned and have that looked at should the issue become more serious' : score < 80 ? 'Your issues are serious and you should schedule a service soon' : "⚠️ You Really Need To Contact A Qualified Expert Safe Technician Immediately!"}</p>
        </div>

        <div className="space-y-3" style={{marginBottom:'16px'}}>
          <h2 className="text-xl font-semibold">General Recommendation</h2>
          <p style={{fontSize:'16px',color:'#4a4f55',margin:0}}>{risk.advice}</p>
          {symptomRecommendations.length > 0 && <div><p className="font-semibold" style={{marginTop:'12px'}}>Symptom Analysis</p><ul className="ml-5 list-disc text-sm space-y-2">{symptomRecommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        </div>
        {customerDamageRisk && <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900"><div className="flex items-start gap-3"><div className="text-2xl">⚠</div><div><p className="font-semibold">Continued Attempts May Increase Repair Costs</p><p className="mt-1 text-sm">Repeated attempts, excessive handle pressure, or forcing the lock may worsen the condition or create a complete lockout.</p></div></div></div>}
        <div className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Safe Basic Advice</p>
          <ul className="ml-5 list-disc text-sm"><li>Do not force the handle.</li><li>Use fresh Duracell Quantum or Energizer batteries if electronic.</li><li>Do not use cheap batteries or rechargeable batteries.</li><li>Check for door obstruction only if safe is open.</li><li>Stop repeated attempts if symptoms worsen.</li></ul>
        </div>
        <div className="rounded-2xl bg-white p-4 space-y-3">
          <div><p className="font-semibold text-lg">Possible Service & Cost Framework</p><p className="text-sm text-slate-600">Ballpark estimates only. Final pricing depends on safe type, lock condition, accessibility, parts required, and service complexity.</p></div>
          <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Estimated Service / Trip Fee</p><p className="font-semibold">${calculatedTripFee.toFixed(2)} minimum</p><p className="mt-1 text-xs text-slate-500">Base rate includes first 17 miles. Add $2.50 per mile from mile 18 and up.</p></div><div className="rounded-xl border p-3"><p className="text-sm text-slate-500">Estimated Labor — Standard Safes</p><p className="font-semibold text-lg">{serviceEstimate?.standard} <span className="text-sm font-normal text-slate-400">starting at $275</span></p><p className="mt-2 text-sm text-slate-500">Estimated Labor — High Security Safes</p><p className="font-semibold text-lg">{serviceEstimate?.highSecurity} <span className="text-sm font-normal text-slate-400">starting at $800</span></p></div></div>

          <div className="rounded-xl border p-3"><p className="font-semibold">Service Notes</p><p className="text-sm">{serviceEstimate?.notes}</p></div>
          {possibleCauses.length > 0 && <div className="space-y-3"><p className="font-semibold">Possible Causes & Remedies</p>{possibleCauses.map((item, index) => <div key={index} className="rounded-xl border bg-slate-50 p-3"><p className="font-medium">Possible Causes</p><ul className="ml-5 list-disc text-sm">{item.causes.map((cause, causeIndex) => <li key={causeIndex}>{cause}</li>)}</ul><p className="mt-3 font-medium">Suggested Remedy</p><p className="text-sm" style={{whiteSpace:'pre-line'}}>{item.remedy}</p><p className="mt-3 font-medium">Possible Parts Needed</p><ul className="ml-5 list-disc text-sm">{item.parts.map((part, partIndex) => <li key={partIndex}>{part}</li>)}</ul></div>)}</div>}
        </div>
        {batteryAttempted && <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-blue-900"><p className="font-semibold">Customer attempted recommended premium batteries.</p><p className="mt-1 text-sm">If the issue continues after installing fresh Duracell Quantum or Energizer batteries, further diagnosis or technician service may be required.</p></div>}

        {/* ── Review Button — inside TriageResults container, above ads ── */}
        <button onClick={() => { setForm({ ...form, helped: "Yes" }); setShowReview(true); }}
          style={{
            width:'100%', padding:'14px 12px', borderRadius:'10px',
            border:'none', background:'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
            color:'#d4a843', fontWeight:800, fontSize:'16px', cursor:'pointer',
            letterSpacing:'1px', fontFamily:"'Orbitron',monospace",
            boxShadow:'0 3px 12px rgba(26,58,92,0.3)'
          }}>
          ✨ Did Our Advice Solve The Issue? Click Here
        </button>
      </CardContent>
    </Card>
  );
}

function InstructionsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose} style={{overflowX:'hidden'}}>
      <div className="py-8 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full mx-auto rounded-2xl bg-white p-5 shadow-xl" style={{maxWidth: 'min(90vw, 32rem)'}}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">How to use SafeTriage</h2>
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
            <p className="text-sm font-medium text-blue-900">SafeTriage is a triage tool to help identify safe issues and guide next steps. Always consult a qualified safe technician for any repair work.</p>
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

function SymptomResultModal({ symptomId, symptomData, symptomLabel, onClose, setShowReview }) {
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
        <p className="text-sm text-green-900" style={{whiteSpace:'pre-line'}}>{symptomData.remedy}</p>
      </div>
      {/* Review button inside solution popup */}
      <div className="mt-4 flex justify-center">
        <button onClick={() => { if (setShowReview) setShowReview(true); }}
          style={{
            width:'100%', padding:'14px 10px', borderRadius:'10px',
            border:'none', background:'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
            color:'#d4a843', fontWeight:800, fontSize:'14px', cursor:'pointer',
            letterSpacing:'1px', fontFamily:"'Orbitron',monospace",
            boxShadow:'0 3px 12px rgba(26,58,92,0.3)'
          }}>
          ✨ Did Our Advice Solve The Issue? Click Here
        </button>
      </div>
      {/* Bottom return button */}
      <div className="mt-4 flex justify-center">
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

function CustomPopupModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-slate-900">{data?.title || 'Notice'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
            {data?.message || ''}
          </div>
          <div className="mt-5">
            <Button onClick={onClose} className="w-full">Got It</Button>
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

/* ──────── Right-Column: Navigation Bar ──────── */
function CustomerNavBar({ step, goToStep, totalSteps, sendDispatch, config, setShowDispatch, isLastStep, setShowReview, setForm, form }) {
  return (
    <div style={{background:'#e8edf5',border:'1px solid #b0c4de',borderRadius:'12px',padding:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
      <div style={{display:'flex',gap:'4px',marginBottom:'10px'}}>
        {Array.from({length: totalSteps}, (_, i) => i + 1).map(s => (
          <div key={s} onClick={() => s < step && goToStep(s)}
            style={{
              flex:1, textAlign:'center', padding:'6px 0', borderRadius:'6px', cursor: s < step ? 'pointer' : 'default',
              fontSize:'11px', fontWeight:700,
              background: s === step ? '#1a3a5c' : s < step ? '#d4a843' : '#cbd5e1',
              color: s === step ? '#f8fafc' : s < step ? '#0a1628' : '#475569',
              transition:'0.15s'
            }}>
            {s < step ? '✓' : s === step ? `▸ ${s}` : s}
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:'6px'}}>
        {step > 1 && (
          <button onClick={() => goToStep(step - 1)}
            style={{flex:1,padding:'8px 0',borderRadius:'8px',border:'1px solid #94a3b8',background:'#f1f5f9',color:'#1e293b',fontWeight:700,fontSize:'12px',cursor:'pointer'}}>
            ← Back
          </button>
        )}
        {!isLastStep ? (
          <button onClick={() => goToStep(step + 1)}
            style={{flex:2,padding:'8px 0',borderRadius:'8px',border:'none',background:'#1a3a5c',color:'#f8fafc',fontWeight:700,fontSize:'12px',cursor:'pointer'}}>
            Next →
          </button>
        ) : (
          <button onClick={() => {
            const isMulti = config?.company?.companyType === 'multi';
            if (isMulti && config?.company?.technicians?.length > 0) {
              setShowDispatch(true);
            } else {
              sendDispatch(null);
            }
          }}
            style={{flex:3,padding:'12px 0',borderRadius:'8px',border:'none',background:'#d4a843',color:'#0a1628',fontWeight:800,fontSize:'14px',cursor:'pointer',boxShadow:'0 2px 8px rgba(212,168,67,0.3)'}}>
            🚚 Send To Tech Now
          </button>
        )}
      </div>
      {/* Review button — original position in nav */}
      <button onClick={() => { setForm({ ...form, helped: "Yes" }); setShowReview(true); }}
        style={{
          width:'100%', marginTop:'10px', padding:'14px 0', borderRadius:'10px',
          border:'none', background:'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
          color:'#d4a843', fontWeight:800, fontSize:'16px', cursor:'pointer',
          letterSpacing:'1px', fontFamily:"'Orbitron',monospace",
          boxShadow:'0 3px 12px rgba(26,58,92,0.3)'
        }}>
        ✨ Did Our Advice Solve The Issue? Click Here
      </button>
    </div>
  );
}

/* ──────── Right-Column: Compact Risk Meter ──────── */
function RiskMeterCard({ score, risk }) {
  const gaugeColor = score >= 75 ? '#ff5555' : score >= 50 ? '#ffb86c' : score >= 25 ? '#f1fa8c' : '#50fa7b';
  const riskLabels = {
    Low: { label: 'LOW', color: '#50fa7b' },
    Medium: { label: 'MODERATE', color: '#f1fa8c' },
    High: { label: 'HIGH', color: '#ffb86c' },
    Urgent: { label: 'URGENT', color: '#ff5555' }
  };
  const rl = riskLabels[risk?.level] || { label: 'NEW', color: '#6272a4' };
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{background:'#e8edf5',border:'1px solid #b0c4de',borderRadius:'12px',padding:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        {/* Gauge */}
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#cbd5e1" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none"
            stroke={gaugeColor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 40 40)" style={{transition:'stroke-dashoffset 0.5s ease'}} />
          <text x="40" y="36" textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="bold">{score}</text>
          <text x="40" y="54" textAnchor="middle" fill="#475569" fontSize="9">/ 100</text>
        </svg>

        <div style={{flex:1}}>
          <div style={{fontSize:'13px',fontWeight:700,color:rl.color,letterSpacing:'0.5px'}}>{rl.label} RISK</div>
          <div style={{fontSize:'11px',color:'#334155',marginTop:'2px',lineHeight:1.4}}>{risk?.advice?.slice(0, 80) || 'Complete the intake steps to calculate risk score.'}</div>
          {/* Tiny progress bar */}
          <div style={{marginTop:'8px',height:'4px',background:'#cbd5e1',borderRadius:'99px',overflow:'hidden'}}>
            <div style={{width:`${score}%`,height:'100%',background:gaugeColor,borderRadius:'99px',transition:'width 0.4s'}} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────── Right-Column: Ad Placeholders ──────── */
/* ──────── Ad Popup Modal ──────── */
/* ──────── Review Popup ──────── */
function ReviewPopup({ onClose, reviewLinks }) {
  const links = Array.isArray(reviewLinks) ? reviewLinks.filter(l => l && l.active !== false) : [];
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background:'#1a3a5c', borderRadius:'20px', padding:'40px 30px', textAlign:'center',
          maxWidth:'340px', width:'90%',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          animation:'adpopupBounce 0.4s ease-out'
        }}>
        <div style={{fontSize:'36px',marginBottom:'8px'}}>⭐</div>
        <div style={{
          fontFamily:"'Orbitron',monospace", fontSize:'22px', fontWeight:800,
          color:'#d4a843', letterSpacing:'1px', marginBottom:'16px'
        }}>
          Leave A Review
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
          {links.length > 0 ? links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener"
              style={{padding:'10px 14px',background:'#fff',borderRadius:'10px',textDecoration:'none',fontWeight:700,fontSize:'13px',color:'#1a3a5c'}}>
              <span style={{marginRight:6}}>{l.icon || '⭐'}</span>{l.label}
            </a>
          )) : (
            <p style={{color:'#94a3b8',fontSize:'12px'}}>No review links configured in Admin → Reviews</p>
          )}
        </div>
        <button onClick={onClose}
          style={{
            padding:'12px 24px', borderRadius:'10px', border:'2px solid #d4a843',
            background:'transparent', color:'#d4a843', fontWeight:800, fontSize:'16px',
            fontFamily:"'Orbitron',monospace", cursor:'pointer', width:'100%'
          }}>
          Close App
        </button>
      </div>
    </div>
  );
}

/* ──────── Ad Popup ──────── */
function AdPopup({ onClose }) {
  const [stage, setStage] = useState(0);
  const messages = [
    { text: 'Click Here', sub: '🚀', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { text: 'Put Your Ad Here', sub: '📢', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { text: 'Call', sub: '(916) 534-4900', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  ];

  useEffect(() => {
    if (stage < 2) {
      const t = setTimeout(() => setStage(s => s + 1), 1500);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: messages[stage]?.gradient || messages[0].gradient,
          borderRadius:'20px', padding:'40px 50px', textAlign:'center',
          maxWidth:'360px', width:'90%',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)', cursor:'pointer',
          animation:'adpopupBounce 0.4s ease-out'
        }}
        onClick={() => { if (stage < 2) setStage(s => s + 1); else onClose(); }}>
        <div style={{fontSize:'48px',marginBottom:'12px',opacity:0.6}}>{messages[stage]?.sub}</div>
        <div style={{
          fontFamily:"'Orbitron',monospace",
          fontSize: stage === 2 ? '22px' : '28px',
          fontWeight: 800, color: '#fff',
          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          letterSpacing: '1px',
          lineHeight: 1.3
        }}>
          {messages[stage]?.text}
        </div>
        <div style={{marginTop:'16px',fontSize:'11px',color:'rgba(255,255,255,0.5)',fontWeight:600}}>
          {stage < 2 ? 'Tap to continue →' : 'Tap to close'}
        </div>
      </div>
    </div>
  );
}

/* ──────── Ad Zone (reads config.ads + mock placeholder) ──────── */
function AdZone({ config }) {
  const [showPopup, setShowPopup] = useState(false);
  const ads = config?.ads || [];
  const activeAds = ads.filter(a => a.active !== false);
  
  const renderAdBox = (ad, idx) => {
    if (!ad) {
      // Empty placeholder
      return (
        <div key={`empty-${idx}`} onClick={() => setShowPopup(true)}
          style={{flex:1,background:'#0f1f3d',border:'1px dashed #d4a843',borderRadius:'8px',padding:idx === 0 ? '10px' : '10px',textAlign:'center',minHeight:'80px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'0.15s'}}
          onMouseEnter={e => e.currentTarget.style.background = '#1a2a4a'}
          onMouseLeave={e => e.currentTarget.style.background = '#0f1f3d'}>
          <span style={{fontSize:'10px',fontWeight:600,color:'#d4a843',letterSpacing:'0.5px'}}>Click Here</span>
          <span style={{fontSize:'8px',color:'#6272a4',marginTop:'4px'}}>300 × 250</span>
        </div>
      );
    }

    const hasAbove = ad.layout === 'text-above' || ad.layout === 'text-both';
    const hasBelow = ad.layout === 'text-below' || ad.layout === 'text-both';

    return (
      <div key={ad.id || idx} onClick={() => { if (ad.linkUrl) window.open(ad.linkUrl, '_blank'); else setShowPopup(true); }}
        style={{
          flex:1, background:'#0f1f3d', border:'1px solid #2a3a5a', borderRadius:'8px',
          padding:'8px', textAlign:'center', minHeight:'80px',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'0.15s'
        }}
        onMouseEnter={e => {e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.background = '#1a2a4a';}}
        onMouseLeave={e => {e.currentTarget.style.borderColor = '#2a3a5a'; e.currentTarget.style.background = '#0f1f3d';}}>
        {hasAbove && ad.captionAbove && (
          <div style={{fontSize:'9px',fontWeight:600,color:'#d4a843',marginBottom:'4px',lineHeight:1.2}}>{ad.captionAbove}</div>
        )}
        {ad.imageData ? (
          <img src={ad.imageData} alt="ad" style={{width:'100%',borderRadius:'6px',display:'block'}} />
        ) : (
          <span style={{fontSize:'10px',fontWeight:600,color:'#d4a843',letterSpacing:'0.5px'}}>Click Here</span>
        )}
        {hasBelow && ad.captionBelow && (
          <div style={{fontSize:'9px',fontWeight:600,color:'#d4a843',marginTop:'4px',lineHeight:1.2}}>{ad.captionBelow}</div>
        )}
      </div>
    );
  };

  const slots = [
    activeAds[0] || null,
    activeAds[1] || null,
  ];

  return (
    <div>
      {showPopup && <AdPopup onClose={() => setShowPopup(false)} />}
      <p style={{fontSize:'19px',color:'#6272a4',textAlign:'center',marginBottom:'4px',fontStyle:'italic',letterSpacing:'0.5px',fontWeight:600}}>
        ⚡ Paid Advertisements ⚡
      </p>
      <p style={{fontSize:'19px',color:'#6272a4',textAlign:'center',marginBottom:'8px',fontStyle:'normal',letterSpacing:'0.5px',fontWeight:500}}>
        From Our Vetted &amp; Trusted Business Partners
      </p>
      <div style={{display:'flex',flexDirection:'column',gap:'6px',padding:'0 4px',width:'100%',boxSizing:'border-box'}}>
        {slots.map((ad, idx) => (
          <div key={idx} style={{width:'100%'}}>
            {renderAdBox(ad, idx)}
          </div>
        ))}
      </div>
      <p style={{fontSize:'22px',color:'#6272a4',textAlign:'center',marginTop:'6px',fontStyle:'italic',fontWeight:600}}>
        Have a related Business and/or Product? Call (916) 534-4900 to place your ad here.
      </p>
    </div>
  );
}

function SafeTriageDemo() {
  const { config, loaded, updateConfig, cssVars } = useConfig();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('safepulse_dark') === 'true');
  const [showSplash, setShowSplash] = useState(true);
  const [showAdmin, setShowAdmin] = useState(() => new URLSearchParams(window.location.search).get('admin') === 'true');
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isLoggedIn());
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
  const [showReview, setShowReview] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);
  const [dispatchTech, setDispatchTech] = useState(null);
  const [dispatchSmsSent, setDispatchSmsSent] = useState(false);
  const [dispatchEmailSent, setDispatchEmailSent] = useState(false);
  const [dispatchDone, setDispatchDone] = useState(false);
  const [dispatchSending, setDispatchSending] = useState(false);

  // Feature-gating: respect config feature toggles from Admin panel
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

    const sendDispatch = async (selectedTech) => {
    setDispatchSending(true);
    setShowDispatch(false);

    // Save to triage history — ALWAYS saved first
    const triageEntry = {
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      name: form.name,
      phone: form.phone,
      email: form.email,
      brand: form.brand,
      lockType: form.lockType,
      safeOpen: form.safeOpen,
      serviceAge: form.serviceAge,
      symptoms: form.symptoms,
      tried: form.tried,
      score,
      risk: risk.level,
      dispatchType: dispatchType.type,
      status: "new",
      notes: form.notes || ""
    };
    try {
      const existing = JSON.parse(localStorage.getItem("sp_triage_history") || "[]");
      existing.unshift(triageEntry);
      localStorage.setItem("sp_triage_history", JSON.stringify(existing.slice(0, 500)));
    } catch(e) { }

    const ejs = config?.emailjs || {};
    const isMulti = config?.company?.companyType === "multi";
    const companyPhone = config?.company?.phone || "";
    const safePhone = (isMulti && selectedTech) ? selectedTech.phone : companyPhone;
    const cleanPhone = (safePhone || "").replace(/[\s\(\)\-]/g, "");
    const photoSummarySMS = Object.entries(uploadedPhotos || {}).filter(([,f]) => f).map(([,f]) => "  - " + f.name).join("\n") || "  None";

    const techReport = `SAFE-TRIAGE TECHNICIAN REPORT\n\nCustomer: ${form.name || "Not provided"}\nPhone: ${form.phone || "Not provided"}\nSafe Brand: ${form.brand || "Unknown"}\nLock Type: ${form.lockType}\nSafe Currently Open: ${form.safeOpen}\nYears Since Service: ${form.serviceAge || "Unknown"}\n\nCurrent Symptoms: ${form.symptoms.map(getSymptomLabel).join(", ") || "None"}\nRisk Score: ${score}/100 — ${risk.level}\nRecommendation: ${risk.advice}\n\nWhat Customer Tried:\n${form.tried || "Not provided"}\n\nPhotos:\n${photoSummarySMS}\n\nEstimated Fee: $${calculatedTripFee.toFixed(2)}\nDistance: ${distanceMiles || "Not calculated"} miles`;

    const customerReport = `Hi ${form.name || "Valued Customer"},\n\nThank you for using ${config?.company?.name || "Frantz Locksmith Service"}'s SafeTriage tool.\n\nWe have received your safe service request and will contact you ASAP.\n\n=== SAFE-TRIAGE REPORT ===\n\n${techReport}\n\n---\nIf you have additional details, call ${config?.company?.phone || ""}.\n\nBest,\n${config?.company?.name || "Frantz Locksmith Service"}`;

    // 1. SMS to tech — ALWAYS TRIGGERED FIRST, before showing any options
    if (cleanPhone) {
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(techReport)}`;
      } else {
        try {
          await navigator.clipboard.writeText(
            `Tech phone: ${cleanPhone}\n\n${techReport}`
          );
        } catch {
          const ta = document.createElement("textarea");
          ta.value = `Tech phone: ${cleanPhone}\n\n${techReport}`;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
      }
      setDispatchSmsSent(true);
    }

    // 2. Email via EmailJS (if configured)
    if (ejs.publicKey && ejs.serviceId) {
      if (form.email && ejs.templateIdConfirm) {
        try {
          await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              service_id: ejs.serviceId,
              template_id: ejs.templateIdConfirm,
              user_id: ejs.publicKey,
              template_params: {
                to_email: form.email,
                to_name: form.name || "Customer",
                customer_name: form.name || "Valued Customer",
                company_name: config?.company?.name || "",
                tech_name: selectedTech?.name || config?.company?.name || "Technician",
                report: customerReport,
                phone: config?.company?.phone || "",
                branding: "Powered by Frantz Enterprise",
              }
            })
          });
        } catch(e) { }
      }

      const techEmail = isMulti && selectedTech?.email ? selectedTech.email : config?.company?.email;
      if (techEmail && ejs.templateIdReport) {
        try {
          await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              service_id: ejs.serviceId,
              template_id: ejs.templateIdReport,
              user_id: ejs.publicKey,
              template_params: {
                to_email: techEmail,
                to_name: selectedTech?.name || "Technician",
                customer_name: form.name || "Customer",
                customer_phone: form.phone || "",
                company_name: config?.company?.name || "",
                report: techReport,
                risk_score: score,
                risk_level: risk.level,
                fee: calculatedTripFee.toFixed(2),
                distance: distanceMiles || "N/A",
                branding: "Powered by Frantz Enterprise",
              }
            })
          });
          setDispatchEmailSent(true);
        } catch(e) { }
      }
    }

    setForm({ ...form, helped: "No" });
    setDispatchTech(null);
    setDispatchSending(false);
    setDispatchDone(true);
  };
  // Lock body scroll when any modal is open
  const anyModalOpen = showResultModal || showInstructions || showBatteryPopup || showMapCalculator || lockedForService || customPopupData !== null;

  // Apply CSS vars from config
  const darkVars = darkMode ? {
    '--color-bg': '#0f172a',
    '--color-card-bg': '#1e293b',
    '--color-card-border': '#334155',
    '--color-body-text': '#e2e8f0',
  } : {};

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    Object.entries(darkVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    root.classList.toggle('dark', darkMode);
  }, [cssVars, darkMode]);
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/SafePulse/sw.js').catch(() => {});
    }
  }, []);
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
  const customerDamageRisk = triageHistory.some((symptom) => hasDamageWarning(symptom));
  const symptomRecommendations = symptomOptions.filter((symptom) => triageHistory.includes(symptom.id)).map((symptom) => symptom.recommendation);

  const toggleSymptom = (id) => {
    if (lockedForService) return;
    if (hasBatteryPopup(id)) setShowBatteryPopup(true);
    if (hasCustomPopup(id)) {
      const sym = symptomOptions.find(s => s.id === id);
      setCustomPopupData({ title: sym.popupTitle || 'Notice', message: sym.popupMessage });
    }
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
Advice Helpful?: ${form.helped}
---
Powered by Frantz Enterprise`;

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" style={{background:'linear-gradient(160deg, #0f1f3d 0%, #1a3a5c 50%, #0f1f3d 100%)'}}>
        <style>{`
          @keyframes zoomIn {
            0% { transform: scale(0.2) rotate(-20deg); opacity: 0; }
            60% { transform: scale(2.8) rotate(5deg); opacity: 1; }
            100% { transform: scale(2.6) rotate(0deg); opacity: 1; }
          }
          .splash-logo {
            animation: zoomIn 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            padding: 12px;
            width: 168px;
            height: auto;
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .splash-text { animation: fadeInUp 0.6s 0.6s both; }
          .splash-sub { animation: fadeInUp 0.6s 0.8s both; }
          .splash-bar { animation: fadeInUp 0.6s 1.0s both; }
          @keyframes loadBar {
            0% { width: 0%; }
            100% { width: 85%; }
          }
          @keyframes adpopupBounce {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .splash-load { animation: loadBar 1.8s 0.6s cubic-bezier(0.4, 0, 0.2, 1) both; }
        `}</style>
        <img src="frantz-logo.jpg" alt="Frantz Locksmith Service" className="splash-logo rounded-xl" style={{boxShadow:'0 0 40px rgba(212,168,67,0.3)'}} />
        <div className="splash-text" style={{color:'#d4a843',fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:'14px',letterSpacing:'3px',marginTop:'8px'}}>
          SafeTriage
        </div>
        <div className="splash-sub" style={{color:'#6272a4',fontSize:'11px',marginTop:'8px',letterSpacing:'1px'}}>Powered by Frantz Enterprise</div>
        <div className="splash-bar mt-6 w-40 h-0.5 rounded-full overflow-hidden" style={{background:'#1a2a4a'}}>
          <div className="splash-load h-full rounded-full" style={{background:'#d4a843'}} />
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div>
        <AdminPanel config={config} updateConfig={updateConfig} onClose={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900 relative" style={{overflowX:'hidden'}}>
      {showLogin && <LoginModal onLogin={() => { setIsAuthenticated(true); setShowLogin(false); setShowAdmin(true); }} onClose={() => setShowLogin(false)} />}
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">{config.company.name}</h1>
              <p className="text-slate-600"><span className="text-primary font-semibold">SafeTriage</span> by {config.tagline || 'Sacramento\'s Safe Specialist'}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => { setDarkMode(d => { const n = !d; localStorage.setItem('safepulse_dark', n); return n; }); }} className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm" title="Toggle Dark Mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setShowInstructions(true)} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm">
              ? Instructions
            </button>
            {isAuthenticated && <button onClick={() => { logout(); setIsAuthenticated(false); }} className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm" title="Sign Out">🚪</button>}
            <button onClick={() => { if (isAuthenticated) { setShowAdmin(true); } else { setShowLogin(true); } }} className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm" title="Admin Settings">
              &#9881; Admin
            </button>
            {config?.features?.showQaSection && config?.qaUrl && (
              <a href={config.qaUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 shadow-sm">
                Knowledge Base
              </a>
            )}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* ── Left Column: Intake Steps ── */}
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
                step={customerStep}
                goToStep={goToCustomerStep}
              />
            </CardContent>
          </Card>

          {/* ── Right Column: Nav → Risk → Offers → Tech Report ── */}
          <div className="space-y-4 sticky top-4" style={{alignSelf:'start'}}>
            {/* Navigation Buttons */}
            <CustomerNavBar step={customerStep} goToStep={goToCustomerStep} totalSteps={6}
              sendDispatch={sendDispatch} config={config} setShowDispatch={setShowDispatch}
              isLastStep={customerStep === 6}
              setShowReview={setShowReview} setForm={setForm} form={form}
            />

            {/* Desktop: Copy / Email / Save — visible when report is ready */}
            {score > 0 && risk && (
              <div style={{background:'#e8edf5',border:'1px solid #b0c4de',borderRadius:'12px',padding:'10px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  <button onClick={() => {
                    const cleanPhone = (config?.company?.phone || '').replace(/[\s\(\)\-]/g,'');
                    const txt = `TECH REPORT\n\nRisk: ${score}/100 — ${risk.level}\nCustomer: ${form.name || 'N/A'}\nRecommendation: ${risk.advice}`;
                    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && cleanPhone) {
                      window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(txt)}`;
                    } else {
                      navigator.clipboard.writeText(txt).then(() => alert('📋 SMS text copied to clipboard!'));
                    }
                  }}
                    style={{flex:1,minWidth:'72px',padding:'6px 0',border:'1px solid #94a3b8',borderRadius:'6px',background:'#f1f5f9',color:'#1e293b',fontWeight:700,fontSize:'10px',cursor:'pointer'}}>
                    📱 SMS
                  </button>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`RISK: ${score}/100 — ${risk.level}\nCustomer: ${form.name || 'N/A'}\nPhone: ${form.phone || 'N/A'}\nSafe: ${form.brand || 'Unknown'}\nLock: ${form.lockType}\nSymptoms: ${form.symptoms.map(s => {try{return JSON.parse(s).label}catch{return s}}).join(', ') || 'None'}\nAdvice: ${risk.advice}`)
                      .then(() => alert('📋 Report copied to clipboard! Paste anywhere.'));
                  }}
                    style={{flex:1,minWidth:'72px',padding:'6px 0',border:'1px solid #94a3b8',borderRadius:'6px',background:'#f1f5f9',color:'#1e293b',fontWeight:700,fontSize:'10px',cursor:'pointer'}}>
                    📋 Copy
                  </button>
                  <button onClick={() => {
                    const txt = `SafeTriage Report\n\nRisk: ${score}/100 — ${risk.level}\nCustomer: ${form.name || 'N/A'}\nPhone: ${form.phone || 'N/A'}\nSafe: ${form.brand || 'Unknown'}\nLock: ${form.lockType}\nSymptoms: ${form.symptoms.map(s => {try{return JSON.parse(s).label}catch{return s}}).join(', ') || 'None'}\nAdvice: ${risk.advice}\n\nPowered by Frantz Enterprise`;
                    if (form.email) {
                      window.location.href = `mailto:${form.email}?subject=SafeTriage Report&body=${encodeURIComponent(txt)}`;
                    } else {
                      alert('Customer email not provided. Use Copy instead, or enter an email in Step 1.');
                    }
                  }}
                    style={{flex:1,minWidth:'72px',padding:'6px 0',border:'1px solid #94a3b8',borderRadius:'6px',background:'#f1f5f9',color:'#1e293b',fontWeight:700,fontSize:'10px',cursor:'pointer'}}>
                    ✉️ Email
                  </button>
                  <button onClick={() => {
                    const txt = `SafeTriage Report\n\nRisk: ${score}/100 — ${risk.level}\nCustomer: ${form.name || 'N/A'}\nPhone: ${form.phone || 'N/A'}\nSafe: ${form.brand || 'Unknown'}\nLock: ${form.lockType}\nSymptoms: ${form.symptoms.map(s => {try{return JSON.parse(s).label}catch{return s}}).join(', ') || 'None'}\nAdvice: ${risk.advice}\n\nPowered by Frantz Enterprise`;
                    const blob = new Blob([txt], {type:'text/plain'});
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `SafeTriage-Report-${Date.now()}.txt`;
                    a.click();
                  }}
                    style={{flex:1,minWidth:'72px',padding:'6px 0',border:'1px solid #94a3b8',borderRadius:'6px',background:'#f1f5f9',color:'#1e293b',fontWeight:700,fontSize:'10px',cursor:'pointer'}}>
                    💾 Save
                  </button>
                </div>
              </div>
            )}

            {/* Full Tech Report (scrollable) — with embedded risk display */}
            <TriageResults score={score} risk={risk} symptomRecommendations={symptomRecommendations} customerDamageRisk={customerDamageRisk} dispatchType={dispatchType} serviceEstimate={serviceEstimate} calculatedTripFee={calculatedTripFee} possibleCauses={possibleCauses} batteryAttempted={batteryAttempted} form={form} setForm={setForm} triageHistory={triageHistory} getSymptomLabel={getSymptomLabel} config={config} uploadedPhotos={uploadedPhotos} photoSummary={photoSummary} distanceMiles={distanceMiles} setShowDispatch={setShowDispatch} sendDispatch={sendDispatch} setShowReview={setShowReview} />

            {/* Ad Placeholders */}
            <AdZone config={config} />
          </div>
        </div>
        <div className="print-only print-report">
          <div style={{background:'#1a3a5c',color:'#fff',padding:'24px 32px',textAlign:'center'}}>
            <h1 style={{margin:0,fontSize:'22px'}}>{config.company.name}</h1>
            <p style={{margin:'4px 0 0',fontSize:'13px',opacity:0.9}}>Safe Triage Technician Report</p>
          </div>
          <div style={{padding:'24px 32px',fontSize:'13px',lineHeight:1.7}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <tr><td style={{fontWeight:700,width:'40%',padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Date</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{new Date().toLocaleDateString()}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Customer</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.name || 'Not provided'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Phone/Text</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.phone || 'Not provided'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Email</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.email || 'Not provided'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Safe Brand</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.brand || 'Unknown'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Lock Type</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.lockType}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Safe Open?</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.safeOpen}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Years Since Service</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.serviceAge || 'Unknown'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Symptoms</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.symptoms.map(getSymptomLabel).join(', ') || 'None selected'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Customer Tried</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{form.tried || 'Not provided'}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Risk Score</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}><strong>{score}/100</strong> — {risk.level}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Recommendation</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{risk.advice}</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>Distance</td><td style={{padding:'6px 8px',borderBottom:'1px solid #e2e8f0'}}>{distanceMiles || 'Not calculated'} miles</td></tr>
              <tr><td style={{fontWeight:700,padding:'6px 8px'}}>Est. Service Fee</td><td style={{padding:'6px 8px'}}>${calculatedTripFee.toFixed(2)}</td></tr>
            </table>
            {photoSummary && (
              <>
                <h3 style={{margin:'16px 0 8px',fontSize:'14px'}}>Uploaded Photos</h3>
                <p style={{margin:0,color:'#475569'}}>{photoSummary}</p>
              </>
            )}
            <p style={{marginTop:'24px',fontSize:'11px',color:'#94a3b8',textAlign:'center',borderTop:'1px solid #e2e8f0',paddingTop:'12px'}}>
              Generated by SafeTriage — {config.company.name} | {config.company.phone}
            </p>
          </div>
        </div>
        <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5"><h2 className="text-xl font-semibold">Technician Text Report</h2><textarea className="h-72 w-full rounded-xl border p-3 font-mono text-sm" value={report} readOnly /></CardContent></Card>
        <div className="flex gap-3 no-print">
          <button onClick={() => window.print()} className="flex-1 rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
            📄 Download PDF Report
          </button>
        </div>
        <button onClick={() => window.location.reload()} className="mt-4 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-accent shadow-md hover:opacity-90">
          Start Over — Clear All
        </button>
      </div>
      {lockedForService && <ServiceLockoutModal />}
      {showMapCalculator && <MapCalculatorModal distanceMiles={distanceMiles} setDistanceMiles={setDistanceMiles} calculatedTripFee={calculatedTripFee} setCalculatedTripFee={setCalculatedTripFee} setShowMapCalculator={setShowMapCalculator} config={config} />}
      {showReview && <ReviewPopup onClose={() => setShowReview(false)} reviewLinks={config?.reviewLinks} />}
      {showBatteryPopup && <BatteryPopup setShowBatteryPopup={setShowBatteryPopup} setBatteryAttempted={setBatteryAttempted} />}
      {customPopupData && <CustomPopupModal data={customPopupData} onClose={() => setCustomPopupData(null)} />}
      {showResultModal && lastSelectedSymptom && (
        <SymptomResultModal
          symptomId={lastSelectedSymptom}
          symptomData={possibleCauseLibrary[lastSelectedSymptom]}
          symptomLabel={getSymptomLabel(lastSelectedSymptom)}
          onClose={() => { setShowResultModal(false); setLastSelectedSymptom(null); }}
          setShowReview={setShowReview}
        />
      )}
      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
      {showDispatch && (
        <DispatchModal
          technicians={config?.company?.technicians || []}
          onSelect={(tech) => sendDispatch(tech)}
          onClose={() => { setShowDispatch(false); setDispatchTech(null); }}
        />
      )}

      {/* Dispatch status overlay — shown while sending */}
      {dispatchSending && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{background:'rgba(0,0,0,0.7)',padding:'20px'}}>
          <div style={{background:'#0f1f3d',border:'1px solid #d4a843',borderRadius:'16px',padding:'32px',maxWidth:'420px',width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>📡</div>
            <h3 style={{fontWeight:700,fontSize:'16px',color:'#d4a843',marginBottom:'8px'}}>Dispatching to Technician...</h3>
            <p style={{fontSize:'13px',color:'#94a3b8'}}>
              Sending SMS to tech and emailing reports...
            </p>
            <div style={{margin:'16px auto',width:'40px',height:'40px',border:'3px solid #2a3a5a',borderTop:'3px solid #d4a843',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      )}

      {/* Dispatch done overlay — shows after SMS is sent */}
      {dispatchDone && !dispatchSending && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{background:'rgba(0,0,0,0.7)',padding:'20px'}}
          onClick={e => { if (e.target === e.currentTarget) setDispatchDone(false); }}>
          <div style={{background:'#0f1f3d',border:'1px solid #50fa7b',borderRadius:'16px',padding:'28px',maxWidth:'440px',width:'100%'}}>
            <div style={{fontSize:'32px',marginBottom:'8px',textAlign:'center'}}>✅</div>
            <h3 style={{fontWeight:700,fontSize:'18px',color:'#50fa7b',marginBottom:'4px',textAlign:'center'}}>Tech Has Been Dispatched!</h3>
            <p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center',marginBottom:'16px'}}>
              The technician has been notified. A record is saved in the Triage History.
            </p>
            
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <button onClick={() => {
                const reportText = `SAFE-TRIAGE REPORT\n\nCustomer: ${form.name || ''}\nPhone: ${form.phone || ''}\nSafe: ${form.brand || ''}\nSymptoms: ${form.symptoms.map(getSymptomLabel).join(', ')}\nScore: ${score}/100\nFee: $${calculatedTripFee.toFixed(2)}`;
                if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  const cleanPhone = (config?.company?.phone || '').replace(/[\s\(\)\-]/g, '');
                  window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(reportText)}`;
                } else {
                  navigator.clipboard.writeText(reportText).then(() => alert('Report copied to clipboard!'));
                }
              }}
                style={{padding:'10px',borderRadius:'8px',border:'none',background:'#1a3a5c',color:'#d4a843',fontWeight:700,cursor:'pointer',fontSize:'13px'}}>
                📱 Send SMS Again
              </button>
              <button onClick={() => {
                // PDF download — auto-generate and download via browser
                const pdfContent = `SAFE-TRIAGE TECHNICIAN REPORT\n\nCustomer: ${form.name || ""}\nPhone: ${form.phone || ""}\nBrand: ${form.brand || ""}\nSymptoms: ${form.symptoms.map(getSymptomLabel).join(", ")}\nRisk Score: ${score}/100\nFee: $${calculatedTripFee.toFixed(2)}`;
                const blob = new Blob([pdfContent], {type: "text/plain"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `SafeTriage-Report-${form.name || "customer"}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #2a3a5a',background:'transparent',color:'#e8edf5',fontWeight:600,cursor:'pointer',fontSize:'13px'}}>
                📄 Download Report
              </button>
              <button onClick={() => setDispatchDone(false)}
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #475569',background:'transparent',color:'#6272a4',fontWeight:600,cursor:'pointer',fontSize:'12px'}}>
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-semibold text-slate-800">Frantz Locksmith Service</p>
          <p className="text-xs text-slate-500">
            <a href="tel:+19165344900" className="text-primary hover:underline">(916) 534-4900</a>
            &ensp;|&ensp;
            <a href="mailto:frantzlocksmith@hotmail.com" className="text-primary hover:underline">frantzlocksmith@hotmail.com</a>
          </p>
          <p className="text-xs text-slate-500">CA Locksmith License LCO 4160 &bull; Bonded &amp; Insured &bull; Mobile Service</p>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <a href="https://frantzlocksmithservice.com/Contact.html#Privacy_Policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Privacy &amp; Legal</a>
            <a href="https://frantzlocksmithservice.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Visit Our Website</a>
          </div>
          <p className="mt-2 text-xs font-bold tracking-widest uppercase text-amber-600" style={{ fontFamily: "'Orbitron', 'Audiowide', 'Press Start 2P', monospace", letterSpacing: '0.15em' }}>
            Powered by Frantz Enterprise
          </p>
        </div>
      </div>
    </div>
  );
}

function DispatchModal({ technicians, onSelect, onClose }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="py-16 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-white p-5 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 mb-4">📡 Dispatch Report</h2>
          <p className="text-sm text-slate-600 mb-4">Select which technician should receive this report:</p>
          <div className="space-y-2 mb-5">
            {technicians.map((tech, i) => (
              <button key={i} onClick={() => setSelectedIdx(i)}
                style={{
                  width:'100%', padding:'12px', borderRadius:8,
                  border: selectedIdx === i ? '2px solid #d4a843' : '1px solid #e2e8f0',
                  background: selectedIdx === i ? '#1a3a5c' : '#fff',
                  color: selectedIdx === i ? '#d4a843' : '#1e293b',
                  cursor:'pointer', textAlign:'left', fontSize:14, fontWeight: selectedIdx === i ? 700 : 400
                }}
              >
                <span style={{fontSize:18,marginRight:8}}>👨‍🔧</span>
                <strong>{tech.name || 'Unnamed Tech'}</strong>
                <span style={{display:'block',fontSize:11,color: selectedIdx === i ? '#d4a843' : '#64748b',marginTop:2}}>{tech.phone} {tech.email ? `· ${tech.email}` : ''}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              style={{flex:1,padding:'10px',border:'1px solid #e2e8f0',borderRadius:8,background:'#fff',color:'#64748b',cursor:'pointer',fontWeight:600,fontSize:13}}>Cancel</button>
            <button onClick={() => selectedIdx !== null && onSelect(technicians[selectedIdx])}
              disabled={selectedIdx === null}
              style={{
                flex:1,padding:'10px',border:'none',borderRadius:8,
                background: selectedIdx !== null ? '#d4a843' : '#94a3b8',
                color: selectedIdx !== null ? '#1a3a5c' : '#fff',
                cursor: selectedIdx !== null ? 'pointer' : 'default',
                fontWeight:700,fontSize:13
              }}>Dispatch →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SafeTriageWithBoundary() {
  return (
    <ErrorBoundary>
      <SafeTriageDemo />
    </ErrorBoundary>
  );
}

