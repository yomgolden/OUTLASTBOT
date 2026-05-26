// ─────────────────────────────────────────────
//  OUTLASTBOT — Format Utility
//  All cards use monocode blocks for Telegram
// ─────────────────────────────────────────────

// Wrap in Telegram monocode block
function mono(text) {
  return "```\n" + text + "\n```";
}

const DIV  = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
const SDIV = "──────────────────────────────";

// ─────────────────────────────────────────────
// Clickable player mention (blue + tappable)
// Only works for real players who have a Telegram ID
// ─────────────────────────────────────────────
function mention(player) {
  if (player.ai || !player.id || String(player.id).startsWith("ai_")) {
    return player.name.toUpperCase();
  }
  return `[${player.name.toUpperCase()}](tg://user?id=${player.id})`;
}

// ─────────────────────────────────────────────
// INTRO CARD
// ─────────────────────────────────────────────
function introCard(event, playerCount) {
  return mono([
    `${event.icon}  ${event.name.toUpperCase()}`,
    DIV,
    ``,
    event.atmosphere,
    ``,
    DIV,
    `${playerCount} SURVIVORS ENTERED`,
    event.tagline,
  ].join("\n"));
}

// ─────────────────────────────────────────────
// ROUND CARD — monocode, 4–6 events, strikethrough dead
// ─────────────────────────────────────────────
function roundCard(roundNumber, eventName, narrative, eventLines, survivorsLeft, allPlayers) {
  const lines = [
    `ROUND ${roundNumber}  |  ${eventName.toUpperCase()}`,
    DIV,
    ``,
    `> "${narrative}"`,
    ``,
    SDIV,
  ];

  for (const ev of eventLines) {
    lines.push(ev);
    lines.push(``);
  }

  lines.push(SDIV);
  lines.push(``);

  // Survivor roster — alive normal, dead struck through
  lines.push(`SURVIVORS`);
  for (const p of allPlayers) {
    if (p.alive) {
      lines.push(`  + ${p.name.toUpperCase()}`);
    } else {
      lines.push(`  x ${p.name.toUpperCase()} [DEAD]`);
    }
  }

  lines.push(``);
  lines.push(DIV);
  lines.push(`${survivorsLeft} REMAIN`);

  return mono(lines.join("\n"));
}

// ─────────────────────────────────────────────
// FINAL SHOWDOWN — 2 players left
// ─────────────────────────────────────────────
function finalCard(playerA, playerB) {
  return mono([
    `FINAL SHOWDOWN`,
    DIV,
    ``,
    `Only two remain.`,
    ``,
    `  ${playerA.toUpperCase()}`,
    `       vs`,
    `  ${playerB.toUpperCase()}`,
    ``,
    DIV,
    `One walks out. One does not.`,
  ].join("\n"));
}

// ─────────────────────────────────────────────
// WINNER CARD
// ─────────────────────────────────────────────
function winnerCard(winner, runnerUp, third, winnerLines) {
  const lines = [
    `VICTORY`,
    DIV,
    ``,
    winnerLines,
    ``,
    DIV,
    `1ST  --  ${winner.toUpperCase()}`,
  ];

  if (runnerUp) lines.push(`2ND  --  ${runnerUp.toUpperCase()}`);
  if (third)    lines.push(`3RD  --  ${third.toUpperCase()}`);

  lines.push(DIV);

  return mono(lines.join("\n"));
}

// ─────────────────────────────────────────────
// LEADERBOARD — monocode table
// ─────────────────────────────────────────────
function leaderboardCard(players, title) {
  const sorted = players.slice().sort((a, b) => (b.wins || 0) - (a.wins || 0));

  const lines = [
    `${title || "LEADERBOARD"}`,
    DIV,
    `${"Player".padEnd(18)}${"Played".padStart(6)}${"Wins".padStart(5)}`,
    SDIV,
  ];

  for (let i = 0; i < Math.min(sorted.length, 20); i++) {
    const p = sorted[i];
    const name  = (p.name || "Unknown").toUpperCase().padEnd(18);
    const played = String(p.matches || 0).padStart(6);
    const wins   = String(p.wins    || 0).padStart(5);
    lines.push(`${name}${played}${wins}`);
  }

  lines.push(DIV);

  return mono(lines.join("\n"));
}

// ─────────────────────────────────────────────
// PROFILE CARD
// ─────────────────────────────────────────────
function profileCard(user) {
  return mono([
    `${(user.name || "Unknown").toUpperCase()}`,
    DIV,
    ``,
    `Wins         ${user.wins    || 0}`,
    `Matches      ${user.matches || 0}`,
    `Streak       ${user.streak  || 0}`,
    ``,
    DIV,
    `Speed   ${user.speed  || "normal"}`,
  ].join("\n"));
}

// ─────────────────────────────────────────────
// LOBBY CARD — live player list
// ─────────────────────────────────────────────
function lobbyCard(eventName, players, maxPlayers) {
  const lines = [
    `LOBBY OPEN  |  ${eventName.toUpperCase()}`,
    DIV,
    ``,
  ];

  if (players.length === 0) {
    lines.push(`  No players yet.`);
  } else {
    for (let i = 0; i < players.length; i++) {
      lines.push(`  ${i + 1}.  ${players[i].name}`);
    }
  }

  lines.push(``);
  lines.push(DIV);
  lines.push(`${players.length} / ${maxPlayers} joined`);

  return mono(lines.join("\n"));
}

module.exports = {
  mono,
  mention,
  introCard,
  roundCard,
  finalCard,
  winnerCard,
  leaderboardCard,
  profileCard,
  lobbyCard,
};
