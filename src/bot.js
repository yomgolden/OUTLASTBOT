// ─────────────────────────────────────────────
//  OUTLASTBOT — Bot Entry
//  Wires all commands and handlers to the bot
// ─────────────────────────────────────────────

const TelegramBot = require("node-telegram-bot-api");

// Commands
const startCommand = require("./commands/start");
const outlastCommand = require("./commands/outlast");
const profileCommand = require("./commands/profile");
const leaderboardCommand = require("./commands/leaderboard");
const settingsCommand = require("./commands/settings");

// Handlers
const callbackHandler = require("./handlers/callbackHandler");

// ─────────────────────────────────────────────
// Init bot with polling
// ─────────────────────────────────────────────
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

// ─────────────────────────────────────────────
// Register commands
// ─────────────────────────────────────────────
startCommand(bot);
outlastCommand(bot);
profileCommand(bot);
leaderboardCommand(bot);
settingsCommand(bot);

// ─────────────────────────────────────────────
// Register handlers
// ─────────────────────────────────────────────
callbackHandler(bot);

// ─────────────────────────────────────────────
// Global error catch — prevents bot from dying
// ─────────────────────────────────────────────
bot.on("polling_error", (err) => {
  console.error("[polling_error]", err.message);
});

bot.on("error", (err) => {
  console.error("[bot_error]", err.message);
});

console.log("✅  OUTLASTBOT is online.");

module.exports = bot;
