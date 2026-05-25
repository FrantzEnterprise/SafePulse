import { scoreSafeRisk } from './risk-score.js';

export function runTriage(input) {
  const risk = scoreSafeRisk(input);

  return {
    riskLevel: risk.level,
    score: risk.score,
    likelyIssues: risk.reasons,
    recommendation:
      risk.level === 'Urgent'
        ? 'Immediate technician intervention recommended.'
        : risk.level === 'High'
        ? 'Schedule technician service soon.'
        : 'Continue safe troubleshooting and monitor symptoms.',
  };
}
