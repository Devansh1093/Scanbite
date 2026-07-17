# ScanBite Backend

Node.js + Express + MongoDB backend for ScanBite: scan a barcode, get an
environmental score, sourced from Open Food Facts and cached in MongoDB.

## Setup

```bash
npm install
cp .env.example .env   # then set MONGO_URI (local or Atlas)
npm run dev
```

Requires a running MongoDB instance. For local dev, either install MongoDB
Community Edition or point `MONGO_URI` at a free MongoDB Atlas cluster.

## API

### `GET /api/scan/:barcode`
Cache-first lookup. Checks MongoDB; if missing or stale (>30 days), fetches
from Open Food Facts, computes the eco score, and persists it. Also logs a
`ScanHistory` entry.

### `GET /api/products?q=&category=&minScore=&page=&limit=`
Search cached products. No external API calls - read-only against Mongo.

### `GET /api/products/:barcode`
Fetch a single cached product without triggering an OFF lookup.

### `GET /api/dashboard/history?userId=&page=&limit=`
Paginated scan history, most recent first.

### `GET /api/dashboard/stats?userId=`
Aggregate stats: total scans, average eco score, grade distribution.

## Scoring model (v1)

Rule-based, 0-100, four sub-scores (0-25 each): packaging, ingredients,
transport (heuristic placeholder), certifications. See
`src/services/scoringEngine.js` for the exact rules - comments explain the
reasoning behind each heuristic and where v2 should plug in real data
(e.g. transport currently guesses from category; swap in
origin-country + distance once that's parsed from OFF's
`manufacturing-place` tags).

## Not yet wired in

- Auth (User model exists; no JWT/session middleware yet - `req.userId` is
  a placeholder in `scan.js`)
- Rate limiting on `/api/scan` (Open Food Facts is a shared public API -
  be a good citizen before deploying publicly)
- Tests

## Deployment (week 4)

Dockerfile included. Suggested free-tier path: MongoDB Atlas (free
cluster) + Render or Railway for the API.
