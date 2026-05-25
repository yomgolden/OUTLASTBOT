// ─────────────────────────────────────────────
//  OUTLASTBOT — /profile Command
//  Shows user stats — works in private and group
// ─────────────────────────────────────────────

const { getUserProfile } = require("../utils/stats");
const { profileCard } = require("../utils/format");
const { sendAndDelete } = require("../utils/autoDelete");

module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {
    const userId = msg.from.id;
    const user = getUserProfile(userId);

    if (!user) {
      return bot.sendMessage(
        msg.chat.id,
        "You haven't played any matches yet. Join a game in a group first."
      );
    }

    await sendAndDelete(bot, msg.chat.id, profileCard(user));
  });

};
