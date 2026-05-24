#!/usr/bin/env bash
# SafePulse — Safe Failure Prediction
# Reads JSON input from stdin or first argument (file path)
set -o pipefail

RULES_FILE="$(dirname "$0")/rules.json"
ME="$(basename "$0")"

# --- Help ---
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
  cat <<HELP
SafePulse — Safe Failure Prediction Tool

Usage:
  echo '<json>' | ./$ME
  ./$ME input.json

Input format (all fields required unless noted):
  {
    "safe_brand": "Sentry|AMSEC|Mosler|Gardall|Unknown",
    "lock_type": "mechanical_combination|electronic|key_lock|redundant",
    "approx_age_years": 20,
    "symptoms": ["dial_drag","handle_pressure"],
    "environment": {
      "humidity": "low|medium|high",
      "garage_or_outbuilding": false,
      "corrosion_visible": false
    },
    "usage_frequency": "daily|weekly|monthly|rarely",
    "last_service_years_ago": null,
    "customer_report": "It's getting harder to open."
  }

Safety: This tool provides preventive diagnostics only.
No drill points, bypass, manipulation, or defeat instructions.
HELP
  exit 0
fi

# --- Dependencies ---
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install with: apt-get install -y jq"
  exit 1
fi

# --- Read Input ---
INPUT=""
if [[ -n "$1" && -f "$1" ]]; then
  INPUT="$(cat "$1")"
else
  INPUT="$(cat)"
fi

if [[ -z "$INPUT" ]]; then
  echo "ERROR: No input provided. Pipe JSON or pass a file path."
  exit 1
fi

# Validate JSON
if ! echo "$INPUT" | jq empty &>/dev/null; then
  echo "ERROR: Invalid JSON input."
  exit 1
fi

# --- Extract fields ---
BRAND=$(echo "$INPUT" | jq -r '.safe_brand // "Unknown"')
LOCK_TYPE=$(echo "$INPUT" | jq -r '.lock_type // "unknown"')
AGE=$(echo "$INPUT" | jq -r '.approx_age_years // 0')
SYMPTOMS=$(echo "$INPUT" | jq -c '.symptoms // []')
HUMIDITY=$(echo "$INPUT" | jq -r '.environment.humidity // "medium"')
GARAGE=$(echo "$INPUT" | jq -r '.environment.garage_or_outbuilding // false')
CORROSION=$(echo "$INPUT" | jq -r '.environment.corrosion_visible // false')
USAGE=$(echo "$INPUT" | jq -r '.usage_frequency // "monthly"')
LAST_SVC=$(echo "$INPUT" | jq -r '.last_service_years_ago // empty')
CUSTOMER_REPORT=$(echo "$INPUT" | jq -r '.customer_report // ""')

# Derived booleans
LAST_SVC_NEVER="false"
if [[ -z "$LAST_SVC" || "$LAST_SVC" == "null" ]]; then
  LAST_SVC_NEVER="true"
  LAST_SVC=99
fi

# --- Matching ---
SCORES=$(jq -r --argjson symptoms "$SYMPTOMS" \
               --arg lock_type "$LOCK_TYPE" \
               --argjson age "$AGE" \
               --arg humidity "$HUMIDITY" \
               --argjson garage "$GARAGE" \
               --argjson corrosion "$CORROSION" \
               --arg usage "$USAGE" \
               --argjson last_svc "$LAST_SVC" \
               --argjson last_svc_never "$LAST_SVC_NEVER" \
  '
  .risk_rules[] | 
  . as $rule |
  .condition as $c |

  # Symptom match (if rule specifies symptoms, at least one must match)
  (if ($c.symptoms | length > 0) then ([$c.symptoms[] | . as $s | $symptoms | index($s) != null] | length > 0) else true end) as $sym_match |

  # Lock type match
  (if $c.lock_type then $c.lock_type == $lock_type else true end) as $lock_match |

  # Age minimum
  (if $c.age_min then $age >= $c.age_min else true end) as $age_min_match |

  # Age approximate min
  (if $c.approx_age_min then $age >= $c.approx_age_min else true end) as $approx_age_min_match |

  # Humidity
  (if $c.environment.humidity then $c.environment.humidity == $humidity else true end) as $hum_match |

  # Garage/outbuilding
  (if $c.environment.garage_or_outbuilding != null then $c.environment.garage_or_outbuilding == $garage else true end) as $garage_match |

  # Usage frequency
  (if $c.usage_frequency then $c.usage_frequency == $usage else true end) as $usage_match |

  # Last service min years ago
  (if $c.last_service_min then $last_svc >= $c.last_service_min else true end) as $svc_min_match |

  # Last service never
  (if $c.last_service_never then $last_svc_never == true else true end) as $svc_never_match |

  if $sym_match and $lock_match and $age_min_match and $approx_age_min_match and
     $hum_match and $garage_match and $usage_match and
     $svc_min_match and $svc_never_match
  then $rule.id else empty end
' "$RULES_FILE" 2>/dev/null)

# --- No match fallback ---
if [[ -z "$SCORES" ]]; then
  echo "INFO: No specific rule matched. Generating general assessment..."
  cat <<ENDOUTPUT

========================================
SafePulse — Safe Failure Prediction
========================================

--- 1. Risk Level ---
Low (no specific failure pattern detected)

--- 2. Likely Failure Cause ---
No immediate failure cause identified from the provided symptoms.

--- 3. Technician Notes ---
Perform a general preventive inspection. Check lock case lubrication,
bolt throw smoothness, door alignment, and relock device condition.
This is a good baseline to establish for future comparisons.

--- 4. Recommended Action ---
General preventive service: clean and regraphite lock case, lubricate
bolt slides and hinge pins, test all functions, document baseline.

--- 5. Parts / Tools to Bring ---
Standard safe service kit:
  - Lock case tools
  - Graphite powder
  - Dry-film lubricant
  - Multimeter
  - Assorted batteries (if electronic)
  - Flashlight and mirror

--- 6. Customer-Friendly Explanation ---
"I didn't find any specific problems — your safe is in decent shape.
I'll do a routine service to keep it that way and set a baseline."

--- 7. Follow-Up Interval ---
12 months (standard annual service)
ENDOUTPUT
  exit 0
fi

# Get first matching rule id
RULE_ID=$(echo "$SCORES" | head -1)

MATCH=$(jq --arg id "$RULE_ID" '.risk_rules[] | select(.id == $id)' "$RULES_FILE")

if [[ -z "$MATCH" ]]; then
  echo "ERROR: Rule matching failed."
  exit 1
fi

RISK=$(echo "$MATCH" | jq -r '.risk')
CAUSE=$(echo "$MATCH" | jq -r '.likely_cause')
TECH_NOTES=$(echo "$MATCH" | jq -r '.technician_notes')
RECOMMEND=$(echo "$MATCH" | jq -r '.recommended_action')
PARTS=$(echo "$MATCH" | jq -r '.parts_tools')
CUST_EXPLAIN=$(echo "$MATCH" | jq -r '.customer_explanation')
FOLLOWUP=$(echo "$MATCH" | jq -r '.follow_up_months')

# Risk level icon
RISK_ICON="⚠️"
case "$RISK" in
  low) RISK_ICON="✅" ;;
  moderate) RISK_ICON="⚡" ;;
  high) RISK_ICON="🚨" ;;
  critical) RISK_ICON="🔴" ;;
esac

cat <<ENDOUTPUT

========================================
SafePulse — Safe Failure Prediction
========================================
Safe:    $BRAND  |  Age: $AGE yrs  |  Lock: $LOCK_TYPE
Usage:   $USAGE  |  Humidity: $HUMIDITY  |  Garage: $GARAGE
Symptoms: $(echo "$SYMPTOMS" | jq -r 'join(", ")')
Customer: "$CUSTOMER_REPORT"
Last Service: $(if [[ "$LAST_SVC_NEVER" == "true" ]]; then echo "Never"; else echo "$LAST_SVC years ago"; fi)

--- 1. Risk Level ---
$RISK_ICON $RISK

--- 2. Likely Failure Cause ---
$CAUSE

--- 3. Technician Notes ---
$TECH_NOTES

--- 4. Recommended Action ---
$RECOMMEND

--- 5. Parts / Tools to Bring ---
$PARTS

--- 6. Customer-Friendly Explanation ---
$CUST_EXPLAIN

--- 7. Follow-Up Interval ---
$FOLLOWUP months

========================================
ENDOUTPUT
