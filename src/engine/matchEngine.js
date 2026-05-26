// ─────────────────────────────────────────────
//  OUTLASTBOT — Match Engine
//  Full game loop. Ends only when 1 survivor left.
// ─────────────────────────────────────────────

const { randomItem, randomChance, randomBetween } = require("../utils/random");
const { introCard, roundCard, finalCard, winnerCard } = require("../utils/format");
const { sendAndDelete } = require("../utils/autoDelete");
const { saveMatchResult } = require("../utils/stats");

const activeMatches = {};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fill(template, vars) {
  return template
    .replace(/{victim}/gi, vars.victim || "")
    .replace(/{killer}/gi, vars.killer || "")
    .replace(/{player}/gi, vars.player || "")
    .replace(/{winner}/gi, vars.winner || "");
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
// Run one elimination — marks victim dead
// Returns text line or null
// ─────────────────────────────────────────────
function runElimination(players, event) {
  const alive = getAlive(players);
  if (alive.length <= 1) return null; // never kill the last survivor here

  const template = randomItem(event.elimination);
  const needsKiller = /{killer}/i.test(template) && alive.length >= 2;

  let victim, killer;

  if (needsKiller) {
    const [a, b] = pickTwo(players);
    killer = a;
    victim = b;
  } else {
    victim = pickOne(players);
  }

  if (!victim) return null;

  victim.alive = false;

  return fill(template, {
    victim: victim.name.toUpperCase(),
    killer: killer ? killer.name.toUpperCase() : "",
  });
}

// ─────────────────────────────────────────────
// Build one round — guaranteed 4–6 events
// ─────────────────────────────────────────────
function buildRound(match, roundNumber, usedWorldEvents) {
  const { event, players } = match;
  const eventLines = [];

  // 1. World event (always try first)
  const unused = event.worldEvents.filter((e) => !usedWorldEvents.has(e));
  if (unused.length) {
    const we = randomItem(unused);
    usedWorldEvents.add(we);
    eventLines.push(we);
  }

  // 2. Survival moments — 1 or 2
  const survivalCount = randomBetween(1, 2);
  for (let i = 0; i < survivalCount; i++) {
    const player = pickOne(players);
    if (player) {
      eventLines.push(
        fill(randomItem(event.survival), { player: player.name.toUpperCase() })
      );
    }
  }

  // 3. Eliminations — always at least 1, up to 3 (never kill the last survivor)
  const maxElim = Math.min(3, getAlive(players).length - 1);
  const elimCount = maxElim > 0 ? randomBetween(1, maxElim) : 0;

  for (let i = 0; i < elimCount; i++) {
    if (getAlive(players).length <= 1) break;
    const result = runElimination(players, event);
    if (result) eventLines.push(`ELIMINATED: ${result}`);
  }

  // 4. Pad to minimum 4 events if needed
  while (eventLines.length < 4) {
    const player = pickOne(players);
    if (player) {
      eventLines.push(
        fill(randomItem(event.survival), { player: player.name.toUpperCase() })
      );
    } else break;
  }

  const narrative    = randomItem(event.narration);
  const survivorsLeft = getAlive(players).length;

  return roundCard(roundNumber, event.name, narrative, eventLines, survivorsLeft, players);
}

// ─────────────────────────────────────────────
// START MATCH — runs until exactly 1 survivor
// ─────────────────────────────────────────────
async function startMatch(bot, chatId, match, speedMs) {
  activeMatches[chatId] = match;

  const pace = speedMs || 7000;
  const usedWorldEvents = new Set();
  const eliminated = [];

  try {
    // INTRO
    await sendAndDelete(bot, chatId, introCard(match.event, match.players.length));
    await delay(pace * 1.2);

    let round = 1;

    // ── Core loop — keeps going until 1 survivor ──
    while (getAlive(match.players).length > 1) {

      const alive = getAlive(match.players);

      // Final showdown card when exactly 2 remain
      if (alive.length === 2) {
        await sendAndDelete(bot, chatId, finalCard(alive[0].name, alive[1].name));
        await delay(pace * 1.3);
      }

      // Snapshot alive before round
      const aliveBefore = alive.map((p) => p.id);

      const roundText = buildRound(match, round, usedWorldEvents);

      // Snapshot alive after round to find who died
      const aliveAfter = getAlive(match.players).map((p) => p.id);
      const newlyDead  = match.players.filter(
        (p) => aliveBefore.includes(p.id) && !aliveAfter.includes(p.id)
      );
      eliminated.push(...newlyDead);

      await sendAndDelete(bot, chatId, roundText);
      await delay(alive.length === 2 ? pace * 1.4 : pace);

      round++;

      // Safety cap — 30 rounds max to prevent infinite loop
      if (round > 30) break;
    }

    // ── WINNER ────────────────────────────────────
    const survivors = getAlive(match.players);
    const winner    = survivors[0] || match.players[0];

    const reversedElim = eliminated.slice().reverse();
    const runnerUp = reversedElim[0] || null;
    const third    = reversedElim[1] || null;

    const winnerLine = fill(randomItem(match.event.winner), {
      winner: winner.name.toUpperCase(),
    });

    await sendAndDelete(
      bot,
      chatId,
      winnerCard(
        winner.name,
        runnerUp ? runnerUp.name : null,
        third    ? third.name    : null,
        winnerLine
      )
    );

    // ── SAVE STATS ────────────────────────────────
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
