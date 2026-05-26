// ─────────────────────────────────────────────
//  OUTLASTBOT — Auto Delete Utility
// ─────────────────────────────────────────────

const DELETE_AFTER_MS = 5 * 60 * 1000;

function scheduleDelete(bot, chatId, messageId, ms) {
  setTimeout(async () => {
    try { await bot.deleteMessage(chatId, messageId); } catch (_) {}
  }, ms || DELETE_AFTER_MS);
}

async function sendAndDelete(bot, chatId, text, options, ms) {
  try {
    const opts = Object.assign({ parse_mode: "HTML" }, options || {});
    const sent = await bot.sendMessage(chatId, text, opts);
    scheduleDelete(bot, chatId, sent.message_id, ms);
    return sent;
  } catch (err) {
    console.error("[autoDelete] failed:", err.message);
    return null;
  }
}

module.exports = { scheduleDelete, sendAndDelete };
