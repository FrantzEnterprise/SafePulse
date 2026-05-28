# SafeTriage Installation & User Guide

**Version:** v0.10.80  
**App URL:** https://frantzenterprise.github.io/SafePulse/  
**Funnel Page:** https://frantzenterprise.github.io/SafePulse/sales-funnel.html  
**Support:** frantzlocksmith@hotmail.com

---

## Table of Contents

1. [What Is SafeTriage?](#1-what-is-safetriage)
2. [Quick Start (5 Minutes)](#2-quick-start-5-minutes)
3. [Installation Guide](#3-installation-guide)
4. [Customer Flow — Step by Step](#4-customer-flow--step-by-step)
5. [Admin Panel Guide](#5-admin-panel-guide)
6. [Feature Tiers Explained](#6-feature-tiers-explained)
7. [EmailJS Setup](#7-emailjs-setup)
8. [Configuring Your Business](#8-configuring-your-business)
9. [Multi-Tech Setup](#9-multi-tech-setup)
10. [Desktop Mode](#10-desktop-mode)
11. [Troubleshooting](#11-troubleshooting)
12. [Beta Program Details](#12-beta-program-details)

---

## 1. What Is SafeTriage?

SafeTriage is a **browser-based tool** for service businesses (safe techs, locksmiths, HVAC, plumbing) that handles:

- ✅ **Symptom triage** — customers describe their issue, get a risk score
- ✅ **Auto dispatch** — SMS fires instantly to the technician
- ✅ **Photo upload** — customers send photos before you arrive
- ✅ **Trip fee calculator** — distance-based pricing
- ✅ **Email reports** — customer confirmation + tech report via EmailJS
- ✅ **Admin panel** — customize everything: branding, ads, features, reviews
- ✅ **Client dashboard** — manage subscribers, packages, feature overrides

**No app store, no installation required.** It runs in any web browser on any device. Open the URL and go.

---

## 2. Quick Start (5 Minutes)

### Step 1: Open the app

Go to **https://frantzenterprise.github.io/SafePulse/**

### Step 2: Log in as Admin

- **Username:** `FrantzEnterprise`
- **Password:** `FE~242SafePulse`

### Step 3: Configure your business

In the Admin Panel:

1. **Branding tab** — set your company name, phone, email, website
2. **Service tab** — set your shop address, base fee, mileage rates
3. **Integrations tab** — paste your EmailJS keys (Public Key, Service ID, Template IDs)

### Step 4: Test a triage

Go back to the main app (click ✕ on Admin). Fill out:
1. Name, phone, email
2. Safe brand, lock type, safe open status
3. Pick symptoms
4. Upload a photo (optional)
5. Review the risk score
6. Click **Send To Tech Now**

### Step 5: Check dispatch

On mobile → SMS compose opens with the tech report pre-filled.  
On desktop → report is copied to your clipboard.  
Email is sent in the background (if EmailJS is configured).

---

## 3. Installation Guide

### 3.1 Nothing to Install (End User)

SafeTriage runs **entirely in the browser**. There is no app to download, no server to configure, no database to set up.

You only need:
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection

### 3.2 For Developers / Self-Hosting

If you want to run your own copy:

**Prerequisites:** Node.js v18+, Git

```bash
# Clone the repo
git clone https://github.com/FrantzEnterprise/SafePulse.git
cd SafePulse

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy dist/ folder to any static host
```

**To deploy to GitHub Pages:**

```bash
npm run build
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -f origin gh-pages
```

Your app is live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 3.3 Using a Custom Domain

1. In your domain's DNS settings, add a CNAME record:
   - **Name:** `app` (or whatever subdomain you want)
   - **Target:** `YOUR_USERNAME.github.io`
2. In your repo Settings → Pages → Custom domain, enter `app.yourdomain.com`
3. Wait up to 30 minutes for DNS propagation

---

## 4. Customer Flow — Step by Step

### Step 0: Splash Screen
- Frantz Locksmith logo appears briefly (2 seconds)
- App loads automatically

### Step 1: Customer Info
Fields:
- **Your Name** (required)
- **Phone Number** (required)
- **Email** (required for email confirmation)
- Continue → Next

### Step 2: Safe Details
- **Safe Brand** — text entry
- **Lock Type** — dropdown: Electronic keypad, Dial combination, Key lock, Biometric
- **Safe Currently Open?** — Yes / No
- **Years Since Last Service** — number
- Continue → Next

### Step 3: Symptoms
- Symptoms are grouped by lock type
- Tap each symptom that applies
- A popup shows: recommendation, causes, remedy, parts needed
- "Return to Symptom Selection" → Continue
- After selection → Next

### Step 4: What You've Tried
- Text area: describe what you already attempted
- Upload photos button (optional)
- Continue → Next

### Step 5: Your Result (Risk Score)
- Large risk meter: score 0–100 with color coding
  - **0–24 (green):** Low risk
  - **25–49 (yellow):** Moderate concern
  - **50–79 (orange):** Serious — schedule service soon
  - **80–100 (red):** ⚠️ Contact a technician immediately
- General recommendation section
- Service notes (free text for the tech)

### Step 6: Dispatch & Done
Two options:

**A) Send To Tech Now** (recommended)
- SMS opens/copies immediately
- Dispatch Complete overlay appears
- Options: Send SMS Again, Download Report, Close

**B) "Did Our Advice Solve The Issue?"** (review prompt)
- Opens review popup with links to Google, Facebook, Yelp, LocalWiki

---

## 5. Admin Panel Guide

**Login:** Tap the gear icon ⚙️ in the top-right corner.

| Tab | What It Controls |
|-----|-----------------|
| **Branding** | Company name, phone, email, website, logo, primary/accent colors |
| **Company** | Company type (Sole Proprietor / Multi-Tech), tech list editor |
| **Service** | Shop address, base miles, base fee, per-mile rate, max radius |
| **Features** | 49 feature toggles organized by tier (Tier 1–4 + Extras) |
| **Social** | Social Post Composer — design platform-optimized posts |
| **Testimonials** | Video Testimonials Gallery — collect customer videos |
| **Triage Log** | Full history of all triage attempts, searchable |
| **🗂️ Clients** | Client Dashboard — manage subscribers, packages, overrides |
| **Q&A** | Custom Q&A prompts for post-triage follow-up |
| **📺 Ads** | Ad slot manager with crop tool (NorCal, Glazer slots) |
| **⭐ Reviews** | Manage review site links (Google, Facebook, Yelp, etc.) |
| **Symptoms** | Symptom Editor — Dracula dark theme, edit symptoms/solutions |
| **Integrations** | EmailJS keys (Public Key, Service ID, Template IDs) |
| **Export** | Export all data as JSON |

### Feature Toggles (Features Tab)

Features are organized by tier. Expand each tier to see its features:

- **Tier 1 (Free)** — 12 features, always on
- **Tier 2 (Growth)** — +13 features, $29/mo
- **Tier 3 (Pro)** — +12 features, $59/mo
- **Tier 4 (All-in-One)** — +12 features, $99/mo
- **Extras** — Social Composer ($10/mo), Video Testimonials ($10/mo)

Toggle any feature on/off per client in the Client Dashboard.

---

## 6. Feature Tiers Explained

### Tier 1 — Free ($0/mo)
- Symptom triage + risk scoring
- Photo upload
- Map & fee calculator
- Battery popup
- SMS dispatch (auto-fire)
- Email dispatch
- Tech report + PDF export
- Service notes
- Triage history (local storage)
- Dark mode
- Instructions modal
- Frantz Enterprise branding in footer

### Tier 2 — Growth ($29/mo)
Everything in Tier 1, plus:
- Cause library (failure causes + needed parts)
- Q&A post-triage follow-up
- Multi-tech dispatch (up to 3 techs)
- Client Dashboard with login credentials
- Package assignment + per-feature overrides
- MRR tracking
- Remove "Powered by Frantz" footer branding

### Tier 3 — Pro ($59/mo)
Everything in Tier 2, plus:
- Up to 10 techs
- Invoicing with line items
- Detailed estimates
- Paid receipts
- Stripe payment integration
- Tax calculator
- Discounts & coupons
- Parts catalog with inventory
- Labor & services catalog
- Tech scheduling & calendar
- Timesheets with GPS
- Vehicle tracking

### Tier 4 — All-in-One ($99/mo)
Everything in Tier 3, plus:
- Unlimited techs
- Analytics dashboard (charts + KPIs)
- Marketing email campaigns
- Lead source tracking
- Customer portal with login
- Customer SMS/email notifications
- Review request automation
- Loyalty rewards program
- User roles (admin, dispatcher, tech, customer)
- Audit log
- Contract templates
- Purchase orders
- Vendor directory
- Commission tracking
- Equipment checklists
- Certification tracking
- Accounting export (QuickBooks, CSV, Xero)
- Full integrations panel
- Demo mode for sales presentations

### Extras (Add to Any Paid Tier)
- **Social Post Composer** — $10/mo
- **Video Testimonials Gallery** — $10/mo

---

## 7. EmailJS Setup

SafeTriage uses EmailJS to send emails from the browser (no backend server needed).

### Free Plan
- **Cost:** $0/mo
- **Limit:** 200 emails/month, 2 templates
- **Sufficient for:** Beta testing with 5 clients

### Setup Steps
1. Go to [emailjs.com](https://www.emailjs.com) and sign up
2. **Create an Email Service** (Gmail, Outlook, or SMTP):
   - Connect to `frantzlocksmith@gmail.com` (or your email)
   - Note the **Service ID** (e.g., `service_abc123`)
3. **Create Template 1 — Tech Report:**
   - Name: `tech_report`
   - Subject: `New SafeTriage Job — {{customer_name}}`
   - Body: include `{{report}}`, `{{risk_score}}`, `{{risk_level}}`, `{{fee}}`, `{{distance}}`, `{{branding}}`
4. **Create Template 2 — Customer Confirmation:**
   - Name: `customer_confirm`
   - Subject: `Your SafeTriage Report — {{customer_name}}`
   - Body: include `{{report}}`, `{{company_name}}`, `{{phone}}`, `{{branding}}`
5. **Get your Public Key** from EmailJS dashboard (Account → API Keys)
6. **Paste all 3 values** in SafeTriage Admin → Integrations:
   - Public Key
   - Service ID
   - Template ID (Tech Report)
   - Template ID (Customer Confirmation)

### Upgrade to Paid
If you need more than 2 templates or 200 emails/month:
- **EmailJS Lite:** $15/mo — unlimited templates, unlimited emails

---

## 8. Configuring Your Business

### Company Info (Admin → Branding)
| Field | Example |
|-------|---------|
| Company Name | Frantz Locksmith Service |
| Phone | (916) 534-4900 |
| Email | frantzlocksmith@hotmail.com |
| Website | https://frantzlocksmithservice.com |
| License | LCO 4160 |

### Service Area (Admin → Service)
| Field | Example |
|-------|---------|
| Shop Address | Your business address |
| Base Miles Included | 10 |
| Base Fee | $65.00 |
| Per Extra Mile Rate | $2.50 |
| Max Radius | 50 miles |

### Colors & Branding (Admin → Branding)
- **Primary:** #1a3a5c (navy)
- **Accent:** #d4a843 (gold)
- Header background, text color, card background all configurable

### Company Type (Admin → Company)
- **Sole Proprietor** — dispatches to your phone
- **Multi-Tech** — dispatches with tech selection list

---

## 9. Multi-Tech Setup

1. Go to Admin → Company
2. Set **Company Type** to "Multi-Tech"
3. In the **Technicians** list, add each tech:
   - Name
   - Phone
   - Email
   - Role
4. When a triage dispatches, the sender selects which tech to send to
5. SMS fires to that specific tech's phone

---

## 10. Desktop Mode

On desktop screens (1024px+), the layout splits:

**Left column:** Triage form (Steps 1–6)  
**Right column:**  
1. Step navigation bar  
2. Action buttons (SMS, Copy, Email, Save)  
3. Triage results (risk meter + recommendation)  
4. Review button  
5. Ad slots (NorCal Safe & Vault, Glazer Safe & Lock)

---

## 11. Troubleshooting

### "The page is blank"
- Make sure you're at the full URL: `https://frantzenterprise.github.io/SafePulse/`
- Add `?v=180` if you see cached old content
- Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### "SMS didn't send"
- On **mobile:** SMS compose opens automatically — you must tap Send
- On **desktop:** the tech report is copied to your clipboard with the phone number
- SMS is triggered **before** any other action — the record is always saved

### "The Admin login isn't working"
- Username: `FrantzEnterprise` (case-sensitive)
- Password: `FE~242SafePulse` (case-sensitive)
- If locked out, clear browser localStorage and reload

### "Email didn't arrive"
- Check Admin → Integrations: are Public Key, Service ID, and Template IDs filled in?
- Check EmailJS dashboard: is your service connected?
- Check spam folder

### "My changes aren't saving"
- All data is stored in your browser's localStorage
- Clearing your browser data will reset everything
- Use **Export** in Admin to download a backup

### "The symptoms don't match my lock type"
- Symptoms are filtered by lock type
- Admin → Symptoms tab lets you edit or add symptoms
- Changes save to localStorage automatically

### "The Client Dashboard shows blank"
- This was a bug in v0.10.78 — fixed in v0.10.79+
- Clear your cache or append `?v=180` to the URL

---

## 12. Beta Program Details

### Current Status
- **Phase:** Internal beta
- **Testers:** 5 (anonymous, referenced by number)
- **Tiers testing:** Tier 1 (Free) → Tier 2 (Growth)
- **Cost during beta:** $0 (GitHub Pages hosting + EmailJS free plan)

### Roadmap
1. ✅ v0.9 — Core triage + dispatch
2. ✅ v0.10 — Admin panel, PWA, sales funnel
3. 🔄 **Now:** Tier 2 features, EmailJS integration
4. ⬜ Beta tester onboarding via Client Dashboard
5. ⬜ Polish Tier 1 & Tier 2 to production quality
6. ⬜ Add remaining Tier 3 features (invoicing, Stripe)
7. ⬜ Add Tier 4 features (analytics, marketing, portal)
8. ⬜ Full public launch

### Subdomain (Future)
- Point `app.frantzlocksmithservice.com` at GitHub Pages
- Update the CNAME file in the repo

### Giving Feedback
Beta testers can report issues or suggestions via:
- **Email:** frantzlocksmith@hotmail.com
- **Direct:** Message Robert Frantz

---

**SafeTriage v0.10.80** — Powered by Frantz Enterprise  
Frantz Locksmith Service | CA License LCO 4160 | (916) 534-4900  
© 2026 Frantz Enterprise
