// generate-keys.js
// Run: node generate-keys.js

const fs = require("fs");
const crypto = require("crypto");

// How many keys you want?
const NUM_KEYS = 3;

// Generate one random API key (64 hex chars)
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

// Generate an array of keys
const keys = [];
for (let i = 0; i < NUM_KEYS; i++) {
  keys.push(generateApiKey());
}

// Save to keys.json
fs.writeFileSync("keys.json", JSON.stringify(keys, null, 2));

console.log("✅ Generated API keys and saved to keys.json:");
keys.forEach((k, i) => console.log(`  [${i}] ${k}`));
