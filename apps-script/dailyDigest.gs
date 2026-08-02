/**
 * dailyDigest.gs — scheduled email digest of new feedback responses.
 *
 * Trigger: Time-driven → Day timer → 8–9 AM.
 *
 * AT-LEAST-ONCE DELIVERY:
 *   The pointer (`lastProcessedRow`, stored in Script Properties) is ONLY
 *   advanced after MailApp confirms a successful send. If the send fails
 *   we log FAILED in the `RunLog` tab and leave the pointer untouched —
 *   so the next scheduled run re-attempts the same batch. No response is
 *   ever silently dropped. (Say "at-least-once" in the interview.)
 *
 * SECRETS:
 *   No secrets needed! Uses MailApp (no extra config).
 *   Recipient is the spreadsheet owner (or active user) by default.
 *   Override with Script Property `DIGEST_RECIPIENT` if needed.
 */

var DIGEST_SHEET_NAME = "Form Responses 1";
var POINTER_KEY = "lastProcessedRow";
var RUNLOG_COLUMNS = ["Timestamp", "New Responses", "Avg Rating", "Status", "Detail"];

/**
 * Entry point for the time-driven trigger (and for manual runs / demos).
 */
function dailyDigest() {
  var props = PropertiesService.getScriptProperties();
  var lastProcessedRow = Number(props.getProperty(POINTER_KEY)) || 1; // 1 = header row

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DIGEST_SHEET_NAME);
  if (!sheet) {
    fail_(ss, "No tab named '" + DIGEST_SHEET_NAME + "' — link the Google Form to this Sheet first.");
    return;
  }

  var lastDataRow = sheet.getLastRow();

  // No new rows since the last run -> send a "still alive" message and exit.
  if (lastDataRow <= lastProcessedRow) {
    var emptyMsg = "📊 Daily digest — no new responses in the last 24h.";
    try {
      sendEmail_(emptyMsg, ss);
    } catch (err) {
      mailFallback_(ss, "No new responses — but the email send failed:\n" + (err.message || err));
    }
    return;
  }

  var newCount = lastDataRow - lastProcessedRow;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = getColumnMap_(headers);
  var rows = sheet.getRange(lastProcessedRow + 1, 1, newCount, sheet.getLastColumn()).getValues();

  // --- compute the digest metrics -------------------------------------
  var ratingSum = 0;
  var rated = 0;
  var byEvent = {};
  var improveComments = [];
  for (var i = 0; i < rows.length; i++) {
    var eventName = String(rows[i][col.event] || "").trim();
    var rating = Number(rows[i][col.rating]);
    var improve = String(rows[i][col.improve] || "").trim();

    if (isFinite(rating)) { ratingSum += rating; rated++; }
    if (eventName) { byEvent[eventName] = (byEvent[eventName] || 0) + 1; }
    if (improve) { improveComments.push(improve); }
  }
  var avgRating = rated ? ratingSum / rated : 0;

  // Newest improve comments first, max 3, each truncated to 80 chars.
  var newest = improveComments.slice(-3).reverse();
  var commentLines = newest.map(function (c) {
    return '• "' + truncate80_(c) + '"';
  }).join("\n") || "—";

  // Per-event breakdown, sorted by count (then name).
  var breakdown = Object.keys(byEvent)
    .sort(function (a, b) { return byEvent[b] - byEvent[a] || a.localeCompare(b); })
    .map(function (e) { return e + " " + byEvent[e]; })
    .join(" · ") || "—";

  var dateLine = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEE, d MMM");
  var text = [
    "📊 Envision – Entrepreneurship Cell — Daily Feedback Digest",
    dateLine,
    "",
    "New responses: " + newCount + "   Avg rating: " + avgRating.toFixed(2) + " ★",
    "By event: " + breakdown,
    "",
    "Latest comments:",
    commentLines
  ].join("\n");

  // --- send, then advance the pointer ONLY on success -----------------
  try {
    sendEmail_(text, ss);
    props.setProperty(POINTER_KEY, String(lastDataRow));
    logRun_(ss, newCount, avgRating, "SENT", "");
  } catch (err) {
    fail_(ss, err.message || String(err)); // pointer NOT advanced -> retry next run
  }
}

/**
 * Sends the digest via MailApp. Throws on any failure.
 * @param {string} text Plain-text message body.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss Active spreadsheet.
 */
function sendEmail_(text, ss) {
  var props = PropertiesService.getScriptProperties();
  var to = props.getProperty("DIGEST_RECIPIENT");
  if (!to) {
    var owner = ss.getOwner();
    to = owner ? owner.getEmail() : Session.getActiveUser().getEmail();
  }
  if (!to) {
    throw new Error("No recipient found. Set DIGEST_RECIPIENT in Script Properties or ensure sheet owner has an email.");
  }

  MailApp.sendEmail({
    to: to,
    subject: "[Envision] Daily Feedback Digest — " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "d MMM yyyy"),
    body: text
  });
}

/**
 * Failure path: log FAILED to RunLog. Never throws,
 * and never advances the pointer — the next run retries the batch.
 */
function fail_(ss, message) {
  try {
    logRun_(ss, 0, 0, "FAILED", message);
  } catch (e) {
    // Swallow: the pointer stays put, so nothing is lost either way.
  }
}

/** Append one run's stats to the `RunLog` tab. */
function logRun_(ss, count, avg, status, detail) {
  var sheet = setupRunLogTab_(ss);
  sheet.appendRow([new Date(), count, avg.toFixed(2), status, detail]);
}

/**
 * Creates the `RunLog` tab (with a header row) if it does not exist.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss Active spreadsheet.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The RunLog sheet.
 */
function setupRunLogTab_(ss) {
  var sheet = ss.getSheetByName("RunLog");
  if (!sheet) {
    sheet = ss.insertSheet("RunLog");
    sheet.appendRow(RUNLOG_COLUMNS);
    sheet.getRange(1, 1, 1, RUNLOG_COLUMNS.length).setFontWeight("bold");
  }
  return sheet;
}

/**
 * Maps the response-sheet headers to column indexes, so the script still
 * works if the form's field order changes.
 * @param {Array<string>} headers Header row values.
 * @return {Object} { event, rating, improve, timestamp, ... } -> 0-based column.
 */
function getColumnMap_(headers) {
  function find(needle) {
    for (var i = 0; i < headers.length; i++) {
      if (String(headers[i]).toLowerCase().indexOf(needle) !== -1) { return i; }
    }
    return -1;
  }
  var map = {
    event: find("which event"),
    rating: find("overall rating"),
    improve: find("what should we improve"),
    wentWell: find("what went well"),
    email: find("email"),
    timestamp: find("timestamp")
  };
  if (map.event === -1)    { throw new Error("Could not find the 'Which event did you attend?' column in '" + DIGEST_SHEET_NAME + "'."); }
  if (map.rating === -1)   { throw new Error("Could not find the 'Overall rating' column in '" + DIGEST_SHEET_NAME + "'."); }
  if (map.improve === -1)  { throw new Error("Could not find the 'What should we improve?' column in '" + DIGEST_SHEET_NAME + "'."); }
  return map;
}

/** Truncate a comment to at most 80 characters (incl. the ellipsis). */
function truncate80_(s) {
  return s.length > 80 ? s.slice(0, 79) + "…" : s;
}