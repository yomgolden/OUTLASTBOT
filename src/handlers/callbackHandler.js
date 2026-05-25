// ─────────────────────────────────────────────
//  OUTLASTBOT — Callback Handler
//  Handles all inline keyboard button presses
// ─────────────────────────────────────────────

const events = require("../events/index");
const { generateAIPlayers } = require("../engine/aiPlayers");
const { startMatch, isMatchActive, activeMatches } = require("../engine/matchEngine");
const { getUserProfile, updateUserSetting, getGlobalLeaderboard } = require("../utils/stats");
const { lobbyCard, profileCard, leaderboardCard } = require("../utils/format");
const { sendAndDelete } = require("../utils/autoDelete");

// ─────────────────────────────────────────────
// Narration speed in ms
// ─────────────────────────────────────────────
const SPEED_MAP = {
  slow: 10000,
  normal: 7000,
  fast: 4000,
};

const MAX_PLAYERS = 20;

// ─────────────────────────────────────────────
// Lobby message store — to edit lobby card live
// ─────────────────────────────────────────────
const lobbyMessages = {};

module.exports = (bot) => {

  bot.on("callback_query", async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const userName = query.from.first_name || "Player";

    // ── Acknowledge the tap immediately ──────────
    await bot.answerCallbackQuery(query.id);

    // ─────────────────────────────────────────
    // EVENT SELECTED — open lobby
    // ─────────────────────────────────────────
    if (data.startsWith("event_")) {
      if (isMatchActive(chatId)) {
        return bot.sendMessage(chatId, "⚠️  A match is already running.");
      }

      const eventId = data.replace("event_", "");
      const event = events[eventId];

      if (!event) {
        return bot.sendMessage(chatId, "Unknown event.");
      }

      // Create match object in activeMatches
      activeMatches[chatId] = {
        players: [],
        started: false,
        event: event,
      };

      const match = activeMatches[chatId];

      const sent = await sendAndDelete(
        bot,
        chatId,
        lobbyCard(event.name, match.players, MAX_PLAYERS),
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅  Join Match", callback_data: "join_match" },
                { text: "▶️   Start Match", callback_data: "start_match" },
              ],
            ],
          },
        }
      );

      if (sent) {
        lobbyMessages[chatId] = {
          messageId: sent.message_id,
          eventName: event.name,
        };
      }
    }

    // ─────────────────────────────────────────
    // JOIN MATCH
    // ─────────────────────────────────────────
    if (data === "join_match") {
      const match = activeMatches[chatId];

      if (!match || match.started) {
        return bot.answerCallbackQuery(query.id, {
          text: "No open lobby right now.",
          show_alert: true,
        });
      }

      const alreadyIn = match.players.find((p) => p.id === userId);
      if (alreadyIn) {
        return bot.answerCallbackQuery(query.id, {
          text: "You're already in the lobby.",
          show_alert: true,
        });
      }

      if (match.players.length >= MAX_PLAYERS) {
        return bot.answerCallbackQuery(query.id, {
          text: "Lobby is full.",
          show_alert: true,
        });
      }

      match.players.push({
        id: userId,
        name: userName,
        ai: false,
        alive: true,
        kills: 0,
      });

      // Update lobby card with new player count
      const lobbyMsg = lobbyMessages[chatId];
      if (lobbyMsg) {
        try {
          await bot.editMessageText(
            lobbyCard(lobbyMsg.eventName, match.players, MAX_PLAYERS),
            {
              chat_id: chatId,
              message_id: lobbyMsg.messageId,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "✅  Join Match", callback_data: "join_match" },
                    { text: "▶️   Start Match", callback_data: "start_match" },
                  ],
                ],
              },
            }
          );
        } catch (err) {
          // Edit may fail if message was deleted — ignore
        }
      }
    }

    // ─────────────────────────────────────────
    // START MATCH
    // ─────────────────────────────────────────
    if (data === "start_match") {
      const match = activeMatches[chatId];

      if (!match || match.started) {
        return bot.sendMessage(chatId, "No open lobby.");
      }

      if (match.players.length < 1) {
        return bot.sendMessage(chatId, "At least 1 real player must join first.");
      }

      match.started = true;

      // Fill half the remaining slots with AI
      const realCount = match.players.length;
      const halfMax = Math.floor(MAX_PLAYERS / 2);
      const aiNeeded = Math.max(0, halfMax - realCount);
      const aiPlayers = generateAIPlayers(Math.min(aiNeeded, halfMax));
      match.players.push(...aiPlayers);

      // Get narration speed from the player who pressed Start
      const starter = getUserProfile(userId);
      const speed = SPEED_MAP[starter?.speed] || SPEED_MAP.normal;

      // Run match in background — does not block
      startMatch(bot, chatId, match, speed);
    }

    // ─────────────────────────────────────────
    // SETTINGS — speed update
    // ─────────────────────────────────────────
    if (data.startsWith("setting_speed_")) {
      const speed = data.replace("setting_speed_", "");
      updateUserSetting(userId, userName, "speed", speed);

      bot.sendMessage(
        chatId,
        `✅  Narration speed set to: ${speed}`
      );
    }

    // ─────────────────────────────────────────
    // PRIVATE CHAT BUTTONS (from /start)
    // ─────────────────────────────────────────
    if (data === "view_profile") {
      const user = getUserProfile(userId);
      if (!user) {
        return bot.sendMessage(chatId, "No profile yet. Play a match first.");
      }
      await sendAndDelete(bot, chatId, profileCard(user));
    }

    if (data === "view_leaderboard") {
      const players = getGlobalLeaderboard();
      if (!players.length) {
        return bot.sendMessage(chatId, "No matches yet.");
      }
      await sendAndDelete(bot, chatId, leaderboardCard(players, "OUTLAST GLOBAL"));
    }

    if (data === "view_settings") {
      const user = getUserProfile(userId) || { speed: "normal", theme: "default" };

      await sendAndDelete(
        bot,
        chatId,
        [
          "⚙️   SETTINGS",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          `Narration Speed:  ${user.speed || "normal"}`,
          `Theme:            ${user.theme || "default"}`,
          "",
          "Choose narration speed:",
        ].join("\n"),
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🐢  Slow", callback_data: "setting_speed_slow" },
                { text: "⚡  Normal", callback_data: "setting_speed_normal" },
                { text: "💨  Fast", callback_data: "setting_speed_fast" },
              ],
            ],
          },
        }
      );
    }

  });

};
