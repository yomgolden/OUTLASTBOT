module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {

    bot.sendMessage(
      msg.chat.id,
      `
👤 PROFILE

Wins: 0
Kills: 0
Matches: 0
`
    );

  });

};
