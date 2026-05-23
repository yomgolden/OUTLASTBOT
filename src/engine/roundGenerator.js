// ─────────────────────────────────────────────
//  OUTLAST — Cinematic Round Generator
// ─────────────────────────────────────────────

var random = require("../utils/random");

var randomItem =
  random.randomItem;

var randomChance =
  random.randomChance;

var randomBetween =
  random.randomBetween;

// ─────────────────────────────────────────────
// Telegram Monocode
// ─────────────────────────────────────────────
function mono(text) {
  return "```\n" + text + "\n```";
}

// ─────────────────────────────────────────────
// Alive Helpers
// ─────────────────────────────────────────────
function aliveCount(players) {

  return players.filter(function(p) {
    return p.alive;
  }).length;
}

function pickAlive(players) {

  var alive =
    players.filter(function(p) {
      return p.alive;
    });

  if (!alive.length) return null;

  return alive[
    Math.floor(Math.random() * alive.length)
  ];
}

function pickTwo(players) {

  var alive =
    players.filter(function(p) {
      return p.alive;
    });

  if (alive.length < 2) {
    return [alive[0], null];
  }

  var shuffled =
    alive
      .slice()
      .sort(() => Math.random() - 0.5);

  return [
    shuffled[0],
    shuffled[1]
  ];
}

// ─────────────────────────────────────────────
// Fill Placeholders
// ─────────────────────────────────────────────
function fill(template, vars) {

  vars = vars || {};

  return template

    .replace(/{victim}/gi, vars.victim || "")
    .replace(/{killer}/gi, vars.killer || "")
    .replace(/{player}/gi, vars.player || "")
    .replace(/{winner}/gi, vars.winner || "");
}

// ─────────────────────────────────────────────
// World Event Picker
// ─────────────────────────────────────────────
function pickWorldEvent(events, usedSet) {

  var unused =
    events.filter(function(e) {
      return !usedSet.has(e);
    });

  if (!unused.length) return null;

  return randomItem(unused);
}

// ─────────────────────────────────────────────
// Elimination
// ─────────────────────────────────────────────
function doElimination(players, event) {

  var alive =
    players.filter(function(p) {
      return p.alive;
    });

  if (!alive.length) return null;

  var template =
    randomItem(event.elimination);

  var needsKiller =
    template.includes("{Killer}") ||
    template.includes("{killer}");

  var victim;
  var killer;

  if (
    needsKiller &&
    alive.length >= 2
  ) {

    var pair =
      pickTwo(players);

    killer = pair[0];
    victim = pair[1];

  } else {

    victim = pickAlive(players);
  }

  if (!victim) return null;

  victim.alive = false;

  return fill(template, {
    victim:
      victim.name.toUpperCase(),

    killer:
      killer
        ? killer.name.toUpperCase()
        : ""
  });
}

// ─────────────────────────────────────────────
// INTRO CARD
// ─────────────────────────────────────────────
function generateIntroRound(match) {

  var event = match.event;

  var lines = [

    "🌿 " +
    event.name.toUpperCase(),

    "",

    event.introAtmosphere,

    "",

    "━━━━━━━━━━━━━━━━━━",

    "👥 " +
    aliveCount(match.players) +
    " PLAYERS ENTERED.",

    "━━━━━━━━━━━━━━━━━━",

    "",

    "⚠ " + event.tagline
  ];

  return mono(
    lines.join("\n")
  );
}

// ─────────────────────────────────────────────
// OPENING ROUND
// INTRO NARRATIVE + EVENTS
// SAME CARD
// ─────────────────────────────────────────────
function generateOpeningRound(
  match,
  roundNumber,
  usedWorldEvents
) {

  var event = match.event;
  var cfg = event.roundConfig;

  var lines = [

    "⚔ ROUND " + roundNumber,

    "",

    '🗣 "' +
    randomItem(event.openingNarrative) +
    '"',

    ""
  ];

  var happened = false;

  // world event
  if (
    randomChance(
      cfg.worldEventChance
    )
  ) {

    var we =
      pickWorldEvent(
        event.worldEvents,
        usedWorldEvents
      );

    if (we) {

      usedWorldEvents.add(we);

      lines.push(
        "🌑 " + we,
        ""
      );

      happened = true;
    }
  }

  // survival
  if (
    randomChance(
      cfg.survivalChance
    )
  ) {

    var player =
      pickAlive(match.players);

    if (player) {

      lines.push(
        "⚡ " +
        fill(
          randomItem(event.survival),
          {
            player: player.name
          }
        ),
        ""
      );

      happened = true;
    }
  }

  // elimination
  if (
    randomChance(
      cfg.eliminationChance
    )
  ) {

    var result =
      doElimination(
        match.players,
        event
      );

    if (result) {

      lines.push(
        "☠ " + result,
        ""
      );

      happened = true;
    }
  }

  // guarantee something happens
  if (!happened) {

    var fallbackPlayer =
      pickAlive(match.players);

    if (fallbackPlayer) {

      lines.push(
        "⚡ " +
        fill(
          randomItem(event.survival),
          {
            player:
              fallbackPlayer.name
          }
        ),
        ""
      );
    }
  }

  lines.push(
    "━━━━━━━━━━━━━━━━━━",

    "💀 " +
    aliveCount(match.players) +
    " SURVIVORS REMAIN."
  );

  return mono(
    lines.join("\n")
  );
}
