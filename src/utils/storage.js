// ─────────────────────────────────────────────
//  OUTLASTBOT — Stats Utility
//  Persists user and group stats to JSON
// ─────────────────────────────────────────────

const { readJSON, writeJSON } = require("./storage");

const USERS_PATH = "./data/users.json";
const GROUPS_PATH = "./data/groups.json";
const HISTORY_PATH = "./data/history.json";

// ─────────────────────────────────────────────
// Get or create a user record
// ─────────────────────────────────────────────
function getUser(users, playerId, playerName) {
  if (!users[playerId]) {
    users[playerId] = {
      id: playerId,
      name: playerName,
      wins: 0,
      kills: 0,
      matches: 0,
      streak: 0,
      lastWin: null,
      speed: "normal",   // narration speed preference
      theme: "default",  // theme preference
    };
  }

  // Always update name in case it changed
  users[playerId].name = playerName;

  return users[playerId];
}

// ─────────────────────────────────────────────
// Save full match result — updates all player stats
// ─────────────────────────────────────────────
function saveMatchResult(realPlayers, winner, eventId, chatId) {
  try {
    const users = readJSON(USERS_PATH);
    const groups = readJSON(GROUPS_PATH);
    const history = readJSON(HISTORY_PATH);

    const timestamp = new Date().toISOString();

    // Update each real player
    for (const player of realPlayers) {
      const user = getUser(users, String(player.id), player.name);

      user.matches += 1;

      if (player.id === winner.id) {
        user.wins += 1;
        user.streak += 1;
        user.lastWin = timestamp;
      } else {
        user.streak = 0;
      }
    }

    // Update group stats
    const groupKey = String(chatId);
    if (!groups[groupKey]) {
      groups[groupKey] = { matchesPlayed: 0, winners: {} };
    }

    groups[groupKey].matchesPlayed += 1;
    const winnerId = String(winner.id);
    if (!groups[groupKey].winners[winnerId]) {
      groups[groupKey].winners[winnerId] = {
        name: winner.name,
        wins: 0,
        matches: 0,
      };
    }

    groups[groupKey].winners[winnerId].wins += 1;
    groups[groupKey].winners[winnerId].matches += 1;
    groups[groupKey].winners[winnerId].name = winner.name;

    // Save match to history
    history.push({
      chatId: groupKey,
      eventId,
      winner: winner.name,
      players: realPlayers.length,
      timestamp,
    });

    // Keep history to last 500 matches
    if (history.length > 500) history.splice(0, history.length - 500);

    writeJSON(USERS_PATH, users);
    writeJSON(GROUPS_PATH, groups);
    writeJSON(HISTORY_PATH, history);

  } catch (err) {
    console.error("[stats] saveMatchResult error:", err.message);
  }
}

// ─────────────────────────────────────────────
// Get user profile object
// ─────────────────────────────────────────────
function getUserProfile(playerId) {
  const users = readJSON(USERS_PATH);
  return users[String(playerId)] || null;
}

// ─────────────────────────────────────────────
// Update a user's setting (speed or theme)
// ─────────────────────────────────────────────
function updateUserSetting(playerId, playerName, key, value) {
  try {
    const users = readJSON(USERS_PATH);
    const user = getUser(users, String(playerId), playerName);
    user[key] = value;
    writeJSON(USERS_PATH, users);
  } catch (err) {
    console.error("[stats] updateUserSetting error:", err.message);
  }
}

// ─────────────────────────────────────────────
// Get global leaderboard (sorted by wins)
// ─────────────────────────────────────────────
function getGlobalLeaderboard() {
  const users = readJSON(USERS_PATH);

  return Object.values(users)
    .sort((a, b) => (b.wins || 0) - (a.wins || 0));
}

// ─────────────────────────────────────────────
// Get group leaderboard (sorted by wins in this group)
// ─────────────────────────────────────────────
function getGroupLeaderboard(chatId) {
  const groups = readJSON(GROUPS_PATH);
  const group = groups[String(chatId)];

  if (!group || !group.winners) return [];

  return Object.values(group.winners)
    .sort((a, b) => (b.wins || 0) - (a.wins || 0));
}

module.exports = {
  saveMatchResult,
  getUserProfile,
  updateUserSetting,
  getGlobalLeaderboard,
  getGroupLeaderboard,
};
