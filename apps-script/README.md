# Track 2 — Automation & Data pipeline (Apps Script)

Two Google Apps Scripts that turn the **Envision – Entrepreneurship Cell Event Feedback** Google
Form into a self-running pipeline:

```
Google Form ──► Responses Sheet ──► [onFormSubmit] ──► thank-you email (MailApp) ──► EmailLog tab
                       │
                       ├──► [daily 8–9 AM] dailyDigest ──► Email digest (MailApp) ──► RunLog tab
                       │
                       └──► Looker Studio dashboard (live connection)
```

| File | What it does | Trigger |
|------|--------------|---------|
| `onFormSubmit.gs` | Reads each submission, emails a styled HTML thank-you, logs every send to the `EmailLog` tab | On form submit (installable) |
| `dailyDigest.gs` | Summarizes new responses and emails a plain-text digest; logs every run to the `RunLog` tab | Time-driven, 8–9 AM |

Both scripts are **zero-secret by design** — no tokens or URLs live in the code
(they ship on public GitHub). All config is optional Script Properties.

---

## Deploy `onFormSubmit.gs` (thank-you email)

1. Open the **response spreadsheet** (`feedback-pipeline`) that your Google Form is linked to.
2. **Extensions → Apps Script**.
3. Delete the default `Code.gs`, add a file named `onFormSubmit.gs`, paste the contents.
4. Set the trigger:
   - Editor toolbar → **Triggers** (clock icon) → **Add trigger**.
   - **Choose which function to run:** `onFormSubmit`
   - **Choose which deployment should run:** `Head`
   - **Select event source:** *From spreadsheet*
   - **Select event type:** *On form submit* ← must be the *installable* trigger (a simple `onFormSubmit` trigger does **not** receive the form event object).
   - Save and authorize (Grant permissions when prompted).
5. Test: submit the form once — the email arrives and an `EmailLog` tab (created automatically) gets a `SENT` row. A blank/invalid email is logged as `SKIPPED`, never thrown.

---

## Deploy `dailyDigest.gs` (email digest)

1. In the same Apps Script project, add a file named `dailyDigest.gs`, paste the contents.
2. **Optional:** Set Script Properties (**Project Settings ⚙ → Script Properties → Add property**):
   | Property | Value |
   |----------|-------|
   | `DIGEST_RECIPIENT` | Email to receive digests (default: sheet owner) |
3. Set the trigger:
   - **Triggers** → **Add trigger**.
   - **Function:** `dailyDigest`
   - **Event source:** *Time-driven* → **Type:** *Day timer* → **Time of day:** *8 AM to 9 AM*.
   - Save and authorize.

### Run it manually for a demo
In the Apps Script editor, select `dailyDigest` → **Run** → authorize → check email inbox.
Safe for demos: the time-driven trigger only schedules a window, so **always run it manually on camera** — the trigger config screen proves it is scheduled, the manual run proves it works.

---

## How the digest stays correct (at-least-once)

`dailyDigest` keeps a pointer, `lastProcessedRow`, in Script Properties (default `1` = the
header row). It reads only rows after the pointer, and **advances the pointer only after
MailApp confirms a successful send**. On failure it logs `FAILED` in `RunLog` and leaves
the pointer untouched — so the next run retries the same batch. No response is ever silently dropped.

---

## Quotas & notes

- **MailApp free quota: 100 recipients/day** — far beyond demo needs; every send/failure is logged in `EmailLog` / `RunLog` so it is observable.
- `EmailLog` and `RunLog` tabs are created automatically by the scripts (with header rows). The `Form Responses 1` tab is auto-created when you link the form.
- The scripts expect the form fields from the pipeline plan: **Which event did you attend?** (dropdown), **Overall rating** (1–5), **What went well?**, **What should we improve?**, and an **Email** field (built-in *Collect email addresses* or a validated short answer).
- Column positions are matched by **header text**, so the order of fields in the form does not matter.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Email never arrives | Check the `EmailLog` tab: `SKIPPED` = form has no email field; `ERROR: …` = reason logged. Confirm the trigger is **On form submit** and is installable (saved via the Triggers panel). |
| Digest silent | Check `RunLog` tab for `FAILED` entries. Verify `DIGEST_RECIPIENT` in Script Properties if not using sheet owner. |
| `Could not find the '…' column` | The form field labels don't match the plan's. Rename the question labels (headers update automatically on the next submission). |
| MailApp quota exceeded | `ERROR: MailApp… quota` in `EmailLog`. It resets daily; the portal demo needs only a handful of sends. |
