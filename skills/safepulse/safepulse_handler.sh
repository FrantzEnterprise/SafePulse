#!/usr/bin/env bash
# SafePulse handler for /safepulse slash commands
# Takes a JSON string argument and returns the formatted prediction

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PREDICT="$SCRIPT_DIR/predict.sh"

if [[ $# -lt 1 ]]; then
  echo "Usage: /safepulse <JSON input>"
  echo ""
  echo "Example: /safepulse {\"safe_brand\":\"AMSEC\",\"lock_type\":\"mechanical_combination\",\"approx_age_years\":20,\"symptoms\":[\"dial_drag\"],\"environment\":{\"humidity\":\"medium\",\"garage_or_outbuilding\":false,\"corrosion_visible\":false},\"usage_frequency\":\"daily\",\"last_service_years_ago\":10,\"customer_report\":\"Getting harder to open.\"}"
  exit 1
fi

INPUT="$1"

# Validate JSON
if ! echo "$INPUT" | jq empty 2>/dev/null; then
  echo "❌ Invalid JSON. Please provide valid JSON matching the SafePulse input format."
  echo ""
  echo "Format:"
  echo '  { "safe_brand": "...", "lock_type": "...", "approx_age_years": N, "symptoms": ["..."], "environment": { "humidity": "...", "garage_or_outbuilding": bool, "corrosion_visible": bool }, "usage_frequency": "...", "last_service_years_ago": N, "customer_report": "..." }'
  exit 1
fi

echo "$INPUT" | bash "$PREDICT"
