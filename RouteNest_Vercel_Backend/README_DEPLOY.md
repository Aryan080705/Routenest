# RouteNest — Vercel Deployment Bundle

This folder contains the **Node/Express + Vite + React** version of RouteNest, configured for Vercel serverless deployment.

## Structure to use on Vercel

Place these in the root of your repo:

```
/api/index.js            ← serverless function (exports the Express app)
/backend/                ← Express app modules (already in the repo)
/src/                    ← React + Vite frontend
/translations/           ← en.js, hi.js, es.js (Spanish file is provided here)
/vercel.json             ← rewrite + function config
/package.json            ← scripts: "build": "vite build"
```

## Required code changes when you copy to your repo

1. Add `src/translations/es.js` (provided as `translations_es.js` in this folder).
2. Update `src/translations/index.js` to export Spanish:
   ```js
   export { en } from './en';
   export { hi } from './hi';
   export { es } from './es';
   ```
3. Replace `src/App.jsx` (iframe-based) with the **real React app** that lives in `/app/frontend/src/App.js` of this Emergent preview — it implements the full UI, dark mode, i18n switching, planner, community, reviews, notifications, profile, settings and auth.
4. Replace the root `vercel.json` with the one in this folder.
5. Ensure the Express backend file (`backend/app.js`) has CORS enabled (already done).

## Endpoints (all wired and working)

- `GET  /api/health` — 200 OK
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/planner/plan` (real OSRM via router.project-osrm.org)
- Community: `GET/POST /api/community`, like, unlike, comment (nested), report, share, delete
- Notifications: history, preferences, mark-read, mark-all-read, send, retry, stats
- Reviews: list, stats, create (verified + completed journey), helpful, 24h edit, report
- Forums, profiles, moderation — all functional, no mock data

## Vercel deployment commands

```
vercel login
vercel link
vercel --prod
```

## Local Express dev

```
yarn install
yarn api:dev    # runs Express on :5000
yarn dev        # runs Vite on :5173 with /api proxied to :5000
```
