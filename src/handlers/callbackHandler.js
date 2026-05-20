const settings = require("../config/settings");

const {
  generateAIPlayers
} = require("../engine/aiPlayers");

const {
  startMatch,
  activeMatches
} = require("../engine/matchEngine");

const events = {
  evilForest: require("../events/evilForest"),
  blackoutYaba: require("../events/blackoutYaba")
};

module.exports = (bot) => {

  bot.on("callback_query", async (query) => {

    const data = query.data;

    const chatId = query.message.chat.id;

    if (data.startsWith("event_")) {

      const eventKey = data.split("_")[1];

      activeMatches[chatId] = {
        players: [],
        started: false,
        event: events[eventKey]
      };

      await bot.sendMessage(
        chatId,
        `🎮 ${events[eventKey].name} lobby opened.\n\nPress JOIN.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Join Match",
                  callback_data: "join_match"
                }
              ],
              [
                {
                  text: "▶ Start Match",
                  callback_data: "start_match"
                }
              ]
            ]
          }
        }
      );
    }

    if (data === "join_match") {

      const match = activeMatches[chatId];

      if (!match) return;

      const exists = match.players.find(
        p => p.id === query.from.id
      );

      if (exists) {
        return bot.answerCallbackQuery(query.id, {
          text: "Already joined."
        });
      }

      match.players.push({
        id: query.from.id,
        name: query.from.first_name,
        alive: true
      });

      bot.answerCallbackQuery(query.id, {
        text: "Joined match."
      });

    }

    if (data === "start_match") {

      const match = activeMatches[chatId];

      if (!match) return;

      const realPlayers = match.players.length;

      if (realPlayers < settings.MIN_PLAYERS) {

        return bot.sendMessage(
          chatId,
          "❌ Need at least 2 real players."
        );
      }

      const aiNeeded =
        settings.MAX_PLAYERS - realPlayers;

      const aiPlayers =
        generateAIPlayers(Math.min(aiNeeded, 6));

      match.players.push(...aiPlayers);

      await bot.sendMessage(
        chatId,
        `🔥 MATCH STARTING\n\n${match.event.intro}`
      );

      startMatch(bot, chatId, match);
    }

  });

};
