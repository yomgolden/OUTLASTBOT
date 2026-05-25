// ─────────────────────────────────────────────
//  OUTLASTBOT — Entry Point
// ─────────────────────────────────────────────

require("dotenv").config();

// Validate token before starting
if (!process.env.BOT_TOKEN) {
  console.error("❌  Missing BOT_TOKEN in environment variables.");
  process.exit(1);
}

require("./bot");
