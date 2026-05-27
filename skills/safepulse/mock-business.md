# Mock Business Model — SafePulse Demo

**Business Name:** Capital City Safe & Lock
**Tagline:** Sacramento's Trusted Safe & Lock Specialists
**Website:** capitalcitysafe.example (mock)

---

## Why This Exists
When you show the app to a prospect, they need to see it *working with data*. Empty screens don't sell. Capital City Safe & Lock is the **demo business** that runs alongside your real app — prospects see triages, jobs, revenue, reviews — all generated to show what their dashboard will look like in 3 months.

---

## Business Profile

| Field | Value |
|---|---|
| Company | Capital City Safe & Lock |
| Type | Multi-Tech (3 techs) |
| License | CA LCO 1234 |
| Phone | (916) 555-0123 |
| Email | dispatch@capitalcitysafe.example |
| Years in Business | 2 (demo) |
| Monthly Jobs | ~30 (growing) |
| Avg Job Value | $225 |
| Monthly Revenue | ~$6,750 |

---

## Technicians

| Name | Role | Jobs/Month | Rating |
|---|---|---|---|
| Marcus Webb | Senior Tech | 14 | 4.9★ |
| David Tran | Technician | 10 | 4.8★ |
| Elena Ruiz | Apprentice | 6 | 4.7★ |

---

## Generated Demo Data (30 days)

### Triage History (Last 7 Days)
- 8 new triage entries
- 3 converted to paid jobs
- 2 no-shows/cancelled
- 3 pending dispatch

### Common Symptoms (From Data)
1. Electronic keypad no response — 35%
2. Safe won't open with combination — 22%
3. Handle stuck / won't turn — 18%
4. Locking bolts won't retract — 12%
5. Door stops at partial open — 8%
6. Battery-related issues — 5%

### Revenue Breakdown
- Service calls: $4,200
- Emergency after-hours: $1,800
- Parts & hardware: $750
- **Total: $6,750**

### Lead Sources
- Google search: 40%
- Referral: 25%
- Repeat customer: 20%
- Yelp: 10%
- Facebook: 5%

---

## Sales Bot Script (Mental Model)

When a prospect lands on the funnel page and clicks "Chat with Marcus" (the bot), the AI sales bot:

1. **Greeting:** "Hey, I'm Marcus from Capital City Safe & Lock — we use SafePulse to run our whole operation. Got 2 minutes?"

2. **Social Proof:** "Before SafePulse, I was juggling 5 apps. Now one dashboard handles everything. Last month we did 32 jobs with 3 techs — zero missed dispatches."

3. **Demo:** "Here's how it works for us..." (walks through funnel flow)

4. **Close:** "We pay $59/month for Pro. Want me to show you the admin panel?"

---

## Stats Dashboard (Exaggerated for Impact)

Present this as "Capital City Safe & Lock's first 90 days" in the sales funnel:

- **Day 1-30:** 18 jobs, $3,200 revenue
- **Day 31-60:** 27 jobs, $5,100 revenue (+59%)
- **Day 61-90:** 33 jobs, $6,750 revenue (+32%)

**90-day total: 78 jobs | $15,050 revenue**

*"These are real numbers from our beta testing period. Your results will vary, but the system works the same."*

---

## Config File for Demo Mode

Add a `demoMode: true` toggle in config.json so the app switches between your real data and demo data when you pitch.
