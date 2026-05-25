// ─────────────────────────────────────────────
//  OUTLASTBOT — Format Utility
//  Builds all Telegram message cards
// ─────────────────────────────────────────────

const DIV = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
const SHORT_DIV = "──────────────────────────────";

// ─────────────────────────────────────────────
// INTRO CARD — shown when match starts
// ─────────────────────────────────────────────
function introCard(event, playerCount) {
  return [
    `${event.icon}  ${event.name.toUpperCase()}`,
    DIV,
    ``,
    event.atmosphere,
    ``,
    DIV,
    `👥  ${playerCount} SURVIVORS ENTERED`,
    `⚠️   ${event.tagline}`,
  ].join("\n");
}

// ─────────────────────────────────────────────
// ROUND CARD — one round of events
// ─────────────────────────────────────────────
function roundCard(roundNumber, eventName, narrative, events, survivorsLeft) {
  const lines = [
    `⚔️  ROUND ${roundNumber}  |  ${eventName.toUpperCase()}`,
    DIV,
    ``,
    `🗣  "${narrative}"`,
    ``,
  ];

  for (const ev of events) {
    lines.push(ev);
  }

  lines.push(``);
  lines.push(DIV);
  lines.push(`💀  ${survivorsLeft} SURVIVOR${survivorsLeft === 1 ? "" : "S"} REMAIN`);

  return lines.join("\n");
}

// ─────────────────────────────────────────────
// FINAL SHOWDOWN — 2 players left
// ─────────────────────────────────────────────
function finalCard(playerA, playerB) {
  return [
    `🔥  FINAL SHOWDOWN`,
    DIV,
    ``,
    `Only two remain.`,
    ``,
    `  ${playerA.toUpperCase()}`,
    `        vs`,
    `  ${playerB.toUpperCase()}`,
    ``,
    DIV,
    `One walks out. One does not.`,
  ].join("\n");
}

// ─────────────────────────────────────────────
// WINNER CARD — match over
// ─────────────────────────────────────────────
function winnerCard(winner, runnerUp, third, eventName, winnerLines) {
  const lines = [
    `👑  VICTORY`,
    DIV,
    ``,
    winnerLines,
    ``,
    DIV,
    `🥇  1ST —  ${winner.toUpperCase()}`,
  ];

  if (runnerUp) lines.push(`🥈  2ND —  ${runnerUp.toUpperCase()}`);
  if (third) lines.push(`🥉  3RD —  ${third.toUpperCase()}`);

  lines.push(DIV);

  return lines.join("\n");
}

// ─────────────────────────────────────────────
// LEADERBOARD CARD — group or global
// ─────────────────────────────────────────────
function leaderboardCard(players, title) {
  const sorted = players
    .slice()
    .sort((a, b) => (b.wins || 0) - (a.wins || 0));

  const lines = [
    `🏆  ${title || "LEADERBOARD"}`,
    DIV,
    `${"Player".padEnd(16)}${"Played".padStart(6)}${"Wins".padStart(6)}`,
    SHORT_DIV,
  ];

  for (let i = 0; i < Math.min(sorted.length, 20); i++) {
    const p = sorted[i];
    const name = (p.name || "Unknown").padEnd(16);
    const played = String(p.matches || 0).padStart(6);
    const wins = String(p.wins || 0).padStart(6);
    lines.push(`${name}${played}${wins}`);
  }

  lines.push(DIV);

  return lines.join("\n");
}

// ─────────────────────────────────────────────
// PROFILE CARD — private chat
// ─────────────────────────────────────────────
function profileCard(user) {
  return [
    `👤  ${(user.name || "Unknown").toUpperCase()}`,
    DIV,
    ``,
    `🏆  Wins          ${user.wins || 0}`,
    `⚔️   Matches       ${user.matches || 0}`,
    `☠️   Eliminations  ${user.kills || 0}`,
    `🔥  Streak        ${user.streak || 0}`,
    ``,
    DIV,
  ].join("\n");
}

// ─────────────────────────────────────────────
// LOBBY CARD — waiting for players
// ─────────────────────────────────────────────
function lobbyCard(eventName, players, maxPlayers) {
  const lines = [
    `🎮  LOBBY OPEN  |  ${eventName.toUpperCase()}`,
    DIV,
    ``,
  ];

  if (players.length === 0) {
    lines.push(`  No players yet.`);
  } else {
    for (let i = 0; i < players.length; i++) {
      lines.push(`  ${i + 1}. ${players[i].name}`);
    }
  }

  lines.push(``);
  lines.push(DIV);
  lines.push(`👥  ${players.length} / ${maxPlayers} joined`);

  return lines.join("\n");
}

module.exports = {
  introCard,
  roundCard,
  finalCard,
  winnerCard,
  leaderboardCard,
  profileCard,
  lobbyCard,
};
