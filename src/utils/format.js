// ─────────────────────────────────────────────
//  OUTLASTBOT — Format Utility
// ─────────────────────────────────────────────

function mono(text) {
  return "```\n" + text + "\n```";
}

const DIV = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

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
// ROUND CARD — no roster, no ELIMINATED prefix
// Victim names get ~~strikethrough~~ via Markdown
// (rendered outside monocode for strikethrough support)
// ─────────────────────────────────────────────
function roundCard(roundNumber, eventName, narrative, eventLines, survivorsLeft) {
  // Header and narrative in monocode
  const header = mono([
    `ROUND ${roundNumber}  |  ${eventName.toUpperCase()}`,
    DIV,
    ``,
    `> "${narrative}"`,
  ].join("\n"));

  // Events as plain Markdown lines (supports ~~strikethrough~~ and [mentions])
  const body = eventLines.join("\n");

  // Footer in monocode
  const footer = mono([
    DIV,
    `${survivorsLeft} REMAIN`,
  ].join("\n"));

  return header + "\n" + body + "\n" + footer;
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
    `──────────────────────────────`,
  ];

  for (let i = 0; i < Math.min(sorted.length, 20); i++) {
    const p = sorted[i];
    const name   = (p.name || "Unknown").toUpperCase().padEnd(18);
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
    `Speed        ${user.speed   || "normal"}`,
  ].join("\n"));
}

// ─────────────────────────────────────────────
// LOBBY CARD
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
  introCard,
  roundCard,
  winnerCard,
  leaderboardCard,
  profileCard,
  lobbyCard,
};
