# Provider API Documentation

## Overview

This service is a **key-based API provider** built using **Node.js and Express**.

It authenticates requests using **API keys**, enforces a **daily rate limit per key**, and supports **both header-based and query-based authentication**.

Each API key is allowed a **fixed number of requests per day**, after which further requests are blocked until the quota resets.

---

## ✨ Features

- API Key Authentication
- Header-based & Query-based access
- Daily request quota per API key
- Automatic quota reset every 24 hours
- Admin endpoint to reset all limits
- Configurable API keys via `keys.json`

---

## 🏗️ Tech Stack

- **Node.js**
- **Express.js**
- **File System (fs)** – for loading keys
- **In-memory storage** – for usage tracking

---

## ⏱️ Rate Limiting Rules

| Rule | Value |
| --- | --- |
| Requests per key | **20 per day** |
| Reset interval | **Every 24 hours** |
| Storage | In-memory |
| Exceed behavior | HTTP `429 Too Many Requests` |

---

## 🔄 Usage Tracking Object

```jsx
usage = {
  "API_KEY": {
    count: 5,
    resetAt: 1700000000000
  }
}

```

---

## 📌 Authentication Methods

The API supports **two ways** to send the API key:

| Method | Where to send |
| --- | --- |
| Header-based | `X-Provider-Key` |
| Query-based | `?key=YOUR_KEY` |

---

## 📍 API Endpoints

---

### 🌐 Base URL

```
https://custom-endpoints.onrender.com

```

---

### 1️⃣ GET `/data`

**Description:**

Fetches data using **header-based authentication**.

**Authentication:**

`X-Provider-Key` header

### Request Example

```
GET https://custom-endpoints.onrender.com/data
X-Provider-Key: YOUR_API_KEY

```

### Successful Response (200)

```json
{
  "message": "Success from provider (header key endpoint)",
  "key_used": "YOUR_API_KEY",
  "usage": {
    "count": 3,
    "resetAt": "2025-01-01T10:00:00.000Z"
  },
  "value": 42
}

```

---

### 2️⃣ GET `/data2`

**Description:**

Fetches data using **query parameter authentication**.

**Authentication:**

`key` query parameter

### Request Example

```
GET https://custom-endpoints.onrender.com/data2?key=YOUR_API_KEY

```

### Successful Response (200)

```json
{
  "message": "Success from provider (query key endpoint)",
  "key_used": "YOUR_API_KEY",
  "usage": {
    "count": 7,
    "resetAt": "2025-01-01T10:00:00.000Z"
  },
  "value": 89
}

```

---

### 3️⃣ POST `/admin/reset`

**Description:**

Resets usage limits for **all API keys**.

> ⚠️ Note: This endpoint is not secured and should be protected in production.
> 

### Request Example

```
POST https://custom-endpoints.onrender.com/admin/reset

```

### Successful Response (200)

```json
{
  "message": "All key limits reset successfully"
}

```

---

## ❌ Error Responses

### Missing API Key (401)

```json
{
  "error": "Missing API key",
  "detail": "Send key in header or query depending on endpoint"
}

```

---

### Invalid API Key (401)

```json
{
  "error": "Invalid API key",
  "detail": "Key not recognized"
}

```

---

### Rate Limit Exceeded (429)

```json
{
  "error": "Daily quota exceeded",
  "key": "YOUR_API_KEY",
  "allowed_per_day": 20,
  "reset_at": "2025-01-01T10:00:00.000Z"
}

```

---

## 🚀 Server Configuration

| Setting | Value |
| --- | --- |
| Default Port | `3000` |
| Environment Port | `process.env.PORT` |
| Host Binding | `0.0.0.0` |

### Start Server

```bash
node index.js
```

---
