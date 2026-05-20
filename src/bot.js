const TelegramBot = require("node-telegram-bot-api");

const callbackHandler = require("./handlers/callbackHandler");

const outlastCommand = require("./commands/outlast");
const profileCommand = require("./commands/profile");
const leaderboardCommand = require("./commands/leaderboard");
const settingsCommand = require("./commands/settings");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

outlastCommand(bot);
profileCommand(bot);
leaderboardCommand(bot);
settingsCommand(bot);

callbackHandler(bot);

module.exports = bot;
