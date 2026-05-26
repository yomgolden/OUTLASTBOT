// ─────────────────────────────────────────────
//  OUTLASTBOT — Auto Delete Utility
//  All game messages self-destruct after 5 mins
// ─────────────────────────────────────────────

const DELETE_AFTER_MS = 5 * 60 * 1000;

function scheduleDelete(bot, chatId, messageId, ms) {
  setTimeout(async () => {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (_) {}
  }, ms || DELETE_AFTER_MS);
}

// ─────────────────────────────────────────────
// Send with Markdown parse mode + auto-delete
// ─────────────────────────────────────────────
async function sendAndDelete(bot, chatId, text, options, ms) {
  try {
    const opts = Object.assign({ parse_mode: "Markdown" }, options || {});
    const sent = await bot.sendMessage(chatId, text, opts);
    scheduleDelete(bot, chatId, sent.message_id, ms);
    return sent;
  } catch (err) {
    console.error("[autoDelete] sendAndDelete failed:", err.message);
    return null;
  }
}

module.exports = { scheduleDelete, sendAndDelete };
