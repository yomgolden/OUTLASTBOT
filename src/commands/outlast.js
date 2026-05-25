// ─────────────────────────────────────────────
//  OUTLASTBOT — /outlast Command
//  Triggers event selection in a group
// ─────────────────────────────────────────────

const { isMatchActive } = require("../engine/matchEngine");
const { sendAndDelete } = require("../utils/autoDelete");

module.exports = (bot) => {

  bot.onText(/\/outlast/, async (msg) => {
    const chatId = msg.chat.id;

    // ── Group only ──────────────────────────────
    if (msg.chat.type === "private") {
      return bot.sendMessage(
        chatId,
        "Use /outlast inside a group to start a match."
      );
    }

    // ── Block concurrent matches ─────────────────
    if (isMatchActive(chatId)) {
      return bot.sendMessage(chatId, "⚠️  A match is already running in this group.");
    }

    // ── Event selection buttons ──────────────────
    await sendAndDelete(
      bot,
      chatId,
      [
        "🎮  SELECT AN EVENT",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "Choose where the survivors will be dropped.",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🌿  Evil Forest", callback_data: "event_evil_forest" },
              { text: "🌆  Mushin Nightmare", callback_data: "event_mushin_nightmare" },
            ],
            [
              { text: "⚡  Blackout Yaba", callback_data: "event_blackout_yaba" },
              { text: "💀  Ajegunle Warzone", callback_data: "event_ajegunle_warzone" },
            ],
          ],
        },
      }
    );
  });

};
