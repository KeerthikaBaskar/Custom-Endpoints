// const express = require("express");
// const fs = require("fs");

// const app = express();
// app.use(express.json());

// // ======================
// // 1. LOAD KEYS
// // ======================

// let PROVIDER_KEYS = [
//   "f012f115386bdde4a0fec486895ad0cee34d177ddbb5b8de9969e5e71f9ddd8b",
//   "77e00a17b6448530031703da99e03bfe85a9022b4dfbb2b9395506248a23e925",
//   "2f7aa885db5dd3d14592bb852ee750811d25464382e7c8ccbf83658cb745f6d7"
// ];

// try {
//   const data = JSON.parse(fs.readFileSync("keys.json", "utf8"));
//   if (Array.isArray(data) && data.length > 0) {
//     PROVIDER_KEYS = data;
//   }
// } catch (err) {
//   console.log("Using default keys since keys.json missing or invalid.");
// }

// // ======================
// // 2. RATE LIMIT SETUP
// // ======================

// const DAILY_LIMIT = 3;
// const usage = {};

// function initOrResetUsage(key) {
//   usage[key] = {
//     count: 0,
//     resetAt: Date.now() + 24 * 60 * 60 * 1000
//   };
// }

// // ======================
// // 3. MIDDLEWARE (shared for header/query)
// // ======================

// function validateKeyAndLimit(apiKey, res) {
//   if (!apiKey) {
//     res.status(401).json({
//       error: "Missing API key",
//       detail: "Send key in header or query depending on endpoint"
//     });
//     return false;
//   }

//   if (!PROVIDER_KEYS.includes(apiKey)) {
//     res.status(401).json({
//       error: "Invalid API key",
//       detail: "Key not recognized"
//     });
//     return false;
//   }

//   const now = Date.now();
//   if (!usage[apiKey] || now > usage[apiKey].resetAt) {
//     initOrResetUsage(apiKey);
//   }

//   if (usage[apiKey].count >= DAILY_LIMIT) {
//     res.status(429).json({
//       error: "Daily quota exceeded",
//       key: apiKey,
//       allowed_per_day: DAILY_LIMIT,
//       reset_at: new Date(usage[apiKey].resetAt).toISOString()
//     });
//     return false;
//   }

//   usage[apiKey].count++;
//   return true;
// }

// // ======================
// // 4A. HEADER-BASED ENDPOINT
// // ======================

// app.get("/data", (req, res) => {
//   const apiKey = req.header("X-Provider-Key");

//   if (!validateKeyAndLimit(apiKey, res)) return;

//   console.log(`[DATA] Header key=${apiKey} count=${usage[apiKey].count}`);

//   res.json({
//     message: "Success from provider (header key endpoint)",
//     key_used: apiKey,
//     usage: usage[apiKey],
//     value: Math.floor(Math.random() * 100)
//   });

//   // res.json(req.headers);
// });

// // ======================
// // 4B. QUERY PARAM ENDPOINT
// // ======================

// app.get("/data2", (req, res) => {
//   const apiKey = req.query.key;

//   if (!validateKeyAndLimit(apiKey, res)) return;

//   console.log(`[DATA2] Query key=${apiKey} count=${usage[apiKey].count}`);

//   res.json({
//     message: "Success from provider (query key endpoint)",
//     key_used: apiKey,
//     usage: usage[apiKey],
//     value: Math.floor(Math.random() * 100)
//   });
// });


// // ======================
// // RESET LIMITS OF KEYS
// // ======================

// app.post("/admin/reset", (req, res) => {
//   for (const k of PROVIDER_KEYS) {
//     initOrResetUsage(k);
//   }
//   res.json({ message: "All key limits reset successfully" });
// });

// // app.get('/data', (req, res) => {
// //   res.send('OK from /data');
// // });

// // ======================
// // 5. START SERVER
// // ======================

// const PORT = process.env.PORT || 3000; 

// app.listen(PORT, "0.0.0.0", () => { // Bind to 0.0.0.0 for external access
//   console.log(`Provider running on port ${PORT}`);
//   console.log("Header endpoint: /api/v1/data (X-Provider-Key)");
//   console.log("Query end point : /api/v1/data2?key=YOUR_KEY");
// });


const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS for frontend

// ======================
// HEADER-BASED ENDPOINT
// ======================
app.get("/data", (req, res) => {

  // OPTIONAL: verify request came from WSO2
  const injectedKey = req.header("X-Provider-Key");

  if (!injectedKey) {
    return res.status(403).json({
      error: "Request must come via WSO2 Gateway"
    });
  }

  // Business logic ONLY
  res.json({
    message: "Success from backend",
    received_provider_key: injectedKey, // just for debugging
    value: Math.floor(Math.random() * 100)
  });
});

// ======================
// QUERY PARAM ENDPOINT
// ======================
app.get("/data2", (req, res) => {

  const injectedKey = req.query.key;

  if (!injectedKey) {
    return res.status(403).json({
      error: "Request must come via WSO2 Gateway"
    });
  }

  res.json({
    message: "Success from backend",
    received_provider_key: injectedKey,
    value: Math.floor(Math.random() * 100)
  });
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});


// const express = require("express");
// const cors = require("cors");
// const app = express();

// app.use(express.json());
// app.use(cors()); // Enable CORS for frontend

// // ======================
// // HEADER-BASED ENDPOINT
// // ======================
// app.get("/data", (req, res) => {
//   // OPTIONAL: verify request came from WSO2
//   const injectedKey = req.header("X-Provider-Key");
//   if (!injectedKey) {
//     return res.status(403).json({
//       error: "Request must come via WSO2 Gateway",
//       status: "forbidden"
//     });
//   }
  
//   // Business logic with enhanced response data
//   res.json({
//     status: "success",
//     message: "Data retrieved successfully",
//     timestamp: new Date().toISOString(),
//     data: {
//       user_id: Math.floor(Math.random() * 1000),
//       temperature: (Math.random() * 30 + 15).toFixed(1),
//       humidity: Math.floor(Math.random() * 40 + 40),
//       sensor_status: "active",
//       random_value: Math.floor(Math.random() * 100)
//     },
//     metadata: {
//       provider_key_received: injectedKey,
//       endpoint: "/data",
//       method: "header-based"
//     }
//   });
// });

// // ======================
// // QUERY PARAM ENDPOINT
// // ======================
// app.get("/data2", (req, res) => {
//   const injectedKey = req.query.key;
//   if (!injectedKey) {
//     return res.status(403).json({
//       error: "Request must come via WSO2 Gateway",
//       status: "forbidden"
//     });
//   }
  
//   // Business logic with enhanced response data
//   res.json({
//     status: "success",
//     message: "Data retrieved successfully",
//     timestamp: new Date().toISOString(),
//     data: {
//       transaction_id: `TXN-${Math.floor(Math.random() * 100000)}`,
//       amount: (Math.random() * 1000).toFixed(2),
//       currency: "USD",
//       items_count: Math.floor(Math.random() * 10) + 1,
//       random_value: Math.floor(Math.random() * 100)
//     },
//     metadata: {
//       provider_key_received: injectedKey,
//       endpoint: "/data2",
//       method: "query-param"
//     }
//   });
// });

// const PORT = 3000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Backend running on port ${PORT}`);
// });
