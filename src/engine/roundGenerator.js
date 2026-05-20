const { randomItem } = require("../utils/random");

function generateRound(match) {

  const alivePlayers = match.players.filter(p => p.alive);

  const event = match.event;

  const narration = randomItem(event.atmosphere);

  const victim =
    alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

  victim.alive = false;

  const elimination = randomItem(event.eliminations)
    .replace("{victim}", victim.name);

  return `
${narration}

☠ ${elimination}

${alivePlayers.length - 1} SURVIVORS REMAIN.
`;
}

module.exports = {
  generateRound
};
