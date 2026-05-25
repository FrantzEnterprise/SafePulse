import fs from "fs";

const db = JSON.parse(fs.readFileSync(new URL("../data/recommendation-database.json", import.meta.url)));

export function calculateTripFee(miles) {
  const base = db.serviceArea.baseFee;
  const included = db.serviceArea.includedMiles;
  const rate = db.serviceArea.rateAfterIncludedMiles;
  if (!miles || miles <= included) return base;
  return base + (Math.ceil(miles) - included) * rate;
}

export function scoreSymptoms(symptomIds = []) {
  const symptoms = db.symptoms.filter((s) => symptomIds.includes(s.id));
  const score = Math.min(symptoms.reduce((sum, s) => sum + s.points, 0), 100);
  const level = score >= 75 ? "Urgent" : score >= 50 ? "High" : score >= 25 ? "Medium" : "Low";
  return { score, level, symptoms };
}

if (process.argv[1]?.endsWith("safepulse-agent.js")) {
  console.log("SafePulse OpenClaw V3 skill loaded.");
  console.log("Example trip fee for 24 miles:", calculateTripFee(24));
}
