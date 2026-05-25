# SafePulse OpenClaw V3

This ZIP contains the OpenClaw-compatible SafePulse V3 skill package.

## Contents
- `SKILL.md` - OpenClaw skill instructions
- `openclaw.json` - OpenClaw skill metadata
- `src/SafePulseDemo.jsx` - React demo app
- `tools/safepulse-agent.js` - simple CLI-style triage helper
- `data/recommendation-database.json` - starting database framework

## Install
Copy this folder into your OpenClaw skills directory.

## Run React Demo
```bash
npm install
npm run dev
```

## Run Skill Tool
```bash
npm run skill
```

## Safety
This skill is for safe-service triage and customer intake only. It does not provide bypass, drilling, manipulation, relocker, or forced-entry instructions.
