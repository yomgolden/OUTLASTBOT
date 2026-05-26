// ─────────────────────────────────────────────
//  OUTLASTBOT — Format Utility
//  HTML parse mode — supports <s>, <pre>, <a>
// ─────────────────────────────────────────────

// Escape characters that break Telegram HTML
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Wrap in <pre> for monospace block
function mono(text) {
  return "<pre>" + text + "</pre>";
}

const DIV = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
const SDIV = "──────────────────────────────";

// ─────────────────────────────────────────────
// INTRO CARD
// ─────────────────────────────────────────────
function introCard(event, playerCount) {
  return mono([
    esc(`${event.icon}  ${event.name.toUpperCase()}`),
    DIV,
    ``,
    esc(event.atmosphere),
    ``,
    DIV,
    esc(`${playerCount} SURVIVORS ENTERED`),
    esc(event.tagline),
  ].join("\n"));
}

// ─────────────────────────────────────────────
// ROUND CARD
// Header + narrative in <pre>, events as HTML,
// footer in <pre> — so <s> strikethrough works
// ─────────────────────────────────────────────
function roundCard(roundNumber, eventName, narrative, eventLines, survivorsLeft) {
  const header = mono([
    esc(`ROUND ${roundNumber}  |  ${eventName.toUpperCase()}`),
    DIV,
    ``,
    esc(`> "${narrative}"`),
  ].join("\n"));

  // Event lines already contain HTML (<s> tags etc)
  const body = eventLines.join("\n");

  const footer = mono([
    DIV,
    esc(`${survivorsLeft} REMAIN`),
  ].join("\n"));

  return header + "\n" + body + "\n\n" + footer;
}

// ─────────────────────────────────────────────
// WINNER CARD
// ─────────────────────────────────────────────
function winnerCard(winner, runnerUp, third, winnerLines) {
  const lines = [
    `VICTORY`,
    DIV,
    ``,
    esc(winnerLines),
    ``,
    DIV,
    esc(`1ST  --  ${winner.toUpperCase()}`),
  ];

  if (runnerUp) lines.push(esc(`2ND  --  ${runnerUp.toUpperCase()}`));
  if (third)    lines.push(esc(`3RD  --  ${third.toUpperCase()}`));

  lines.push(DIV);

  return mono(lines.join("\n"));
}

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────
function leaderboardCard(players, title) {
  const sorted = players.slice().sort((a, b) => (b.wins || 0) - (a.wins || 0));

  const lines = [
    esc(title || "LEADERBOARD"),
    DIV,
    esc(`${"Player".padEnd(18)}${"Played".padStart(6)}${"Wins".padStart(5)}`),
    SDIV,
  ];

  for (let i = 0; i < Math.min(sorted.length, 20); i++) {
    const p      = sorted[i];
    const name   = (p.name || "Unknown").toUpperCase().padEnd(18);
    const played = String(p.matches || 0).padStart(6);
    const wins   = String(p.wins    || 0).padStart(5);
    lines.push(esc(`${name}${played}${wins}`));
  }

  lines.push(DIV);

  return mono(lines.join("\n"));
}

// ─────────────────────────────────────────────
// PROFILE CARD
// ─────────────────────────────────────────────
function profileCard(user) {
  return mono([
    esc((user.name || "Unknown").toUpperCase()),
    DIV,
    ``,
    esc(`Wins         ${user.wins    || 0}`),
    esc(`Matches      ${user.matches || 0}`),
    esc(`Streak       ${user.streak  || 0}`),
    ``,
    DIV,
    esc(`Speed        ${user.speed   || "normal"}`),
  ].join("\n"));
}

// ─────────────────────────────────────────────
// LOBBY CARD
// ─────────────────────────────────────────────
function lobbyCard(eventName, players, maxPlayers) {
  const lines = [
    esc(`LOBBY OPEN  |  ${eventName.toUpperCase()}`),
    DIV,
    ``,
  ];

  if (players.length === 0) {
    lines.push(`  No players yet.`);
  } else {
    for (let i = 0; i < players.length; i++) {
      lines.push(esc(`  ${i + 1}.  ${players[i].name}`));
    }
  }

  lines.push(``);
  lines.push(DIV);
  lines.push(esc(`${players.length} / ${maxPlayers} joined`));

  return mono(lines.join("\n"));
}

module.exports = {
  mono,
  esc,
  introCard,
  roundCard,
  winnerCard,
  leaderboardCard,
  profileCard,
  lobbyCard,
};
