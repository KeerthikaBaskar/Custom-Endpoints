// provider.js
// Run: node provider.js
// Safe: keys come from env var PROVIDER_KEYS_JSON (never commit keys in code)

const express = require("express");

// Load dotenv for local development only (do not rely on it in production)
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line global-require
  require("dotenv").config();
}

const app = express();
app.use(express.json());

// -----------------------
// Config (env-driven)
// -----------------------
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DAILY_LIMIT = process.env.DAILY_LIMIT ? parseInt(process.env.DAILY_LIMIT, 10) : 3;
const ADMIN_SECRET = process.env.ADMIN_SECRET || ""; // must set for admin actions

if (!process.env.PROVIDER_KEYS_JSON) {
  console.error("FATAL: PROVIDER_KEYS_JSON env var is required (JSON array). Exiting.");
  process.exit(1);
}

let PROVIDER_KEYS;
try {
  const parsed = JSON.parse(process.env.PROVIDER_KEYS_JSON);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("not an array or empty");
  PROVIDER_KEYS = parsed;
} catch (err) {
  console.error("FATAL: cannot parse PROVIDER_KEYS_JSON:", err.message);
  process.exit(1);
}

// Usage tracking in-memory (per process)
const usage = {}; // usage[key] = { count, resetAt (ms) }

// init or reset usage for a key
function initOrResetUsageFor(key) {
  const now = Date.now();
  usage[key] = {
    count: 0,
    resetAt: now + 24 * 60 * 60 * 1000, // 24 hours window
  };
}

// Ensure all keys have usage object (on startup)
for (const k of PROVIDER_KEYS) initOrResetUsageFor(k);

// -----------------------
// Helper functions
// -----------------------
function requireAdmin(req, res) {
  const header = req.header("X-Admin-Secret");
  if (!ADMIN_SECRET || !header || header !== ADMIN_SECRET) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }
  return true;
}

function validateKeyAndLimit(apiKey, res) {
  if (!apiKey) {
    res.status(401).json({ error: "Missing API key", detail: "Send key in header or query." });
    return false;
  }
  if (!PROVIDER_KEYS.includes(apiKey)) {
    res.status(401).json({ error: "Invalid API key", detail: "Key not recognized." });
    return false;
  }

  const now = Date.now();
  if (!usage[apiKey] || now > usage[apiKey].resetAt) {
    initOrResetUsageFor(apiKey);
  }

  if (usage[apiKey].count >= DAILY_LIMIT) {
    return res.status(429).json({
      error: "Daily quota exceeded",
      key: apiKey,
      allowed_per_day: DAILY_LIMIT,
      reset_at: new Date(usage[apiKey].resetAt).toISOString(),
    });
  }

  usage[apiKey].count += 1;
  return true;
}

// -----------------------
// Endpoints
// -----------------------

// Header-based endpoint (use X-Provider-Key)
app.get("/api/v1/data", (req, res) => {
  const apiKey = req.header("X-Provider-Key");
  if (!validateKeyAndLimit(apiKey, res)) return;

  res.json({
    message: "Success (header key endpoint)",
    key_used: apiKey,
    usage: usage[apiKey],
    value: Math.floor(Math.random() * 100),
  });
});

// Query-param endpoint (use ?key=)
app.get("/api/v1/data2", (req, res) => {
  const apiKey = req.query.key;
  if (!validateKeyAndLimit(apiKey, res)) return;

  res.json({
    message: "Success (query key endpoint)",
    key_used: apiKey,
    usage: usage[apiKey],
    value: Math.floor(Math.random() * 100),
  });
});

// Protected debug (shows current keys + usage) - DO NOT expose in production without admin secret
app.get("/admin/debug-keys", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ keys: PROVIDER_KEYS, usage });
});

// Protected reset endpoint — resets all key usage windows (no redeploy needed)
app.post("/admin/reset", (req, res) => {
  if (!requireAdmin(req, res)) return;
  for (const k of PROVIDER_KEYS) initOrResetUsageFor(k);
  res.json({ message: "All key limits reset successfully", reset_at: new Date().toISOString() });
});

// Health
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Start server
app.listen(PORT, () => {
  console.log(`Provider running on http://0.0.0.0:${PORT}`);
  console.log("Header endpoint: GET /api/v1/data  (X-Provider-Key)");
  console.log("Query endpoint : GET /api/v1/data2?key=YOUR_KEY");
  console.log("Admin reset   : POST /admin/reset  (X-Admin-Secret header)");
});
