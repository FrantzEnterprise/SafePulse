export function scoreSafeRisk(input) {
  let score = 0;
  const reasons = [];

  const symptoms = input.symptoms || [];

  // --- CRITICAL symptoms (immediate lockout risk) ---
  if (symptoms.includes("dial_stuck")) {
    score += 35;
    reasons.push("CRITICAL: Dial is stuck and will not move. Forcing can increase costs to open.");
  }
  if (symptoms.includes("dial_lost_combo")) {
    score += 40;
    reasons.push("CRITICAL: Lost/forgotten combination or broken dial lock — technician required.");
  }
  if (symptoms.includes("click_no_release")) {
    score += 35;
    reasons.push("CRITICAL: Solenoid/motor actuates but handle won't release — possible fired re-locker.");
  }
  if (symptoms.includes("handle_spins_no_release")) {
    score += 40;
    reasons.push("CRITICAL: Handle spins but bolts do not release — internal linkage issue.");
  }
  if (symptoms.includes("door_stops_partial")) {
    score += 35;
    reasons.push("CRITICAL: Door only opens partway — likely severed bolt connection. Call technician immediately.");
  }

  // --- HIGH symptoms ---
  if (symptoms.includes("dial_loose_spin")) {
    score += 30;
    reasons.push("Dial loose from wear — suggests drive cam or engagement teeth worn.");
  }
  if (symptoms.includes("elec_lost_combo")) {
    score += 30;
    reasons.push("Lost electronic combination — technician needed; may need drilling depending on lock make.");
  }
  if (symptoms.includes("handle_stuck_no_play")) {
    score += 30;
    reasons.push("Handle stuck with no play — possible clutch engagement or mechanical bind.");
  }
  if (symptoms.includes("handle_resistance")) {
    score += 25;
    reasons.push("Handle resistance — internal mechanical issue, may worsen if forced.");
  }
  if (symptoms.includes("repeating_beep_timeout")) {
    score += 25;
    reasons.push("Lockout beeping — time-out after multiple incorrect attempts.");
  }
  if (symptoms.includes("keys_not_register")) {
    score += 25;
    reasons.push("Keys not registering — likely keypad failure, needs replacement.");
  }

  // --- MODERATE symptoms ---
  if (symptoms.includes("dial_sticky_tight")) {
    score += 20;
    reasons.push("Sticky/tight dial — could be bushing, alignment, or wheel pack issue.");
  }
  if (symptoms.includes("dial_drag")) {
    score += 20;
    reasons.push("Dial drag — lock wear, condition worsens over time.");
  }
  if (symptoms.includes("keypad_no_response")) {
    score += 20;
    reasons.push("Keypad unresponsive — check battery connections, cartridge, and cable.");
  }
  if (symptoms.includes("cannot_lock_safe")) {
    score += 20;
    reasons.push("Cannot lock — obstruction, bad detent, or electronic lock not resetting.");
  }
  if (symptoms.includes("keypad_wet")) {
    score += 15;
    reasons.push("Keypad wet — may have shorted from cleaning. Let dry completely.");
  }
  if (symptoms.includes("bottom_rust")) {
    score += 15;
    reasons.push("Bottom rust from wet floor — security compromised, may need replacement.");
  }

  // --- LOW symptoms ---
  if (symptoms.includes("no_heater_desiccant")) {
    score += 10;
    reasons.push("No moisture protection — install desiccant or electric dryer.");
  }
  if (symptoms.includes("garage_location")) {
    score += 10;
    reasons.push("Garage location — temperature extremes affect lock reliability.");
  }

  // Lock state penalty
  if (input.safeOpen === "No") {
    score += 20;
    reasons.push("Safe is currently locked — lockout risk penalty applied.");
  }

  // Service age penalty
  const age = Number(input.serviceAge) || 0;
  if (age >= 8) {
    score += 15;
    reasons.push(`No service in ${age} years — increased failure risk.`);
  } else if (age >= 5) {
    score += 10;
    reasons.push(`Last service ${age} years ago — overdue for maintenance.`);
  }

  // Score cap
  score = Math.min(score, 100);

  return { score, reasons };
}

export function getRiskLevel(score) {
  if (score >= 75) return { level: "Urgent", advice: "Stop repeated attempts and contact a safe technician immediately." };
  if (score >= 50) return { level: "High", advice: "Schedule service soon. Continued use may increase lockout risk." };
  if (score >= 25) return { level: "Medium", advice: "Try basic non-invasive checks, then monitor symptoms closely." };
  return { level: "Low", advice: "Issue may be simple, but continue monitoring for worsening symptoms." };
}
