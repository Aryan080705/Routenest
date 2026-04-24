# Backend Improvement Plan — RouteNest

The current backend is a single 157-line [server.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/server.js) file using Node's raw `http` module with hardcoded in-memory data, no input validation, no error handling, limited MIME types, and no modular structure. This plan restructures it into a clean, production-quality Express.js backend.

## Proposed Changes

### Dependencies

#### [MODIFY] [package.json](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/package.json)
- Add `express` and `cors` as dependencies
- Add `nodemon` as dev dependency with a `dev` script for hot-reloading

---

### Modular Backend Structure

Restructure the flat [server.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/server.js) into a clean modular architecture:

```
backend/
├── server.js              — App entry point (lean: just start the server)
├── app.js                 — Express app setup, middleware, mount routers
├── middleware/
│   ├── cors.js            — CORS configuration
│   ├── errorHandler.js    — Centralized error handling middleware
│   └── requestLogger.js   — Simple request logging (method, url, status, time)
├── routes/
│   ├── community.js       — GET/POST /api/community, POST likes/comments/reports/remove
│   ├── notifications.js   — GET/POST /api/notifications
│   └── reviews.js         — GET/POST /api/reviews
├── data/
│   └── store.js           — In-memory data store (extracted from server.js)
└── utils/
    └── validators.js      — Input validation helpers
```

#### [MODIFY] [server.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/server.js)
- Slim down to just import `app.js` and call `app.listen()`

#### [NEW] [app.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/app.js)
- Create Express app, wire up middleware (CORS, JSON body parsing, request logger, static file serving, error handler)
- Mount route modules under `/api`

#### [NEW] [cors.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/middleware/cors.js)
- Configurable CORS middleware using `cors` package

#### [NEW] [errorHandler.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/middleware/errorHandler.js)
- Centralized error handler — catches all unhandled errors, returns consistent JSON error responses

#### [NEW] [requestLogger.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/middleware/requestLogger.js)
- Logs `METHOD /path → STATUS` with response time for every request

#### [NEW] [community.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/routes/community.js)
- `GET /api/community` — list non-removed posts
- `POST /api/community` — create post (validates `title`, `body`, `verified`)
- `POST /api/community/:id/like` — increment likes
- `POST /api/community/:id/comment` — add a comment (validates non-empty text)
- `POST /api/community/:id/report` — increment report count
- `DELETE /api/community/:id` — soft-remove a post (only if reports ≥ 2)

#### [NEW] [notifications.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/routes/notifications.js)
- `GET /api/notifications` — list all notifications
- `POST /api/notifications` — create notification (validates `type`, `channel`, `text`)
- `POST /api/notifications/:id/retry` — retry a failed notification

#### [NEW] [reviews.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/routes/reviews.js)
- `GET /api/reviews` — list non-hidden reviews
- `POST /api/reviews` — create review (validates `rating` 1-5, `text` min 30 chars, `completedJourney` required)
- `POST /api/reviews/:id/helpful` — increment helpful count
- `POST /api/reviews/:id/report` — report a review

#### [NEW] [store.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/data/store.js)
- Export the in-memory data store with seed data (posts, notifications, reviews)
- Provides `getStore()` and a `resetStore()` function (useful for testing)

#### [NEW] [validators.js](file:///c:/Users/singh/OneDrive/Desktop/Project/RouteNest/backend/utils/validators.js)
- Reusable validation helpers: `requireFields()`, `validateRating()`, `validateMinLength()`

---

### Key Improvements Summary

| Area | Before | After |
|------|--------|-------|
| Framework | Raw `http` module | Express.js |
| Structure | 1 monolithic file | 10+ modular files |
| Error handling | None (crashes on bad input) | Centralized error middleware |
| Input validation | None | Full validation on all POST routes |
| CORS | Manual headers | `cors` package |
| Logging | None | Request logger with response times |
| MIME types | 3 types | Express static handles all |
| Routes | 4 endpoints | 12+ endpoints with CRUD operations |
| Body parsing | Custom stream reader | `express.json()` |
| Static files | Custom `readFile` | `express.static()` |

## Verification Plan

### Automated Tests

Run the server and test all API endpoints via `curl` from PowerShell:

```powershell
# Start the server
cd c:\Users\singh\OneDrive\Desktop\Project\RouteNest
npm start

# In a separate terminal, test each endpoint:

# 1. GET community posts
curl http://localhost:4173/api/community

# 2. POST new community post (should succeed)
curl -X POST http://localhost:4173/api/community -H "Content-Type: application/json" -d '{"verified":true,"author":"Test","title":"Test post","body":"Testing the API","topic":"Routes"}'

# 3. POST community without verified flag (should return 403)
curl -X POST http://localhost:4173/api/community -H "Content-Type: application/json" -d '{"title":"Bad post","body":"No verification"}'

# 4. GET notifications
curl http://localhost:4173/api/notifications

# 5. GET reviews
curl http://localhost:4173/api/reviews

# 6. POST review with short text (should return 400)
curl -X POST http://localhost:4173/api/reviews -H "Content-Type: application/json" -d '{"route":"Test","user":"Test","rating":5,"text":"Short","completedJourney":true,"verified":true}'

# 7. POST valid review (should succeed)
curl -X POST http://localhost:4173/api/reviews -H "Content-Type: application/json" -d '{"route":"Test Route","user":"Test User","rating":4,"text":"This is a detailed review with enough characters to pass validation.","completedJourney":true,"verified":true}'

# 8. Verify static files still serve correctly
curl http://localhost:4173/
```

### Manual Verification

Open `http://localhost:4173` in your browser — verify the frontend still loads and works exactly as before (since it uses localStorage, no API changes should affect it).
