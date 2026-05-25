// ─────────────────────────────────────────────
//  OUTLASTBOT — /start Command
//  Welcome message for private chat
// ─────────────────────────────────────────────

module.exports = (bot) => {

  bot.onText(/\/start/, async (msg) => {
    const name = msg.from.first_name || "Survivor";

    await bot.sendMessage(
      msg.chat.id,
      [
        `👋  Welcome, ${name}.`,
        ``,
        `OUTLASTBOT is a survival horror game that runs inside Telegram groups.`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📌  HOW TO PLAY`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `1. Add the bot to a Telegram group`,
        `2. Type /outlast to start an event`,
        `3. Players join the lobby`,
        `4. Match runs automatically`,
        `5. One survivor wins`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Use the buttons below to get started:`,
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "👤  My Profile", callback_data: "view_profile" },
              { text: "🏆  Leaderboard", callback_data: "view_leaderboard" },
            ],
            [
              { text: "⚙️   Settings", callback_data: "view_settings" },
            ],
          ],
        },
      }
    );
  });

};
