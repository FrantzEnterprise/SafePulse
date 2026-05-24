# SafePulse — Safe Failure Prediction Skill

## Description
SafePulse helps safe technicians predict likely safe failures before a lockout occurs. It analyzes symptoms, environment, usage, and lock type to produce a risk assessment, likely failure cause, and recommended preventive action.

This skill is for **preventive service, diagnostics, maintenance planning, and customer communication only**. It does not provide bypass, forced-entry, or unauthorized opening instructions.

## Usage

```
/safepulse <JSON input>
```

Or call the script directly:

```
./skills/safepulse/predict.sh < input.json
```

## Required Inputs

| Field | Type | Description |
|---|---|---|
| safe_brand | string | e.g. Sentry, AMSEC, Mosler, Gardall, or Unknown |
| lock_type | string | `mechanical_combination`, `electronic`, `key_lock`, or `redundant` |
| approx_age_years | number | Approximate age of the safe in years |
| symptoms | array of strings | One or more of the valid symptom codes (see below) |
| environment.humidity | string | `low`, `medium`, or `high` |
| environment.garage_or_outbuilding | boolean | True if kept in uncontrolled environment |
| environment.corrosion_visible | boolean | True if corrosion is visible |
| usage_frequency | string | `daily`, `weekly`, `monthly`, or `rarely` |
| last_service_years_ago | number | Years since last professional service (null if never) |
| customer_report | string | Free-text customer description |

### Valid Symptoms

- `dial_drag` — dial feels rough or tight when turning
- `dial_loose` — dial has excessive play or wobble
- `handle_pressure` — handle requires extra force
- `handle_slipping` — handle slips without engaging
- `intermittent_opening` — opens sometimes, not others
- `no_spin_change` — dial won't accept combination change
- `electronic_failure` — keypad dead, intermittent, or error codes
- `battery_corrosion` — visible battery terminal corrosion
- `door_drag` — door rubs or doesn't close smoothly
- `locking_bolts_sticky` — bolts don't retract/extend fully

## Output Fields

1. **Risk Level** — `low`, `moderate`, `high`, or `critical`
2. **Likely Failure Cause** — description of the most probable root cause
3. **Technician Notes** — technical diagnostic guidance
4. **Recommended Action** — what the technician should do
5. **Parts/Tools to Bring** — specific items to bring to the job
6. **Customer-Friendly Explanation** — explanation ready to share with customer
7. **Follow-Up Interval** — recommended months until next inspection

## Safety Limits

This skill **must never** output:
- Drill points or drilling guidance
- Bypass methods or tools
- Manipulation procedures or wheel-gate mapping
- Defeat instructions for any lock type
- Security-compromising diagrams or schematics

If a user asks for any prohibited content, return a single message: *"SafePulse only provides preventive diagnostics. I cannot provide bypass, drill points, or defeat instructions."*

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | This file |
| `predict.sh` | Bash script that reads JSON input and prints the assessment |
| `rules.json` | Rule definitions mapping symptoms/conditions to diagnoses |
