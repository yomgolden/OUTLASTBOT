// ─────────────────────────────────────────────
//  OUTLAST — Match Engine
// ─────────────────────────────────────────────

var settings = require("../config/settings");
var roundGenerator = require("./roundGenerator");

var activeMatches = {};

// ─────────────────────────────────────────────
// Delay Helper
// ─────────────────────────────────────────────
function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

// ─────────────────────────────────────────────
// Safe Telegram Sender
// ─────────────────────────────────────────────
async function sendCard(bot, chatId, text) {

  try {

    await bot.sendMessage(
      chatId,
      text
    );

  } catch (err) {

    console.error(
      "[sendCard]",
      err.message
    );

    await delay(1500);

    try {

      await bot.sendMessage(
        chatId,
        text
      );

    } catch (err2) {

      console.error(
        "[sendCard retry failed]",
        err2.message
      );
    }
  }
}

// ─────────────────────────────────────────────
// START MATCH
// ─────────────────────────────────────────────
async function startMatch(bot, chatId, match) {

  activeMatches[chatId] = match;

  try {

    var cards =
      roundGenerator.generateMatch(match);

    for (var i = 0; i < cards.length; i++) {

      var item = cards[i];

      await sendCard(
        bot,
        chatId,
        item.card
      );

      // pacing
      if (item.type === "intro") {

        await delay(
          settings.ROUND_DELAY * 1.2
        );

      } else if (
        item.type === "final_open"
      ) {

        await delay(
          settings.ROUND_DELAY * 1.3
        );

      } else if (
        item.type === "final_elim"
      ) {

        await delay(
          settings.ROUND_DELAY * 1.4
        );

      } else if (
        item.type === "winner"
      ) {

        await delay(
          settings.ROUND_DELAY * 1.2
        );

      } else {

        await delay(
          settings.ROUND_DELAY
        );
      }
    }

  } catch (err) {

    console.error(
      "[matchEngine] Error in chat " +
      chatId,
      err
    );

    await bot.sendMessage(
      chatId,
      "The forest swallowed the match. Something went wrong."
    );

  } finally {

    delete activeMatches[chatId];
  }
}

function isMatchActive(chatId) {
  return !!activeMatches[chatId];
}

module.exports = {
  startMatch,
  isMatchActive,
  activeMatches,
};
