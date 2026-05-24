---
name: safepulse
description: Safe failure prediction for preventive diagnostics. Use when a customer reports a safe getting harder to open, dial drag, handle pressure, intermittent electronic lock, door alignment issues, sticky bolts, battery corrosion, or any safe that hasn't been serviced in years. Triggered by /safepulse slash command or when a safe technician asks for failure prediction, risk assessment, diagnostic guidance, or preventive maintenance recommendations. Does NOT provide bypass, drill points, or defeat instructions.
---

# SafePulse — Safe Failure Prediction Skill

## When to Use
- Customer says the safe is getting harder to open
- Dial feels rough, loose, or inconsistent
- Electronic lock works intermittently
- Handle requires extra force
- Door drags or does not close smoothly
- Safe has not been serviced in years
- Technician wants a pre-service risk assessment

## How to Use

Send `/safepulse` with a JSON input describing the safe and symptoms:

```
/safepulse {"safe_brand":"AMSEC","lock_type":"mechanical_combination","approx_age_years":20,"symptoms":["dial_drag","handle_pressure"],"environment":{"humidity":"medium","garage_or_outbuilding":false,"corrosion_visible":false},"usage_frequency":"daily","last_service_years_ago":10,"customer_report":"It opens but feels harder every month."}
```

Or run the handler directly:
```
./skills/safepulse/safepulse_handler.sh '<JSON>'
```

## Input Fields

| Field | Type | Description |
|---|---|---|
| safe_brand | string | Sentry, AMSEC, Mosler, Gardall, Liberty, Sturdy, Chubb, or Unknown |
| lock_type | string | `mechanical_combination`, `electronic`, `key_lock`, or `redundant` |
| approx_age_years | number | Age of safe in years |
| symptoms | string[] | Symptom codes (see below) |
| environment.humidity | string | `low`, `medium`, or `high` |
| environment.garage_or_outbuilding | boolean | True if in uncontrolled environment |
| environment.corrosion_visible | boolean | True if corrosion visible |
| usage_frequency | string | `daily`, `weekly`, `monthly`, or `rarely` |
| last_service_years_ago | number | Years since last service (null if never) |
| customer_report | string | Free-text from customer |

### Symptoms
- `dial_drag` — dial feels rough or tight
- `dial_loose` — excessive dial play or wobble
- `handle_pressure` — handle requires extra force
- `handle_slipping` — handle slips without engaging
- `intermittent_opening` — opens sometimes, not others
- `no_spin_change` — can't change combination
- `electronic_failure` — keypad dead/intermittent/error codes
- `battery_corrosion` — visible battery terminal corrosion
- `door_drag` — door rubs or won't close smoothly
- `locking_bolts_sticky` — bolts don't retract/extend fully

## Output
1. **Risk Level** — low | moderate | high | critical
2. **Likely Failure Cause** — root cause description
3. **Technician Notes** — diagnostic guidance
4. **Recommended Action** — what to do
5. **Parts/Tools to Bring** — specific items
6. **Customer-Friendly Explanation** — ready to share
7. **Follow-Up Interval** — months until next inspection

## Safety Limits
Never output: drill points, bypass methods, manipulation procedures, defeat instructions, or security-compromising diagrams.

## Files
- `SKILL.md` — This file
- `predict.sh` — Core prediction engine (bash/jq)
- `rules.json` — 8 diagnostic rules
- `safepulse_handler.sh` — Slash command handler
- `webui/` — Web UI (HTML + Node server)
