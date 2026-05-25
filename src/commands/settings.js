// ─────────────────────────────────────────────
//  OUTLASTBOT — /settings Command
//  Personal preferences — private chat only
// ─────────────────────────────────────────────

const { getUserProfile, updateUserSetting } = require("../utils/stats");
const { sendAndDelete } = require("../utils/autoDelete");

module.exports = (bot) => {

  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const name = msg.from.first_name || "Player";

    const user = getUserProfile(userId) || {
      speed: "normal",
      theme: "default",
    };

    await sendAndDelete(
      bot,
      chatId,
      [
        "⚙️   SETTINGS",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        `Narration Speed:  ${user.speed || "normal"}`,
        `Theme:            ${user.theme || "default"}`,
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Choose a setting to update:",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🐢  Slow", callback_data: "setting_speed_slow" },
              { text: "⚡  Normal", callback_data: "setting_speed_normal" },
              { text: "💨  Fast", callback_data: "setting_speed_fast" },
            ],
          ],
        },
      }
    );
  });

};
