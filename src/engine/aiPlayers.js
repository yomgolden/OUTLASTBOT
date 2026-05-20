const names = [
  "VOID",
  "RAVEN",
  "SPECTRE",
  "BLOODMOON",
  "PHANTOM",
  "NIGHTHOWL"
];

function generateAIPlayers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `ai_${i}`,
    name: names[Math.floor(Math.random() * names.length)],
    ai: true,
    alive: true
  }));
}

module.exports = {
  generateAIPlayers
};
