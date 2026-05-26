// ─────────────────────────────────────────────
//  OUTLASTBOT — Match Engine
// ─────────────────────────────────────────────

const { randomItem, randomBetween } = require("../utils/random");
const { introCard, roundCard, winnerCard } = require("../utils/format");
const { sendAndDelete } = require("../utils/autoDelete");
const { saveMatchResult } = require("../utils/stats");

const activeMatches = {};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fill(template, vars) {
  return template
    .replace(/{victim}/gi,  vars.victim  || "")
    .replace(/{killer}/gi,  vars.killer  || "")
    .replace(/{player}/gi,  vars.player  || "")
    .replace(/{winner}/gi,  vars.winner  || "");
}

function getAlive(players) {
  return players.filter((p) => p.alive);
}

function pickOne(players) {
  const alive = getAlive(players);
  if (!alive.length) return null;
  return alive[Math.floor(Math.random() * alive.length)];
}

function pickTwo(players) {
  const alive = getAlive(players).sort(() => Math.random() - 0.5);
  return [alive[0] || null, alive[1] || null];
}

// ─────────────────────────────────────────────
// Mention — clickable for real players
// ─────────────────────────────────────────────
function mentionName(player) {
  if (!player.ai && player.id && !String(player.id).startsWith("ai_")) {
    return `[${player.name}](tg://user?id=${player.id})`;
  }
  return player.name;
}

// ─────────────────────────────────────────────
// Run one elimination — returns Markdown line with ~~victim~~
// ─────────────────────────────────────────────
function runElimination(players, event) {
  const alive = getAlive(players);
  if (alive.length <= 1) return null;

  const template  = randomItem(event.elimination);
  const needsKiller = /{killer}/i.test(template) && alive.length >= 2;

  let victim, killer, killerPlayer;

  if (needsKiller) {
    const [a, b] = pickTwo(players);
    killerPlayer = a;
    victim = b;
  } else {
    victim = pickOne(players);
  }

  if (!victim) return null;

  victim.alive = false;

  // Build display names — victim gets strikethrough, killer is plain
  const victimDisplay = `~~${victim.name.toUpperCase()}~~`;
  const killerDisplay = killerPlayer ? killerPlayer.name.toUpperCase() : "";

  return fill(template, {
    victim: victimDisplay,
    killer: killerDisplay,
  });
}

// ─────────────────────────────────────────────
// Build one round — random mix of 4–6 events
// Order shuffled each round
// ─────────────────────────────────────────────
function buildRound(match, roundNumber, totalRounds, usedWorldEvents) {
  const { event, players } = match;
  const eventLines = [];

  // ── Pick narrative by position ──────────────
  let narrative;
  if (roundNumber === 1) {
    narrative = randomItem(event.openingNarrative);
  } else if (roundNumber === totalRounds || getAlive(players).length <= 2) {
    narrative = randomItem(event.closingNarrative);
  } else {
    narrative = randomItem(event.midNarrative);
  }

  // ── Build a pool of possible event types ────
  // Then shuffle and pick 4–6
  const pool = [];

  // World events — add 1 or 2 if available
  const unusedWorld = event.worldEvents.filter((e) => !usedWorldEvents.has(e));
  if (unusedWorld.length) {
    pool.push({ type: "world", content: randomItem(unusedWorld) });
    if (unusedWorld.length > 1 && Math.random() < 0.4) {
      const second = unusedWorld.filter(e => e !== pool[pool.length-1].content);
      if (second.length) pool.push({ type: "world", content: randomItem(second) });
    }
  }

  // Survival moments — add 1 or 2
  const survCount = randomBetween(1, 2);
  for (let i = 0; i < survCount; i++) {
    const player = pickOne(players);
    if (player) {
      pool.push({
        type: "survival",
        content: fill(randomItem(event.survival), { player: player.name.toUpperCase() }),
      });
    }
  }

  // Eliminations — 1 to 3, never kill last survivor
  const maxElim = Math.min(3, getAlive(players).length - 1);
  const elimCount = maxElim > 0 ? randomBetween(1, maxElim) : 0;
  for (let i = 0; i < elimCount; i++) {
    if (getAlive(players).length <= 1) break;
    const result = runElimination(players, event);
    if (result) pool.push({ type: "elim", content: result });
  }

  // ── Shuffle pool for random ordering ────────
  pool.sort(() => Math.random() - 0.5);

  // ── Ensure minimum 4 events ─────────────────
  while (pool.length < 4) {
    const player = pickOne(players);
    if (!player) break;
    pool.push({
      type: "survival",
      content: fill(randomItem(event.survival), { player: player.name.toUpperCase() }),
    });
  }

  // ── Mark used world events ───────────────────
  for (const item of pool) {
    if (item.type === "world") usedWorldEvents.add(item.content);
  }

  // ── Render lines ─────────────────────────────
  for (const item of pool) {
    eventLines.push(item.content);
  }

  const survivorsLeft = getAlive(players).length;

  return roundCard(roundNumber, event.name, narrative, eventLines, survivorsLeft);
}

// ─────────────────────────────────────────────
// START MATCH
// ─────────────────────────────────────────────
async function startMatch(bot, chatId, match, speedMs) {
  activeMatches[chatId] = match;

  const pace = speedMs || 7000;
  const usedWorldEvents = new Set();
  const eliminated = [];

  // Pre-calculate total rounds for narrative selection
  const cfg = match.event.roundConfig;
  const totalRounds = randomBetween(cfg.min, cfg.max);

  try {
    // INTRO
    await sendAndDelete(bot, chatId, introCard(match.event, match.players.length));
    await delay(pace * 1.2);

    let round = 1;

    while (getAlive(match.players).length > 1) {

      const aliveBefore = getAlive(match.players).map((p) => p.id);

      const roundText = buildRound(match, round, totalRounds, usedWorldEvents);

      const aliveAfter = getAlive(match.players).map((p) => p.id);
      const newlyDead  = match.players.filter(
        (p) => aliveBefore.includes(p.id) && !aliveAfter.includes(p.id)
      );
      eliminated.push(...newlyDead);

      await sendAndDelete(bot, chatId, roundText);
      await delay(pace);

      round++;
      if (round > 30) break; // safety cap
    }

    // ── WINNER ────────────────────────────────
    const survivors   = getAlive(match.players);
    const winner      = survivors[0] || match.players[0];
    const reversedElim = eliminated.slice().reverse();
    const runnerUp    = reversedElim[0] || null;
    const third       = reversedElim[1] || null;

    const winnerLine  = fill(randomItem(match.event.winner), {
      winner: winner.name.toUpperCase(),
    });

    await sendAndDelete(
      bot,
      chatId,
      winnerCard(
        winner.name,
        runnerUp ? runnerUp.name : null,
        third    ? third.name   : null,
        winnerLine
      )
    );

    // ── SAVE STATS ────────────────────────────
    const realPlayers = match.players.filter((p) => !p.ai);
    saveMatchResult(realPlayers, winner, match.event.id, chatId);

  } catch (err) {
    console.error("[matchEngine] Error in chat " + chatId, err);
    await bot.sendMessage(chatId, "Something went wrong. The match collapsed.");
  } finally {
    delete activeMatches[chatId];
  }
}

function isMatchActive(chatId) {
  return !!activeMatches[chatId];
}

module.exports = { startMatch, isMatchActive, activeMatches };
