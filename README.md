# Forum API Starter Project

Node.js + Hapi REST API for a discussion forum. Users can register, authenticate with JWT, create threads, post comments and replies, and like/unlike comments. The service enforces per-IP rate limiting on `/threads` endpoints and ships with PostgreSQL migrations, tests, and a reverse-proxy example.

## Features
- JWT-based auth with access/refresh tokens and token revocation.
- Threads with nested comments and replies; soft-delete keeps history while masking content.
- Toggleable comment likes; thread detail returns `likeCount` per comment.
- Built-in `/threads*` rate limiter (defaults to 90 req/min per IP); mirrored in `nginx.conf`.
- PostgreSQL persistence with `node-pg-migrate`, plus an in-memory option for fast tests.
- Jest test suite with coverage and helper utilities.

## Tech Stack
- Runtime: Node.js, Hapi.js, @hapi/jwt
- Data: PostgreSQL, node-pg-migrate
- Auth/Security: bcrypt password hashing, JWT tokens
- Tooling: Jest, ESLint (Airbnb base), nodemon, instances-container (DI)

## Quick Start
1) Install dependencies  
```bash
npm install
```

2) Create env file (adjust DB credentials and JWT secrets)  
```bash
# PowerShell
copy .env.example .env
```
Key variables: `HOST`, `PORT`, `PG*` and `PG*_TEST`, `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `ACCESS_TOKEN_AGE`, `THREADS_RATE_LIMIT`, `THREADS_RATE_WINDOW_MS`, `USE_MEMORY`.

3) Prepare databases  
- Create `forum_db` and `forum_test_db` in PostgreSQL (or set `USE_MEMORY=true` to skip Postgres for tests).  
- Run migrations for dev DB:
```bash
npm run migrate
```
- Run migrations for test DB (uses `config/database/test.json`):
```bash
npm run migrate:test
```

4) Run the API  
```bash
# Production-style start
npm run start

# With autoreload
npm run start:dev
```
The server listens on `HOST:PORT` from `.env` (default `localhost:5000`). Health check: `GET /` → `Hello world`.

## Testing
- Unit/integration tests: `npm test`
- Coverage: `npm run test:coverage`
- Watch modes: `npm run test:watch` (all) or `npm run test:watch:change`

Tests default to the PostgreSQL test DB; set `USE_MEMORY=true` to run entirely in-memory.

## API Overview
- `POST /users` — register `{ username, password, fullname }` → `{ addedUser: { id, username, fullname } }`
- `POST /authentications` — login `{ username, password }` → `{ accessToken, refreshToken }`
- `PUT /authentications` — refresh `{ refreshToken }` → `{ accessToken }`
- `DELETE /authentications` — logout `{ refreshToken }`
- `POST /threads` (auth) — create thread `{ title, body }` → `{ addedThread: { id, title, owner } }`
- `GET /threads/{threadId}` — detail with comments/replies/like counts:
```json
{
  "status": "success",
  "data": {
    "thread": {
      "id": "thread-123",
      "title": "...",
      "body": "...",
      "date": "...",
      "username": "...",
      "comments": [
        {
          "id": "comment-123",
          "username": "...",
          "date": "...",
          "content": "...",           // "**komentar telah dihapus**" if soft-deleted
          "likeCount": 3,
          "replies": [
            {
              "id": "reply-123",
              "content": "...",       // masked similarly on delete
              "date": "...",
              "username": "..."
            }
          ]
        }
      ]
    }
  }
}
```
- `POST /threads/{threadId}/comments` (auth) — `{ content }` → `{ addedComment }`
- `DELETE /threads/{threadId}/comments/{commentId}` (auth) — soft delete
- `PUT /threads/{threadId}/comments/{commentId}/likes` (auth) — toggle like/unlike
- `POST /threads/{threadId}/comments/{commentId}/replies` (auth) — `{ content }` → `{ addedReply }`
- `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` (auth) — soft delete

Error responses follow Hapi conventions with `{ status: "fail" | "error", message }`. Validation errors originate from domain entities to keep request contracts strict.

## Rate Limiting
- In-app limiter guards `/threads*` at `THREADS_RATE_LIMIT` requests per `THREADS_RATE_WINDOW_MS` per IP (defaults: 90/min).
- `nginx.conf` contains a reverse-proxy example that enforces the same cap and handles HTTPS termination.

## Project Structure (high level)
- `src/Applications` — use cases and security abstractions
- `src/Domains` — entities and repository interfaces
- `src/Infrastructures` — HTTP server, DI container, Postgres pool/repositories
- `src/Interfaces` — Hapi plugins/handlers/routes
- `migrations` — `node-pg-migrate` scripts for schema
- `tests` — helpers for integration/unit tests

## Deployment Notes
- Base URL example: `https://api.dcdg.xyz` (replace with your domain).
- See `nginx.conf` for TLS termination, proxying to `127.0.0.1:5000`, and mirroring `/threads` rate limits.
- Remember to set strong JWT secrets in production and rotate them if compromised.

