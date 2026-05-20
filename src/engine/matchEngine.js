const settings = require("../config/settings");

const { randomItem } = require("../utils/random");

const { cinematicMessage } = require("../utils/formatter");

const roundGenerator = require("./roundGenerator");

const activeMatches = {};

async function startMatch(bot, chatId, match) {

  let round = 1;

  while (match.players.filter(p => p.alive).length > 1) {

    const roundText = roundGenerator.generateRound(match);

    await bot.sendMessage(
      chatId,
      cinematicMessage(`ROUND ${round}`, roundText),
      {
        parse_mode: "HTML"
      }
    );

    round++;

    await delay(settings.ROUND_DELAY);
  }

  const winner = match.players.find(p => p.alive);

  await bot.sendMessage(
    chatId,
    `🏆 WINNER: ${winner.name}`
  );

  delete activeMatches[chatId];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  startMatch,
  activeMatches
};
