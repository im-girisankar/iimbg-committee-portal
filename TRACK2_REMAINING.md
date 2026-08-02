# TRACK 2 — Automation & Data Pipeline — Remaining Tasks

> The **website (Track A) is complete and deployed**. Only frontend polish remains.
> This file tracks the **automation pipeline** deliverables for submission.

---

## ✅ Already Done (in repo)

| Item | Location |
|------|----------|
| Apps Script #1: `onFormSubmit.gs` (thank-you email) | `apps-script/onFormSubmit.gs` |
| Apps Script #2: `dailyDigest.gs` (Telegram digest) | `apps-script/dailyDigest.gs` |
| Apps Script README (deployment guide) | `apps-script/README.md` |

---

## 🔴 TO DO — Google Form & Sheet

- [ ] **Create Google Form**: "IT Committee Event Feedback"
  - Fields: Event (dropdown, pre-filled from events), Rating (1–5), What went well, What to improve, Email (optional)
- [ ] **Link to Sheet**: `feedback-pipeline`
  - Tabs: `Form Responses 1`, `EmailLog`, `RunLog`
- [ ] **Copy Form URL** → add to Development PDF

---

## 🔴 TO DO — Apps Script Deployment

### Script #1: `onFormSubmit.gs`
- [ ] Open `https://script.google.com` → New Project → paste `apps-script/onFormSubmit.gs`
- [ ] Set **Script Properties**:
  - `EMAIL_TEMPLATE` (optional customization)
- [ ] **Installable Trigger**: On form submit → `onFormSubmit`
- [ ] Test: submit form → check email sent + `EmailLog` row

### Script #2: `dailyDigest.gs`
- [ ] New Project → paste `apps-script/dailyDigest.gs`
- [ ] Set **Script Properties** (never in code!):
  - `TELEGRAM_BOT_TOKEN` = from BotFather
  - `TELEGRAM_CHAT_ID` = from `/getUpdates` (send bot a msg first)
- [ ] **Time-driven Trigger**: 8–9 AM daily → `dailyDigest`
- [ ] **Manual run** for demo: Run `dailyDigest` → verify Telegram message

---

## 🔴 TO DO — Looker Studio Dashboard

- [ ] Go to `lookerstudio.google.com` → Create → Data Source → Google Sheets → `feedback-pipeline` → `Form Responses 1`
- [ ] Build tiles:
  - **Scorecard**: Average Rating (2 decimal places)
  - **Time Series**: Responses per Day
  - **Bar Chart**: Avg Rating by Event
  - **Table**: Latest "Improve" comments (truncated 80 chars)
- [ ] Theme: Dark bg `#12100C`, series `#C9A227`
- [ ] Share: "Anyone with link can view" → copy **viewer link**

---

## 🔴 TO DO — Demo & Documentation

- [ ] **2-min demo video** (Drive, public): Form submit → email → manual digest → Telegram → dashboard refresh
- [ ] Copy demo video link → Development PDF
- [ ] Verify `apps-script/README.md` has:
  - Trigger setup steps
  - Script Properties keys
  - Quotas/limits note

---

## 🔴 TO DO — IT Support Videos (campus, mandatory)

| Video | Target | Script |
|-------|--------|--------|
| **Auditorium AV** | ≤5 min (~3 min) | `01_VIDEO_SCRIPT_AUDITORIUM.md` |
| **Classroom AV** | ≤5 min (~3 min) | `02_VIDEO_SCRIPT_CLASSROOM.md` |

- [ ] Recon equipment (list brand/model/gotchas)
- [ ] Shoot per script with lower-third timestamp labels
- [ ] Edit to ~3 min each
- [ ] Upload to Drive (public)
- [ ] Timestamped screenshots for PDF

---

## 🔴 TO DO — Final Packaging (2 PDFs only)

### **IT Support PDF** (1 file)
- Both video links (Drive public)
- Auditorium equipment section + captioned screenshots with timestamps
- Classroom equipment section + captioned screenshots with timestamps

### **Development PDF** (1 file)
- Track declaration: **"Track 2 — Automation & Data"**
- Live portal URL: `https://iimbg-committee-portal.vercel.app`
- GitHub repo: `https://github.com/im-girisankar/iimbg-committee-portal`
- API docs: `https://iimbg-committee-portal.vercel.app/api/docs`
- Google Form link
- Looker Studio viewer link
- Demo video link (Drive public)
- `/apps-script` path reference
- Architecture diagram (Form → Sheet → Apps Script → Email/Telegram → Looker Studio)
- **3 design-decision lines** (e.g., "Shared zod schema FE/BE", "DI factory for testability", "At-least-once delivery via pointer")
- "Every link above is public" line

---

## ✅ Website (Track A) — Only Frontend Polish Left

| Task | Status |
|------|--------|
| Mobile layout @375px | [ ] Verify |
| Focus rings, tap targets ≥44px | [ ] Verify |
| Lighthouse mobile ≥90 | [ ] Run & screenshot |
| Playwright smoke (optional) | [ ] Skip if time |

---

## 📋 Submission Checklist

- [ ] Supabase `registrations` table created (run `supabase/schema.sql`)
- [ ] Supabase service key **rotated** (was exposed in chat)
- [ ] Vercel env vars set with **new** key
- [ ] Incognito smoke: all 4 pages + real registration + `/api/docs`
- [ ] Track2: Form → Sheet → Apps Scripts → Telegram → Looker Studio all live
- [ ] Two videos shot, edited, uploaded (public Drive)
- [ ] Two PDFs built per spec
- [ ] Submit exactly **one PDF per vertical**

---

## 📁 Key Files Reference

```
apps-script/
  onFormSubmit.gs       # Thank-you email
  dailyDigest.gs        # Telegram digest (at-least-once)
  README.md             # Deployment guide
supabase/
  schema.sql            # Run in Supabase SQL Editor
docs/                   # Screenshots for PDFs
  screenshot-home.png
  screenshot-mobile.png
  lighthouse.png
  tests-passing.png
```