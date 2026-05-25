# SafeTriage — Safe Failure Prediction App

## Overview
SafeTriage is a diagnostic triage tool for safe technicians. Customers fill out a step-by-step form about their safe issue, and the app generates a risk score, possible causes, remedies, and a full technician report with estimated service fees.

Built for Frantz Locksmith Service.

## Live Demo
https://frantzenterprise.github.io/SafePulse/

## Quick Start
1. Open `index.html` in a browser (or run `npm run dev` for full dev mode)
2. Fill out 5-step form flow
3. View risk assessment and advice
4. Admin panel: add `?admin=true` to URL or tap ⚙ in header

## 5-Step Form Flow
1. Contact Information
2. Safe Details
3. Symptoms & Photos
4. Service Area & Quote — enter miles, calculate fee, map modal
5. Service & Cost Framework — trip fee, labor tiers

## Files Included
- `source/` — All React source files (SafePulseDemo.jsx 952 lines, AdminPanel.jsx 453 lines, SymptomEditor.jsx, style.css, config.json, useConfig.js)
- `dist/` — Pre-built static files (deploy these to any web host)
- `package.json`, `vite.config.js` — Dev tooling
- `README.md` — This file

## Admin Panel
Click ⚙ in header. Tabs: Branding, Company Info, Service Area, Features, Q&A, Symptoms Editor, Integrations, Export.

## Tech Stack
- React 19 + Vite + Tailwind CSS 4
- No server required — fully static

## Version
v0.8.7

## Contact
Frantz Locksmith Service
(916) 534-4900
frantzlocksmith@hotmail.com
West Sacramento, CA 95691
