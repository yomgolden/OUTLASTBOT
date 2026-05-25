// ─────────────────────────────────────────────
//  OUTLASTBOT — Match Engine
//  Drives the full game loop from intro to winner
// ─────────────────────────────────────────────

const { randomItem, randomChance, randomBetween } = require("../utils/random");
const { introCard, roundCard, finalCard, winnerCard } = require("../utils/format");
const { sendAndDelete } = require("../utils/autoDelete");
const { saveMatchResult } = require("../utils/stats");

// ─────────────────────────────────────────────
// Active matches map — keyed by chatId
// ─────────────────────────────────────────────
const activeMatches = {};

// ─────────────────────────────────────────────
// Delay helper
// ─────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
// Fill {placeholder} in template strings
// ─────────────────────────────────────────────
function fill(template, vars) {
  return template
    .replace(/{victim}/gi, vars.victim || "")
    .replace(/{killer}/gi, vars.killer || "")
    .replace(/{player}/gi, vars.player || "")
    .replace(/{winner}/gi, vars.winner || "");
}

// ─────────────────────────────────────────────
// Get all alive players
// ─────────────────────────────────────────────
function getAlive(players) {
  return players.filter((p) => p.alive);
}

// ─────────────────────────────────────────────
// Pick one alive player at random
// ─────────────────────────────────────────────
function pickOne(players) {
  const alive = getAlive(players);
  if (!alive.length) return null;
  return alive[Math.floor(Math.random() * alive.length)];
}

// ─────────────────────────────────────────────
// Pick two different alive players
// ─────────────────────────────────────────────
function pickTwo(players) {
  const alive = getAlive(players).sort(() => Math.random() - 0.5);
  return [alive[0] || null, alive[1] || null];
}

// ─────────────────────────────────────────────
// Run one elimination — marks player dead
// ─────────────────────────────────────────────
function runElimination(players, event) {
  const alive = getAlive(players);
  if (!alive.length) return null;

  const template = randomItem(event.elimination);
  const needsKiller =
    /{killer}/i.test(template) && alive.length >= 2;

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
// Generate round events (narration + actions)
// ─────────────────────────────────────────────
function buildRound(match, roundNumber, usedWorldEvents) {
  const event = match.event;
  const cfg = event.roundConfig;
  const eventLines = [];
  let happened = false;

  // World event
  if (randomChance(cfg.worldEventChance)) {
    const unused = event.worldEvents.filter((e) => !usedWorldEvents.has(e));
    if (unused.length) {
      const we = randomItem(unused);
      usedWorldEvents.add(we);
      eventLines.push("🌑  " + we);
      happened = true;
    }
  }

  // Survival
  if (randomChance(cfg.survivalChance)) {
    const player = pickOne(match.players);
    if (player) {
      const text = fill(randomItem(event.survival), {
        player: player.name.toUpperCase(),
      });
      eventLines.push("⚡  " + text);
      happened = true;
    }
  }

  // Elimination
  if (randomChance(cfg.eliminationChance)) {
    const result = runElimination(match.players, event);
    if (result) {
      eventLines.push("☠️   " + result);
      happened = true;
    }
  }

  // Guarantee at least one thing happened
  if (!happened) {
    const player = pickOne(match.players);
    if (player) {
      const text = fill(randomItem(event.survival), {
        player: player.name.toUpperCase(),
      });
      eventLines.push("⚡  " + text);
    }
  }

  const narrative = randomItem(event.narration);
  const survivorsLeft = getAlive(match.players).length;

  return roundCard(
    roundNumber,
    event.name,
    narrative,
    eventLines,
    survivorsLeft
  );
}

// ─────────────────────────────────────────────
// START MATCH — full game loop
// ─────────────────────────────────────────────
async function startMatch(bot, chatId, match, speedMs) {
  activeMatches[chatId] = match;

  const pace = speedMs || 7000;
  const usedWorldEvents = new Set();
  const eliminated = []; // track order of death for podium

  try {
    // INTRO
    await sendAndDelete(bot, chatId, introCard(match.event, match.players.length));
    await delay(pace * 1.2);

    // ROUNDS
    const cfg = match.event.roundConfig;
    const totalRounds = randomBetween(cfg.min, cfg.max);

    for (let round = 1; round <= totalRounds; round++) {
      const alive = getAlive(match.players);

      // Match over early
      if (alive.length <= 1) break;

      // Final showdown card when 2 remain
      if (alive.length === 2) {
        await sendAndDelete(
          bot,
          chatId,
          finalCard(alive[0].name, alive[1].name)
        );
        await delay(pace * 1.3);
      }

      // Track who dies this round
      const aliveBefore = getAlive(match.players).map((p) => p.id);
      const roundText = buildRound(match, round, usedWorldEvents);
      const aliveAfter = getAlive(match.players).map((p) => p.id);

      // Record eliminated players in order
      const newlyDead = match.players.filter(
        (p) => aliveBefore.includes(p.id) && !aliveAfter.includes(p.id)
      );
      eliminated.push(...newlyDead);

      await sendAndDelete(bot, chatId, roundText);
      await delay(alive.length === 2 ? pace * 1.4 : pace);
    }

    // ─────────────────────────────────────────
    // WINNER
    // ─────────────────────────────────────────
    const survivors = getAlive(match.players);
    const winner = survivors[0] || match.players[0];

    // Podium: last eliminated = 2nd, second-to-last = 3rd
    const reversedElim = eliminated.slice().reverse();
    const runnerUp = reversedElim[0] || null;
    const third = reversedElim[1] || null;

    const winnerText = fill(randomItem(match.event.winner), {
      winner: winner.name.toUpperCase(),
    });

    await sendAndDelete(
      bot,
      chatId,
      winnerCard(
        winner.name,
        runnerUp ? runnerUp.name : null,
        third ? third.name : null,
        match.event.name,
        winnerText
      )
    );

    // ─────────────────────────────────────────
    // SAVE STATS
    // ─────────────────────────────────────────
    const realPlayers = match.players.filter((p) => !p.ai);
    saveMatchResult(realPlayers, winner, match.event.id, chatId);

  } catch (err) {
    console.error("[matchEngine] Error in chat " + chatId, err);
    await bot.sendMessage(
      chatId,
      "Something went wrong. The match collapsed."
    );
  } finally {
    delete activeMatches[chatId];
  }
}

// ─────────────────────────────────────────────
// Check if a match is running in a chat
// ─────────────────────────────────────────────
function isMatchActive(chatId) {
  return !!activeMatches[chatId];
}

module.exports = { startMatch, isMatchActive, activeMatches };
