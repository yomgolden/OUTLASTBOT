// ─────────────────────────────────────────────
//  OUTLASTBOT — JSON Storage Utility
//  All persistent data lives in /data/*.json
// ─────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────
// Read JSON file — returns {} or [] if missing
// ─────────────────────────────────────────────
function readJSON(filePath) {
  const full = path.resolve(filePath);

  if (!fs.existsSync(full)) {
    const empty = filePath.endsWith("history.json") ? "[]" : "{}";
    fs.writeFileSync(full, empty);
  }

  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    console.error("[storage] Failed to parse", filePath, err.message);
    return filePath.endsWith("history.json") ? [] : {};
  }
}

// ─────────────────────────────────────────────
// Write JSON file — pretty printed
// ─────────────────────────────────────────────
function writeJSON(filePath, data) {
  const full = path.resolve(filePath);

  try {
    fs.writeFileSync(full, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[storage] Failed to write", filePath, err.message);
  }
}

module.exports = { readJSON, writeJSON };
