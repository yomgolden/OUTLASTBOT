// ─────────────────────────────────────────────
//  OUTLASTBOT — Event Registry
//  Add new events here to make them available
// ─────────────────────────────────────────────

const events = {
  evil_forest: require("./evilForest"),
  mushin_nightmare: require("./mushinNightmare"),
  blackout_yaba: require("./blackoutYaba"),
  ajegunle_warzone: require("./ajegunleWarzone"),
};

module.exports = events;
