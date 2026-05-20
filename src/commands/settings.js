module.exports = (bot) => {

  bot.onText(/\/settings/, async (msg) => {

    bot.sendMessage(
      msg.chat.id,
      `
⚙ SETTINGS

Narration Speed: Normal
Theme: Default
`
    );

  });

};
