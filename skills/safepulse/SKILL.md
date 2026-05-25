---
name: safepulse-v3
description: Safe-service triage, customer intake, risk scoring, service fee calculation, and technician report generation.
version: 0.3.0
author: Robert Frantz
tags:
  - locksmith
  - safe-service
  - triage
  - diagnostics
  - openclaw
---

# SafePulse V3

SafePulse is a safe-service triage skill for legitimate customer intake and technician handoff.

## Capabilities
- Collects safe-service intake information
- Groups symptoms by mechanical, electronic, boltwork, and environment categories
- Scores risk based on triage history
- Provides customer-safe recommendations
- Calculates service/trip fee with 17-mile minimum and $2.50/mile after mile 17
- Builds a technician-ready text report
- Includes battery guidance for Duracell Quantum and Energizer batteries
- Blocks destructive/bypass content

## Safety Boundaries
Do not provide drill points, manipulation guidance, relocker defeat, bypass instructions, forced-entry methods, or unauthorized opening guidance.

## OpenClaw Use
This package can be installed as an OpenClaw skill folder. The React demo is located at `src/SafePulseDemo.jsx`.
