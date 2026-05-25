// ─────────────────────────────────────────────
//  OUTLASTBOT — AI Players Engine
//  Fills empty lobby slots with AI survivors
// ─────────────────────────────────────────────

const AI_NAMES = [
  "VOID", "RAVEN", "SPECTRE", "BLOODMOON", "PHANTOM",
  "NIGHTHOWL", "WRAITH", "STALKER", "SHADE", "REAPER",
  "ECHO", "ZERO", "CIPHER", "GHOST", "VENOM",
  "BANSHEE", "DUSK", "SPITE", "HOLLOW", "FERAL"
];

// ─────────────────────────────────────────────
// Generate n AI player objects
// ─────────────────────────────────────────────
function generateAIPlayers(count) {
  const shuffled = AI_NAMES
    .slice()
    .sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => ({
    id: `ai_${i}_${Date.now()}`,
    name: shuffled[i % shuffled.length],
    ai: true,
    alive: true,
    kills: 0,
  }));
}

module.exports = { generateAIPlayers };
