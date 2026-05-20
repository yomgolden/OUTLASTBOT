module.exports = (bot) => {

  bot.onText(/\/leaderboard/, async (msg) => {

    bot.sendMessage(
      msg.chat.id,
      `
🏆 GROUP LEADERBOARD

1. VOID — 12 Wins
2. BIGSMURF — 9 Wins
3. PABLO — 5 Wins
`
    );

  });

};
