// ─────────────────────────────────────────────
//  OUTLASTBOT — Random Utilities
// ─────────────────────────────────────────────

// Pick one random item from an array
function randomItem(arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Returns true with given probability (0.0 to 1.0)
function randomChance(probability) {
  return Math.random() < probability;
}

// Random integer between min and max inclusive
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle an array and return n items
function pickRandom(arr, count) {
  return arr.slice().sort(() => Math.random() - 0.5).slice(0, count);
}

module.exports = { randomItem, randomChance, randomBetween, pickRandom };
