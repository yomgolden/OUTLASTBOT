// ─────────────────────────────────────────────
//  OUTLASTBOT — /leaderboard Command
//  Shows group or global leaderboard
// ─────────────────────────────────────────────

const { getGroupLeaderboard, getGlobalLeaderboard } = require("../utils/stats");
const { leaderboardCard } = require("../utils/format");
const { sendAndDelete } = require("../utils/autoDelete");

module.exports = (bot) => {

  bot.onText(/\/leaderboard/, async (msg) => {
    const isGroup = msg.chat.type !== "private";

    let players;
    let title;

    if (isGroup) {
      // Show group-specific wins
      players = getGroupLeaderboard(msg.chat.id);
      title = "GROUP LEADERBOARD";
    } else {
      // Show global leaderboard in private
      players = getGlobalLeaderboard();
      title = "OUTLAST GLOBAL";
    }

    if (!players.length) {
      return bot.sendMessage(
        msg.chat.id,
        "No matches played yet. Start one with /outlast"
      );
    }

    await sendAndDelete(bot, msg.chat.id, leaderboardCard(players, title));
  });

};
