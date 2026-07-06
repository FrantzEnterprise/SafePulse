# SafePulse Security Policy

## Data Handling

SafePulse (SafeTriage) is a customer intake and triage tool for legitimate safe-service technicians.

### What Data Is Collected
- Customer name, phone, email, address (for technician dispatch)
- Safe brand, lock type, and symptom descriptions
- Optional photos of the safe/keypad
- Customer zip code for distance-based fee calculation

### Where Data Goes
- **EmailJS (optional)**: If configured by the technician in Admin settings, customer data is sent via EmailJS API (`api.emailjs.com`) to send confirmation emails and technician dispatch reports.
- **No data is sent to any other third party**.
- **All EmailJS credentials are empty by default** — the feature is opt-in and remains disabled until the technician explicitly configures it.
- **No analytics trackers, no cookies, no advertising networks** are used.

### Local Storage
The app uses `localStorage` for:
- Triage history (saved on the user's device only)
- App configuration (settings saved by the technician)
- Welcome screen state

No data stored in `localStorage` is ever sent to any server automatically.

### Security Best Practices
- All EmailJS communication is over HTTPS
- No hardcoded API keys in the codebase
- All configuration fields are blank by default
- Content Security Policy headers are set to restrict script sources

## Reporting a Vulnerability

If you believe you've found a security issue in SafePulse, please contact:
**Robert Frantz** — frantzlocksmith@hotmail.com

Please do not open a public GitHub issue for security vulnerabilities.
