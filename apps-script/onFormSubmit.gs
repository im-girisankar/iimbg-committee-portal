/**
 * onFormSubmit.gs — thank-you email on every Google Form response.
 *
 * Trigger:  Installable trigger, "On form submit" (from the spreadsheet).
 *
 * Reads the submitted row from the event object (`e.namedValues`), builds
 * an HTML email with ALL styles inline (email clients strip <style> blocks),
 * sends it via MailApp, and records the outcome in the `EmailLog` tab
 * (timestamp, recipient, event, status).
 *
 * Failure isolation: the send is wrapped in try/catch so one bad email
 * never kills the trigger or blocks the next submission. A missing or
 * invalid email is logged as SKIPPED and never throws.
 *
 * Quota note: MailApp free quota is 100 recipients/day — far beyond demo
 * needs, and the per-send log makes it observable if it is ever hit.
 *
 * No secrets live in this file — it contains no credentials at all.
 */

var EMAIL_LOG_COLUMNS = ["Timestamp", "Recipient", "Event", "Status"];

/**
 * Entry point for the On form submit trigger.
 * @param {Object} e The on-form-submit event object (e.namedValues).
 */
function onFormSubmit(e) {
  var named = (e && e.namedValues) || {};
  var eventName = first_(named["Which event did you attend? "]) || "the event";
  var rating = parseInt(first_(named["  Overall Experience  "]), 10);
  if (isNaN(rating)) {
    rating = 5; // or 0 if you prefer
  }
  // Try every reasonable email field
  var email =
  (
    first_(named["Email Address"]) ||
    first_(named["Email"]) ||
    first_(named["Email address"]) ||
    first_(named["Your email"]) ||
    ""
  ).trim();
  var log = setupEmailLogTab_();

  // Edge case: missing/invalid email -> log SKIPPED, never throw.
  if (!isEmail_(email)) {
    log.appendRow([new Date(), email || "(none)", eventName, "SKIPPED"]);
    return;
  }

  var subject = "Thanks for your feedback — " + eventName;
  var htmlBody = buildThankYouHtml_(eventName, rating);

  try {
    MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody });
    log.appendRow([new Date(), email, eventName, "SENT"]);
  } catch (err) {
    // One bad email must never kill the trigger for everyone else.
    log.appendRow([new Date(), email, eventName, "ERROR: " + (err.message || String(err))]);
  }
}

/**
 * Builds the inline-styled HTML email (gold header bar, greeting, rating
 * stars, one-line impact, clean footer).
 * @param {string} eventName The event the respondent attended.
 * @param {number} rating    Rating 1–5 (clamped for display).
 * @return {string} HTML body.
 */
function buildThankYouHtml_(eventName, rating) {
  var filled = clamp_(rating || 0, 0, 5);
  var empty = 5 - filled;
  var stars =
    '<span style="color:#C9A227;">' + "★".repeat(filled) + "</span>" +
    (empty > 0 ? '<span style="color:#9C948A;">' + "☆".repeat(empty) + "</span>" : "");

  return "" +
    '<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#F2EDE3;color:#12100C;border-radius:8px;">' +
      '<div style="background:#C9A227;color:#12100C;padding:20px 24px;font-size:18px;font-weight:bold;border-radius:8px 8px 0 0;">' +
        "Envision – Entrepreneurship Cell, IIM Bodh Gaya" +
      "</div>" +
      '<div style="padding:28px 24px;">' +
        '<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Hi there,</p>' +
        '<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Thanks for your feedback on <strong>' + escapeHtml_(eventName) + "</strong>.</p>" +
        '<p style="margin:0 0 6px;font-size:16px;line-height:1.5;">Your rating:</p>' +
        '<p style="margin:0 0 20px;font-size:30px;letter-spacing:6px;line-height:1.2;">' + stars + "</p>" +
        '<p style="margin:0 0 20px;font-size:16px;line-height:1.5;">Your input directly shapes the next event.</p>' +
      "</div>" +
      '<div style="padding:16px 24px;background:#1C1915;color:#9C948A;font-size:13px;border-radius:0 0 8px 8px;">' +
        "Envision – Entrepreneurship Cell · IIM Bodh Gaya · You received this because you submitted event feedback." +
      "</div>" +
    "</div>";
}

/**
 * Creates the `EmailLog` tab (with a header row) if it does not exist.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The EmailLog sheet.
 */
function setupEmailLogTab_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("EmailLog");
  if (!sheet) {
    sheet = ss.insertSheet("EmailLog");
    sheet.appendRow(EMAIL_LOG_COLUMNS);
    sheet.getRange(1, 1, 1, EMAIL_LOG_COLUMNS.length).setFontWeight("bold");
  }
  return sheet;
}

/** Returns the first value of an e.namedValues array, or "". */
function first_(arr) {
  return (arr && arr.length) ? String(arr[0]) : "";
}

/** Loose email check — anything the form accepts is fine to send to. */
function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Clamp a number into [min, max]. */
function clamp_(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Escape a value so user/event text can never inject HTML into the email. */
function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
