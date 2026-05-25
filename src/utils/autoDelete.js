// ─────────────────────────────────────────────
//  OUTLASTBOT — Auto Delete Utility
//  All game messages self-destruct after 5 mins
// ─────────────────────────────────────────────

const DELETE_AFTER_MS = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────
// Schedule a message for deletion
// ─────────────────────────────────────────────
function scheduleDelete(bot, chatId, messageId, ms) {
  const delay = ms || DELETE_AFTER_MS;

  setTimeout(async () => {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (err) {
      // Message may already be deleted — ignore silently
    }
  }, delay);
}

// ─────────────────────────────────────────────
// Send a message and auto-delete it after delay
// ─────────────────────────────────────────────
async function sendAndDelete(bot, chatId, text, options, ms) {
  try {
    const sent = await bot.sendMessage(chatId, text, options || {});
    scheduleDelete(bot, chatId, sent.message_id, ms);
    return sent;
  } catch (err) {
    console.error("[autoDelete] sendAndDelete failed:", err.message);
    return null;
  }
}

module.exports = { scheduleDelete, sendAndDelete };
