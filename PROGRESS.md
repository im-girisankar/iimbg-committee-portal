# IIM Bodh Gaya Committee Portal — Progress & To-Do

**Last updated:** 2026-08-03

---

## ✅ Track A — Committee Portal (COMPLETE)

| Component | Status |
|-----------|--------|
| Frontend (React 19 + Vite + TS + Tailwind v4) | Deployed to Vercel |
| Backend (Hono + Vercel Functions) | Deployed |
| API Docs (Scalar at `/api/docs`) | Live |
| Database (Supabase Postgres + RLS) | Configured |
| Tests (42 passing) | ✅ All pass |
| Build / Lint | ✅ Clean |
| GitHub repo (single contributor: im-girisankar) | ✅ Pushed |

**Live URL:** https://iimbg-committee-portal.vercel.app
**API Docs:** https://iimbg-committee-portal.vercel.app/api/docs

---

## 🟡 Track 2 — Automation & Data Pipeline (MOSTLY DONE)

| Component | Status |
|-----------|--------|
| Google Form (7 questions) → `feedback-pipeline` Sheet | ✅ Created |
| Apps Script: `onFormSubmit.gs` (thank-you email) | ✅ Deployed + trigger set |
| Apps Script: `dailyDigest.gs` (email digest, at-least-once) | ✅ Deployed + scheduled 8-9 AM |
| Looker Studio Dashboard | ⬜ **PENDING** |

---

## 📋 Remaining To-Do (Submission Requirements)

### 1. Looker Studio Dashboard (new UI)
- [ ] Create blank report at https://lookerstudio.google.com
- [ ] Connect to `feedback-pipeline` → `Form Responses 1`
- [ ] Add 4 charts:
  - [ ] Scorecard — Average Rating (2 decimals)
  - [ ] Time Series — Responses Over Time (gold line `#C9A227`)
  - [ ] Bar Chart — Avg Rating by Event (gold bars)
  - [ ] Table — Latest "What can we improve?" (10 rows, truncate 80 chars)
- [ ] Theme: Background `#12100C`, Primary `#C9A227`
- [ ] Share → Anyone with link → Viewer → **Copy link**
- [ ] Paste link into Development PDF

### 2. IT Support Videos (shoot on campus)
- [ ] Video 1: Auditorium AV demo
- [ ] Video 2: Classroom AV demo

### 3. Package PDFs
- [ ] **IT Support PDF** — embed/link 2 videos + brief writeup
- [ ] **Development PDF** — include:
  - [ ] Portal URL + API docs URL
  - [ ] GitHub repo link
  - [ ] Looker Studio viewer link
  - [ ] Architecture notes (React + Hono + Supabase + Vercel)
  - [ ] Track 2 pipeline diagram (Form → Apps Script → Email → Looker Studio)

### 4. Submit
- [ ] Submit exactly **1 PDF per vertical** (IT Support + Development)

---

## 🔧 Useful Commands

```bash
# Local development
npm run dev          # Vite (5173) + Hono (8787)

# Testing
npm test             # 42 Vitest tests

# Build
npm run build        # Production build
```

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `apps-script/onFormSubmit.gs` | Thank-you email handler |
| `apps-script/dailyDigest.gs` | Daily digest with pointer logic |
| `apps-script/README.md` | Full deployment guide |
| `src/data/events.json` | 8 Envision events |
| `supabase/schema.sql` | Registrations table DDL |
| `vercel.json` | Vercel config (SPA + API functions) |