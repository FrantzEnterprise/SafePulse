# SafeTriage — Complete Setup & Configuration Guide

**App:** https://frantzenterprise.github.io/SafePulse/  
**Sales Funnel:** https://frantzenterprise.github.io/SafePulse/sales-funnel.html  
**Version:** v0.10.100  
**Support:** frantzlocksmith@hotmail.com

---

## Table of Contents

1. [Before You Start — What You'll Need](#1-before-you-start--what-youll-need)
2. [Tier 1 — Free Setup (Pages 1–5)](#2-tier-1--free-setup)
3. [Tier 2 — Growth Setup (Pages 6–9)](#3-tier-2--growth-setup)
4. [Tier 3 — Pro Setup (Pages 10–13)](#4-tier-3--pro-setup)
5. [Tier 4 — All-in-One Setup (Pages 14–17)](#5-tier-4--all-in-one-setup)
6. [Extras Setup (Pages 18–19)](#6-extras-setup)
7. [Advanced: Self-Hosting & Custom Domain](#7-advanced-self-hosting--custom-domain)
8. [Troubleshooting by Tier](#8-troubleshooting-by-tier)
9. [Appendix: Complete Feature List by Tier](#9-appendix-complete-feature-list-by-tier)

---

## 1. Before You Start — What You'll Need

### For Every Tier
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection (no app to download)
- Your business info: company name, phone, email, website, license number
- Your brand colors: hex codes for primary and accent colors

### Only for Paid Tiers
- **Tier 2+:** EmailJS account (free at emailjs.com)
- **Tier 3+:** Stripe account (stripe.com)
- **Tier 4:** SMTP or email sending service for campaigns

### Setup Time Estimate
- **Tier 1 (Free):** 10 minutes first time, 2 minutes per client
- **Tier 2 (Growth):** +15 minutes, 5 minutes per client
- **Tier 3 (Pro):** +30 minutes, 10 minutes per client
- **Tier 4 (All-in-One):** +20 minutes, 5 minutes per client

---

## 2. Tier 1 — Free Setup

### Page 1: First Launch & Login

**Goal:** Open the app and log into the Admin panel.

1. Open your browser and go to:
   ```
   https://frantzenterprise.github.io/SafePulse/
   ```

2. Splash screen loads (Frantz logo + animation, ~2 seconds), then the app appears on Step 1.

3. Tap the **gear icon (⚙️)** in the top-right corner to open the Login screen.

4. Enter credentials:
   - **Username:** `FrantzEnterprise`
   - **Password:** `FE~242SafePulse`

5. Tap **Login** → Admin panel opens with these tabs:
   ```
   Branding | Company | Service | Features | Social | Testimonials
   Triage Log | 🗂️ Clients | Q&A | 📺 Ads | ⭐ Reviews | Symptoms
   Integrations | Export
   ```

**Check:** Admin panel opens without errors. If blank, clear site data and reload.

---

### Page 2: Branding Configuration

**Goal:** Display your business name, colors, and contact info.

1. In Admin, tap the **Branding** tab.
2. Fill in your information:

| Field | Your Info | Example |
|-------|-----------|---------|
| **Company Name** | Your business legal name | Frantz Locksmith Service |
| **Phone** | Business phone | (916) 534-4900 |
| **Email** | Business email | frantzlocksmith@hotmail.com |
| **Website** | Full URL | https://frantzlocksmithservice.com |
| **License** | State license number | LCO 4160 |
| **Tagline** | Short description | Sacramento's Safe Specialist |

3. **Colors:**

| Color Field | What It Does | Default |
|-------------|-------------|---------|
| **Primary Color** | Main brand color, buttons, headers | #1a3a5c (navy) |
| **Primary Hover** | Darker shade for hover | #152d4a |
| **Accent Color** | Highlights, gold accents | #d4a843 (gold) |
| **Accent Hover** | Darker gold for hover | #c99a3a |
| **Background Color** | Page background | #f8f9fa |
| **Header Background** | Top navigation bg | #1a3a5c |
| **Header Text** | Text in header | #ffffff |
| **Body Text Color** | Main text | #4a4f55 |
| **Card Background** | Card bg | #ffffff |
| **Card Border** | Card border | #e0e3e8 |
| **Font Family** | App font | 'Inter', sans-serif |
| **Border Radius Sm** | Button rounding | 8px |
| **Border Radius Lg** | Card rounding | 12px |

4. Tap **Save** at the bottom.

**Check:** Header shows your company name. Colors match your brand. Footer phone/email links correct. Changes survive page refresh.

---

### Page 3: Service Area Setup

**Goal:** Set your pricing structure.

1. In Admin, tap the **Service** tab.
2. Fill in:

| Field | Description | Recommended |
|-------|-------------|-------------|
| **Shop Address** | Your location (optional, mobile service = blank) | (leave blank) |
| **Base Miles Included** | Free miles before extra fee | 17 |
| **Base Fee ($)** | Minimum trip/service charge | 75.00 |
| **Per Extra Mile Rate ($)** | Charge per mile beyond included | 2.50 |
| **Max Radius (miles)** | How far you'll travel | 50 |

3. Tap **Save**.

**Check:** Run a test triage. Step 5 shows correct $75 base fee and $2.50/mile rate after 17 miles.

---

### Page 4: Review Links Setup

**Goal:** Configure review platform links for the "Did Our Advice Solve The Issue?" popup.

1. In Admin, tap the ⭐ **Reviews** tab.
2. Default links:

| Platform | URL | Active |
|----------|-----|--------|
| **Google Maps** | https://g.page/r/CVd7PAy6aV1SEBA | ✅ |
| **Facebook** | https://www.facebook.com/frantzlocksmith | ✅ |
| **Yelp** | https://www.yelp.com/biz/frantz-locksmith-service-sacramento | ✅ |
| **Nextdoor** | https://nextdoor.com/pages/frantz-locksmith-service | ✅ |

3. To edit: tap the link text, update URL, toggle Active on/off.
4. To add: enter Label, Icon emoji, URL, toggle Active, tap **Add**.
5. Changes save automatically.

**Check:** At Step 6, tap "Did Our Advice Solve The Issue?" → all active review links appear. Each opens in a new tab.

---

### Page 5: Ad Slots Setup (Optional)

**Goal:** Place business card ads for partner businesses.

1. In Admin, tap the 📺 **Ads** tab.
2. Two slots are pre-configured:
   - **Slot 1 (top):** Glazer Safe & Lock
   - **Slot 2 (bottom):** NorCal Safe & Vault
3. Each slot needs:
   - **Label** — Business name
   - **Image** — Upload business card image
   - **Link URL** — Click-through link (optional)
   - **Active** — Toggle on/off
4. To upload: tap **Upload Image**, select file, use **📐 Crop** if needed, tap Save.
5. The images are hard-coded into the app — they won't disappear on refresh.

**Check:** After a triage, scroll past results. You should see:
```
⚡ Paid Advertisements ⚡
From Our Vetted & Trusted Business Partners

[Glazer Safe & Lock business card]
[NorCal Safe & Vault business card]

Have a related Business and/or Product? Call (916) 534-4900 to place your ad here.
```

---

## 3. Tier 2 — Growth Setup

### Page 6: EmailJS Integration

**Goal:** Enable automatic emails — customer confirmation + tech report dispatch.

**Prerequisite:** EmailJS account (free at emailjs.com).

**Part A — Create Email Account:**
1. Go to [emailjs.com](https://www.emailjs.com), click **Sign Up Free**
2. Register with `frantzlocksmith@gmail.com`
3. Verify your email

**Part B — Create Email Service:**
1. EmailJS Dashboard → **Email Services** → **Add New Service**
2. Select **Gmail**, connect `frantzlocksmith@gmail.com`
3. Note the **Service ID** (e.g., `service_xxxxxxxxxxx`)

**Part C — Template 1 (Tech Report):**
1. **Email Templates** → **Create New Template**
2. Name: `tech_report`, Template ID: `tech_report`
3. Subject: `New SafeTriage Job — {{customer_name}}`
4. Content (HTML):
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="color: #1a3a5c;">🧰 New SafeTriage Job Dispatch</h2>
  <hr>
  <h3>Customer Details</h3>
  <p><strong>Name:</strong> {{customer_name}}</p>
  <p><strong>Phone:</strong> {{customer_phone}}</p>
  <p><strong>Company:</strong> {{company_name}}</p>
  <h3>Assessment</h3>
  <p><strong>Risk Score:</strong> {{risk_score}}/100 — {{risk_level}}</p>
  <p><strong>Fee:</strong> ${{fee}}</p>
  <p><strong>Distance:</strong> {{distance}} miles</p>
  <h3>Full Report</h3>
  <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">{{report}}</pre>
  <hr>
  <p style="color: #666; font-size: 12px;">{{branding}}</p>
</body>
</html>
```
5. Click **Save**

**Part D — Template 2 (Customer Confirmation):**
1. **Create New Template**
2. Name: `customer_confirm`, Template ID: `customer_confirm`
3. Subject: `Your SafeTriage Report — {{customer_name}}`
4. Content (HTML):
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="color: #1a3a5c;">🔐 SafeTriage — Your Report Is Ready</h2>
  <p>Hi {{customer_name}},</p>
  <p>Thank you for using {{company_name}}'s SafeTriage tool.</p>
  <p>We have received your safe service request and will contact you as soon as possible.</p>
  <hr>
  <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">{{report}}</pre>
  <hr>
  <p>If you have additional details, please call {{phone}}.</p>
  <p style="color: #666; font-size: 12px;">{{branding}}</p>
</body>
</html>
```
5. Click **Save**

**Part E — Get Public Key:**
1. EmailJS → **Account** → **API Keys**
2. Copy the **Public Key** (looks like `xxxxxxxxxxx_xxxxxxxxxxx`)

**Part F — Configure SafeTriage:**
1. SafeTriage Admin → **Integrations** tab
2. Paste:
   - **Public Key:** [from EmailJS]
   - **Service ID:** service_xxxxxxxxxxx
   - **Template ID (Tech):** tech_report
   - **Template ID (Customer):** customer_confirm
3. Tap **Save**

**Part G — Test:**
1. Run a triage with your real email in Step 1
2. Tap **Send To Tech Now** at Step 6
3. SMS fires immediately (as always)
4. Within 5-10 seconds:
   - Your email inbox gets the **Tech Report**
   - Customer's inbox gets the **Confirmation**

**Check:** Both emails arrive with full report data. Subject lines match. Check spam if missing.

---

### Page 7: Multi-Tech Dispatch

**Goal:** Route dispatches to specific technicians.

1. Admin → **Company** tab
2. Set **Company Type** to **Multi-Tech**
3. Add each technician:

| Field | Example |
|-------|---------|
| **Name** | John Smith |
| **Phone** | (916) 555-1234 |
| **Email** | john@example.com |
| **Role** | Senior Technician |

4. Tap **Add Technician** for each (up to 3 on Tier 2)
5. To remove: tap **Remove** next to their name
6. Tap **Save**

**How it works:** When customer taps "Send To Tech Now," a tech selection popup appears. SMS fires to selected tech's phone. Email goes to selected tech's email.

---

### Page 8: Client Dashboard Setup

**Goal:** Manage subscribers — assign packages, override features, track MRR.

1. Admin → 🗂️ **Clients** tab
2. Tap **Add Client**, fill in:

| Field | Description |
|-------|-------------|
| **Client Name** | Business or individual name |
| **Email** | Their login email |
| **Phone** | Contact number |
| **Package** | Tier: Free / Growth / Pro / All-in-One |
| **Status** | Active / Trial / Past Due / Cancelled |
| **MRR** | Monthly recurring revenue amount |

3. **Per-feature overrides:** After creating a client, toggle individual features on/off for that specific client (overrides their tier defaults).
4. **Status pipeline:** Lead → Trial → Active → Past Due → Cancelled. MRR auto-calculates from all active clients.
5. Tap any client row to edit.

**Check:** Client appears in list. MRR total updates. Per-feature overrides work for that client only.

---

### Page 9: Feature Toggles for Tier 2

1. Admin → **Features** tab
2. Expand **Tier 2 (Growth)** — 13 features
3. Toggle ON:

| Feature | What It Does |
|---------|-------------|
| **Cause Library** | Shows failure causes + needed parts in triage results |
| **Q&A Post-Triage** | Follow-up questions after triage |
| **Multi-Tech Dispatch** | Tech selection on dispatch (up to 3 techs) |
| **Client Dashboard** | Enables the 🗂️ Clients tab |
| **Remove Frantz Footers** | Hides "Powered by Frantz Enterprise" branding |

4. Tap **Save**

---

## 4. Tier 3 — Pro Setup

### Page 10: Invoicing & Estimates

**Goal:** Send professional invoices and estimates.

**Prerequisite:** Tier 3 feature toggles enabled.

1. Admin → Features → Expand **Tier 3 (Pro)** → Enable:
   - `Invoicing with Line Items`
   - `Detailed Estimates`
   - `Paid Receipts`
   - `Tax Calculator`

2. **Invoicing** section appears in Admin and at Step 5/6:
   - **New Invoice:** Enter customer, line items (description, qty, rate)
   - **Tax:** Auto-calculated based on service location
   - **Send Email:** Via EmailJS
   - **Mark Paid:** Generates numbered receipt

3. **Estimates:** Create from triage data, add parts/labor, send link to customer.

4. **Receipts:** After payment — includes payment method, date, amount.

**Check:** Invoice totals correct. Tax % configurable. Receipt shows "paid."

---

### Page 11: Parts & Labor Catalogs

**Goal:** Pre-define parts and services for quick invoicing.

1. Enable in Features (Tier 3):
   - `Parts Catalog with Inventory`
   - `Labor & Services Catalog`

2. New **Parts** tab in Admin:
   - **Add Part:** Name, SKU, price, qty on hand, supplier
   - **Search/Filter:** Find by name or SKU
   - **Low Stock Alert:** Shows when inventory is low

3. New **Services** tab in Admin:
   - **Add Service:** Name, description, base price, est. hours
   - **Categories:** By safe type, lock type, job type

4. Invoice/estimate line items pull from these catalogs.

**Check:** Parts appear in invoice dropdown. Service prices auto-fill. Inventory updates on job completion.

---

### Page 12: Tech Scheduling & Calendar

**Goal:** Assign jobs and manage schedules.

1. Enable in Features (Tier 3):
   - `Tech Scheduling & Calendar`
   - `Timesheets with GPS`
   - `Vehicle Tracking`

2. **Schedule** tab in Admin:
   - Calendar view: day/week/month
   - **Create Job:** Select customer, tech, date/time
   - Drag & drop between techs
   - Color-coded by status (new, in-progress, completed)

3. **Timesheets:** Techs clock in/out from mobile. GPS captures location. Hours sync to payroll.

4. **Vehicle Tracking:** Assign vehicle to job, track mileage, fuel/trip log.

**Check:** Jobs appear on correct date. Timesheet hours calculate correctly. GPS captured with clock events.

---

### Page 13: Stripe Payment Integration

**Goal:** Accept credit card payments.

**Prerequisite:** Stripe account (stripe.com).

1. Stripe Dashboard → Developers → API Keys
2. Copy **Publishable Key** (starts with `pk_live_...`)

3. SafeTriage Admin → Integrations:
   - Paste **Stripe Publishable Key**
   - Tap **Save**

4. Enable in Features (Tier 3):
   - `Stripe Payment Integration`

5. **Test:**
   - Create a $1.00 invoice
   - Tap **Pay with Card**
   - Test card: `4242 4242 4242 4242`, any expiry/CVC
   - Should show "Payment Successful"

**Check:** Test payment processes. Payment appears in Stripe dashboard. Receipt generates.

---

## 5. Tier 4 — All-in-One Setup

### Page 14: Analytics Dashboard

**Goal:** View business performance metrics.

1. Enable in Features (Tier 4): `Analytics Dashboard`
2. New **Analytics** tab in Admin with:
   - **Jobs Over Time:** Line chart of daily/weekly volume
   - **Revenue Chart:** Monthly revenue trend
   - **Risk Score Distribution:** Pie chart of urgency levels
   - **Top Symptoms:** Bar chart of common issues
   - **Tech Performance:** Jobs per tech, avg response time
3. Date range filter: 7d, 30d, 90d, custom
4. Export: CSV or PDF

**Check:** Charts render with real triage data. Revenue matches invoices. Tech stats drill down.

---

### Page 15: Marketing Campaigns

**Goal:** Send email campaigns to your customer list.

**Prerequisite:** SMTP or email sending service for volume.

1. Enable in Features (Tier 4):
   - `Marketing Email Campaigns`
   - `Lead Source Tracking`

2. **Marketing** tab in Admin:
   - **Create Campaign:** Subject, body, target list (by tier/status/location)
   - **Schedule:** Send now or future date/time
   - **Templates:** Save common campaigns
   - **Analytics:** Open rates, click rates, unsubscribe count

3. **Lead Sources:** Tag clients by source (Google, Yelp, Referral). See MRR per source.

4. **Customer Notifications:** Auto-SMS reminders for upcoming jobs. Follow-up emails. Birthday offers.

**Check:** Test campaign sends to active clients. Open rates tracked. Lead source report accurate.

---

### Page 16: Customer Portal

**Goal:** Customers log in to see history, invoices, schedule.

1. Enable in Features (Tier 4):
   - `Customer Portal with Login`
   - `Customer SMS/Email Notifications`
   - `Review Request Automation`
   - `Loyalty Rewards Program`

2. Portal URL: `https://frantzenterprise.github.io/SafePulse/?portal=customer`

3. **Customer login:** Email + password (set in Client Dashboard).

4. **What customers see:**
   - Dashboard: recent jobs with status
   - Invoices: view and pay open invoices
   - Schedule: upcoming appointments
   - History: past triage reports
   - Rewards: loyalty points balance
   - Reviews: leave or pending reminders

5. **Review Automation:** After completed job, auto-send text/email asking for review. Configurable delay (e.g., 24 hours).

6. **Loyalty Program:** Points per job (100 pts per $100). Rewards catalog. Customer sees tier status.

**Check:** Customer logs in with their credentials, sees only their jobs. Review auto-sends after completion. Points accrue.

---

### Page 17: User Roles & Permissions

**Goal:** Control access for different team members.

1. Enable in Features (Tier 4):
   - `User Roles (Admin, Dispatcher, Tech, Customer)`
   - `Audit Log`
   - `Commission Tracking`

2. **Users** tab in Admin:

| Role | Access |
|------|--------|
| **Admin** | Full access — everything |
| **Dispatcher** | View/create jobs, dispatch techs, no financials |
| **Technician** | Own assigned jobs, clock in/out, notes |
| **Customer** | Portal only |

3. **Add a user:** Name, email, role. Credentials generated automatically.

4. **Audit Log:** Every action logged (who, what, when). Searchable by user/date/action. Export CSV.

5. **Commission Tracking:** Set rate per tech (% or flat fee). Auto-calculated from job revenue. Monthly report.

**Check:** Dispatcher can't edit financials. Tech sees only own jobs. Audit log captures all changes.

---

## 6. Extras Setup

### Page 18: Social Post Composer

**Cost:** $10/mo (add to any paid tier)

**Goal:** Design social media posts optimized for each platform.

1. Admin → Features → Expand **Extras** → Toggle **Social Post Composer** ON
2. Admin → **Social** tab
3. **Create a post:**
   - **Platform:** Facebook, Instagram, LinkedIn, Twitter, TikTok
   - **Image:** Upload or take photo
   - **Crop Tool:** Platform-specific ratios:
     - Facebook Feed: 1.91:1 (1200×628px)
     - Instagram Post: 1:1 (1080×1080px)
     - Instagram Story: 9:16 (1080×1920px)
     - LinkedIn: 1.91:1 (1200×627px)
     - Twitter: 16:9 (1200×675px)
     - TikTok: 9:16 (1080×1920px)
   - **Captions:** Write per platform
   - **Preview:** Real-time preview
4. **Crop features:** Drag handles, preset ratios, reset to original, clear history, auto-resize to exact pixel dimensions.
5. Save draft locally. Publish = copy/paste to the actual platform.

**Check:** Each ratio preset correct. Crop handles touch-friendly (22px) on mobile. Output at exact platform size.

---

### Page 19: Video Testimonials Gallery

**Cost:** $10/mo (add to any paid tier)

**Goal:** Collect and display customer video testimonials.

1. Admin → Features → Expand **Extras** → Toggle **Video Testimonials** ON
2. Admin → **Testimonials** tab
3. **Add a testimonial:**
   - **Customer Name**
   - **Video URL** (YouTube or Vimeo)
   - **Thumbnail** image
   - **Description** / quote
   - **Rating** (1-5 stars)
   - **Date**
4. **Gallery:** Grid layout with thumbnail cards. Tap to play (new tab or inline). Sort by date/rating/random. Filter by rating.

**Check:** Thumbnail shows. Tapping opens video. Sort/filter works.

---

## 7. Advanced: Self-Hosting & Custom Domain

### Self-Hosting (GitHub Pages)

**Prerequisites:** Node.js v18+, Git, GitHub account.

```bash
# 1. Clone
git clone https://github.com/FrantzEnterprise/SafePulse.git
cd SafePulse

# 2. Install
npm install

# 3. Customize (optional)
#    Edit src/config.json for default config
#    Edit src/SafePulseDemo.jsx for custom features

# 4. Build
npm run build

# 5. Deploy
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -f origin gh-pages

# App live at: https://YOUR_USERNAME.github.io/YOUR_REPO/
```

### Custom Domain

1. DNS: Add CNAME record
   ```
   Type: CNAME
   Name: app
   Target: YOUR_USERNAME.github.io
   ```
2. GitHub repo → Settings → Pages → Custom domain: `app.yourdomain.com`
3. Wait up to 30 minutes for DNS propagation.

### Local Development
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 8. Troubleshooting by Tier

### Tier 1 (Free)

| Problem | Solution |
|---------|----------|
| **Blank page** | Hard refresh (Ctrl+Shift+R) or append `?v=201` to URL |
| **Splash then blank** | Clear browser site data → reload. Check ErrorBoundary red text. |
| **Branding wrong** | Admin → Branding → re-save. If persists, clear localStorage and re-enter. |
| **Fee shows $65 not $75** | Config fixed — clear site data and reload. |
| **Ad images missing** | Hard reload. Check Admin → Ads → are they Active? Images are hard-coded, won't vanish. |
| **Step indicator gone** | Fixed in v0.10.98+ — update to latest. |
| **Can't find symptom selector** | Back button now scrolls to top — update to latest. |
| **SMS not firing** | On mobile: SMS compose opens automatically, user must tap Send. On desktop: copies to clipboard. Record always saved first. |

### Tier 2 (Growth)

| Problem | Solution |
|---------|----------|
| **Emails not sending** | Check 3 things: Public Key, Service ID, Template IDs — all must match EmailJS exactly. |
| **Customer no confirmation** | Did they enter email in Step 1? Check spam folder. |
| **Multi-tech popup not showing** | Set Company Type to "Multi-Tech" AND add at least 1 technician. |
| **Client Dashboard blank** | Was a bug in v0.10.78 — fixed in v0.10.79+, update to latest. |
| **Frantz footer still showing** | Feature toggle "Remove Frantz Footers" must be ON and client must have Tier 2+ package assigned. |

### Tier 3 (Pro)

| Problem | Solution |
|---------|----------|
| **Stripe payment fails** | Check publishable key format. Test with `4242...` card first. Ensure Stripe account is active. |
| **Invoice totals wrong** | Check tax % setting. Verify line item quantities. |
| **Parts not in dropdown** | Parts tab → add at least one part. Refresh invoicing page. |

### Tier 4 (All-in-One)

| Problem | Solution |
|---------|----------|
| **Analytics charts empty** | Need at least one completed triage to show data. Check date range filter. |
| **Customer can't log in** | Portal account must be created in Client Dashboard first. Check email/password. |
| **Audit log empty** | Only actions from Tier 4 enabled accounts are logged. Check User Roles are assigned. |

### General Issues

| Problem | Solution |
|---------|----------|
| **Login not working** | Username: `FrantzEnterprise` (case-sensitive). Password: `FE~242SafePulse`. Clear site data if locked out. |
| **Changes not saving** | Data stored in browser localStorage. Clearing browser data wipes it. Use **Export** tab to download backup. |
| **Symptoms wrong for lock type** | Symptoms are filtered by lock type. Edit in Admin → Symptoms tab (Dracula dark theme). Changes save to localStorage. |

---

## 9. Appendix: Complete Feature List by Tier

### Tier 1 — Free ($0/mo) — 12 features
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
- Frantz Enterprise branding (app footer, PDF, emails)

### Tier 2 — Growth ($29/mo) — +13 features
- Cause library (failure causes + needed parts)
- Q&A post-triage follow-up
- Multi-tech dispatch (up to 3 techs)
- Client Dashboard with login credentials
- Package assignment + per-feature overrides
- MRR tracking
- Remove "Powered by Frantz" footer branding
- *(remaining Tier 2 features to be fleshed out)*

### Tier 3 — Pro ($59/mo) — +12 features
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

### Tier 4 — All-in-One ($99/mo) — +12 features
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

### Extras (Standalone, any paid tier)
- **Social Post Composer** — $10/mo
- **Video Testimonials Gallery** — $10/mo

---

**SafeTriage v0.10.100** — Powered by Frantz Enterprise  
Frantz Locksmith Service | CA License LCO 4160 | (916) 534-4900  
© 2026 Frantz Enterprise
