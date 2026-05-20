const events = {
  evilForest: require("../events/evilForest"),
  blackoutYaba: require("../events/blackoutYaba")
};

module.exports = (bot) => {

  bot.onText(/\/outlast/, async (msg) => {

    if (msg.chat.type === "private") {
      return bot.sendMessage(
        msg.chat.id,
        "Use this command inside a group."
      );
    }

    bot.sendMessage(
      msg.chat.id,
      "🎮 SELECT AN EVENT",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🌲 Evil Forest",
                callback_data: "event_evilForest"
              }
            ],
            [
              {
                text: "⚡ Blackout Yaba",
                callback_data: "event_blackoutYaba"
              }
            ]
          ]
        }
      }
    );

  });

};
