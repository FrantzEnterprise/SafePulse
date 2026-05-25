export function buildReport(data) {
  const symptomsList = (data.symptoms || []).map(s => {
    const labels = {
      dial_drag: 'Dial feels rough or drags',
      dial_loose: 'Dial has excessive play',
      combo_drift: 'Combination stopped working (drift)',
      handle_pressure: 'Handle hard to turn',
      handle_slipping: 'Handle spins freely',
      handle_screw_loose: 'Handle spins freely (loose screw)',
      intermittent_keypad: 'Keypad works sometimes',
      keypad_dead: 'Keypad unresponsive',
      battery_corrosion: 'Battery contact corrosion',
      lockout_mode_active: 'Keypad in lockout mode',
      deactivated_codes: 'Access code no longer works',
      door_drag: 'Door drags or rubs',
      bolt_binding: 'Bolts won\'t retract',
      overstuffed_safe: 'Safe overstuffed',
      broken_linkage: 'Broken internal linkage',
      no_spin_change: 'Dial spins, safe won\'t open',
      key_wont_turn: 'Key won\'t turn in lock',
      key_jamming: 'Key stuck in lock',
      relocker_tripped: 'Relocker activated',
      motor_weak: 'Lock motor weak/slow',
      compromised_wiring: 'Keypad wiring damaged'
    };
    return `  - ${labels[s] || s}`;
  }).join("\n");
  const adviceList = (data.advice || []).map((a, i) => `  ${i+1}. ${a}`).join("\n");

  return `
╔══════════════════════════════════════════╗
║          SAFEPULSE SERVICE REPORT        ║
╚══════════════════════════════════════════╝

Customer:       ${data.customer || ""}
Phone/Text:     ${data.phone || ""}
Safe Brand:     ${data.brand || ""}
Model:          ${data.model || ""}
Lock Type:      ${data.lockType || "mechanical_combination"}
Approx Age:     ${data.age || "unknown"} years
Status:         ${data.openStatus === false ? "Locked Closed" : data.openStatus === true ? "Open" : "Unknown"}

SYMPTOMS
${symptomsList || "None reported"}

CUSTOMER REPORT
${data.customerReport || "N/A"}

WHAT CUSTOMER TRIED
${data.customerTried || "N/A"}

ENVIRONMENT
  Location:          ${data.garageOutbuilding ? "Garage/Outbuilding" : "Indoor"}
  Humidity:          ${data.humidity || "Unknown"}
  Corrosion Visible: ${data.corrosionVisible ? "Yes" : "No"}
  Last Service:      ${data.lastService ? data.lastService + " years ago" : "Never"}

RISK ASSESSMENT
  Risk Level:  ${data.riskLevel || ""}
  Risk Score:  ${data.score || 0}/100
  Likely Issue: ${data.likelyIssue || ""}

RECOMMENDED NEXT STEP
${data.nextStep || ""}

ADVICE PROVIDED
${adviceList || "None"}

PARTS/TOOLS TO BRING
${data.partsTools || "Standard safe service kit"}

FOLLOW-UP: ${data.followUp || ""}

FEEDBACK: ${data.feedback || "Not yet collected"}

--- END SAFEPULSE REPORT ---
`;
}
