// ─────────────────────────────────────────────
//  OUTLAST — Random Utilities
// ─────────────────────────────────────────────

// Pick a random item from an array
function randomItem(arr) {
  if (!arr || arr.length === 0) return null;

  return arr[
    Math.floor(Math.random() * arr.length)
  ];
}

// Returns true with probability (0.0 → 1.0)
function randomChance(probability) {
  return Math.random() < probability;
}

// Random integer between min/max inclusive
function randomBetween(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

// Shuffle array and return N items
function pickRandom(arr, count) {
  const shuffled = arr
    .slice()
    .sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

module.exports = {
  randomItem,
  randomChance,
  randomBetween,
  pickRandom,
};
