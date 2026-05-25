export function scoreSafeRisk(input) {
  let score = 0;
  const reasons = [];

  const symptoms = input.symptoms || [];

  // --- CRITICAL symptoms (immediate lockout risk) ---
  if (symptoms.includes("handle_slipping")) {
    score += 50;
    reasons.push("CRITICAL: Handle spinning freely indicates stripped spindle or disengaged clutch. Safe is inoperable.");
  }

  if (symptoms.includes("broken_linkage")) {
    score += 50;
    reasons.push("CRITICAL: Handle turns but bolts don't move — broken internal linkage.");
  }

  if (symptoms.includes("keypad_dead") || (symptoms.includes("battery_corrosion") && symptoms.includes("intermittent_keypad"))) {
    score += 50;
    reasons.push("CRITICAL: Dead keypad combined with corrosion indicates PCB damage. Lock may need replacement.");
  }

  if (symptoms.includes("relocker_tripped")) {
    score += 60;
    reasons.push("CRITICAL: Relock device has activated. Technician intervention required to avoid permanent lockout.");
  }

  // --- HIGH symptoms ---
  if (symptoms.includes("bolt_binding") || (symptoms.includes("handle_pressure") && symptoms.includes("locking_bolts_sticky"))) {
    score += 30;
    reasons.push("Bolt binding indicates rust, debris, or alignment issues in the bolt mechanism.");
  }

  if (symptoms.includes("combo_drift")) {
    score += 30;
    reasons.push("Combination drift indicates dial wear — numbers no longer align correctly.");
  }

  if (symptoms.includes("compromised_wiring")) {
    score += 25;
    reasons.push("Compromised keypad wiring may cause intermittent or complete electronic lock failure.");
  }

  if (symptoms.includes("handle_pressure") && symptoms.includes("dial_drag")) {
    score += 20;
    reasons.push("Combined handle pressure and dial drag suggest internal lock case wear or seizure risk.");
  }

  // --- MODERATE symptoms ---
  if (symptoms.includes("intermittent_keypad")) {
    score += 20;
    reasons.push("Intermittent keypad behavior may indicate battery, keypad cable, or lock solenoid failure.");
  }

  if (symptoms.includes("dial_drag")) {
    score += 15;
    reasons.push("Dial drag may indicate mechanical wear, dried lubrication, or contamination in lock case.");
  }

  if (symptoms.includes("door_drag")) {
    score += 15;
    reasons.push("Door drag suggests hinge wear, settling, or misalignment of the safe door.");
  }

  if (symptoms.includes("no_spin_change")) {
    score += 15;
    reasons.push("Cannot change combination may indicate drive cam or wheel pack issue requiring service.");
  }

  if (symptoms.includes("handle_screw_loose")) {
    score += 10;
    reasons.push("Handle setscrew loose — handle spins freely even before code entry. Easy fix.");
  }

  if (symptoms.includes("lockout_mode_active")) {
    score += 10;
    reasons.push("Lockout mode activated from multiple incorrect code entries. Wait for timeout.");
  }

  // --- LOW symptoms ---
  if (symptoms.includes("dial_loose")) {
    score += 5;
    reasons.push("Loose dial usually indicates set-screw or retaining ring needing tightening.");
  }

  if (symptoms.includes("key_jamming")) {
    score += 5;
    reasons.push("Key jamming may indicate worn key or lock cylinder needing cleaning.");
  }

  if (symptoms.includes("key_wont_turn")) {
    score += 5;
    reasons.push("Key won't turn — may be worn key, need lubrication, or lock cylinder issue.");
  }

  if (symptoms.includes("motor_weak")) {
    score += 10;
    reasons.push("Weak motor sounds on electronic locks may indicate dying motor or low voltage.");
  }

  if (symptoms.includes("overstuffed_safe")) {
    score += 5;
    reasons.push("Safe may be overstuffed — items blocking bolt retraction. Remove items and retry.");
  }

  if (symptoms.includes("deactivated_codes")) {
    score += 5;
    reasons.push("Previously working code no longer works — may need reprogramming or backup code.");
  }

  // --- Environment factors ---
  if (input.environment?.humidity === "high") {
    score += 10;
    reasons.push("High humidity accelerates corrosion on electronics and bolt slides.");
  }

  if (input.environment?.garage_or_outbuilding) {
    score += 5;
    reasons.push("Garage/outbuilding environment adds temperature swing and moisture risk.");
  }

  if (input.environment?.corrosion_visible) {
    score += 15;
    reasons.push("Visible corrosion indicates advanced environmental damage — address promptly.");
  }

  // --- Service history ---
  if (input.last_service_years_ago !== null && input.last_service_years_ago !== undefined) {
    if (input.last_service_years_ago >= 10) {
      score += 15;
      reasons.push(`Safe has not been serviced in ${input.last_service_years_ago} years — overdue.`);
    } else if (input.last_service_years_ago >= 5) {
      score += 10;
      reasons.push(`Safe has not been serviced in ${input.last_service_years_ago}+ years.`);
    }
  }

  if (input.last_service_never) {
    score += 10;
    reasons.push("Safe has no service history — baseline inspection recommended.");
  }

  // --- Status ---
  if (input.safe_currently_open === false) {
    score += 20;
    reasons.push("Safe is locked closed, increasing lockout urgency.");
  }

  if (input.age && input.age >= 20) {
    score += 5;
    reasons.push("Safe is 20+ years old — age-related wear more likely.");
  }

  // --- Scoring thresholds ---
  let level = "Low";

  if (score >= 75) level = "Urgent";
  else if (score >= 45) level = "High";
  else if (score >= 20) level = "Medium";

  return {
    score,
    level,
    reasons
  };
}
