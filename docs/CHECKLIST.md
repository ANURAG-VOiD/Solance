# This checklist was used during development. Archived post-MVP launch.

# Solance Project Checklist

Track MVP progress across backend, frontend, and infrastructure. Update this file as features ship.

**Legend:** `[x]` done · `[ ]` not done · `(partial)` works with limitations

**Last reviewed:** 2026-05-31

---

## MVP features (from `frontend/frontend.md`)

### Done

- [x] Wallet authentication (nonce → sign message → JWT)
- [x] Dashboard (role-based stats + recent activity from notifications API)
- [x] Profile management (title, bio, skills, avatar CID)
- [x] Job marketplace (browse open tasks)
- [x] Job creation (client post job)
- [x] Applications (freelancer submit proposals via `GET /api/bids/mine`)
- [x] Client applicant review + accept bid
- [x] Messaging (create chat, send/list messages)
- [x] Invoice creation (API + rich workspace UI)
- [x] Invoice list + Kanban pipeline (`GET /api/invoices`)
- [x] Invoice detail view + mark paid
- [x] Notifications (backend table, REST API, TopBar + dashboard feed)
- [x] Landing page (hero, trust matrix, live featured jobs)
- [x] In-app docs site (`/docs/*`)

### Done (recently completed integrations)

- [x] Real-time notifications — frontend subscribes to `/api/ws/notifications` (auto-reconnecting WebSocket, live prepend + optimistic read)
- [x] Real-time messaging — visibility-aware polling on the active chat (`useMessages`)
- [x] Solana Pay / on-chain invoice settlement — native SOL transfer on Devnet from the client wallet, then `PATCH /api/invoices/:id` → paid
- [x] Featured talent on landing — live `GET /api/users/talent` with graceful fallback to trust cards
- [x] JSON error responses — `ErrorResponse { error }` now returned by **all** routes + auth middleware/extractor

### Partial / in progress

- [ ] Unread message counts `(partial)` — dashboard stat exists but is not true per-message unread tracking

### Not started (future milestones)

- [ ] Reputation system (ratings, reviews, trust scores)
- [ ] Escrow / milestone payments on-chain
- [ ] Invoice PDF download
- [ ] Chat typing indicators
- [ ] Chat file attachments
- [ ] Email notifications
- [x] Production deployment config (secrets hardened, ports locked down, startup guards added)

---

## Infrastructure

- [x] `infrastructure/docker-compose.yml` — Postgres 16 on `:5432`
- [x] Backend env template (`backend/.env.example`)
- [x] Dev commands reference (`COMMANDS.md`)
- [x] Auto-run SQLx migrations on backend startup
- [x] CI pipeline (`.github/workflows/ci.yml` — cargo fmt/build/test + frontend typecheck/lint/build)
- [x] Production deployment config (see Blockers 1–6 in commit history)

---

## Backend — core

- [x] `src/main.rs` — Axum server, CORS, route mounting
- [x] `src/config.rs` — env config
- [x] `src/state.rs` — shared app state + realtime hub
- [x] `src/models.rs` — User, Chat, Message, Invoice, Task, Bid, Notification, DashboardStats
- [x] `src/db/connection.rs` — SQLx pool + auto migrations
- [x] `src/error.rs` — `ErrorResponse { error }` helper
- [x] Backend unit tests

---

## Backend — database migrations

- [x] `20260529200208_init_schema.sql` — users, chats, messages, invoices
- [x] `20260530120000_marketplace_tasks_bids.sql` — profile fields, tasks, bids, chat wallet links
- [x] `20260531000500_notifications.sql` — notifications table + indexes

---

## Backend — API routes

| Endpoint | Status |
|----------|--------|
| `GET /api/health/` | [x] |
| `POST /api/auth/request-nonce` | [x] |
| `POST /api/auth/verify` | [x] |
| `GET /api/auth/me` | [x] |
| `POST /api/chats/` | [x] |
| `GET /api/chats/` | [x] |
| `POST /api/messages/` | [x] |
| `GET /api/messages/:chat_id` | [x] |
| `POST /api/invoices/` | [x] |
| `GET /api/invoices/` (list) | [x] |
| `GET /api/invoices/:id` | [x] |
| `PATCH /api/invoices/:id` | [x] |
| `GET /api/tasks/` (open tasks) | [x] |
| `GET /api/tasks/:id` | [x] |
| `POST /api/tasks/` | [x] |
| `GET /api/tasks/mine` (client jobs) | [x] |
| `POST /api/tasks/:id/bids` | [x] |
| `GET /api/tasks/:id/bids` | [x] |
| `GET /api/bids/mine` (freelancer apps) | [x] |
| `PATCH /api/bids/:id/accept` | [x] |
| `GET /api/dashboard/stats` | [x] |
| `GET /api/notifications/` | [x] |
| `PATCH /api/notifications/:id/read` | [x] |
| `PATCH /api/notifications/read-all` | [x] |
| `GET /api/ws/notifications` (WebSocket) | [x] backend + frontend (query-param JWT) |
| `POST /api/users/` | [x] |
| `GET /api/users/talent` (featured talent) | [x] |
| `GET /api/users/:id` | [x] |
| `PATCH /api/users/profile` | [x] |

### Backend — services & repositories

- [x] Auth, user, chat, message, invoice, task, bid, notification, dashboard
- [x] Realtime hub (notification broadcast)
- [x] Structured bid conflict errors (`DuplicateBid`, `BidStateConflict`)
- [x] Notification SQL error logging + meaningful HTTP responses
- [x] Extend `ErrorResponse` to all routes (auth, tasks, bids, invoices, chats, messages, users, dashboard) + auth middleware/extractor
- [x] Public talent listing repository/service (`list_with_profiles` / `list_talent`)

---

## Frontend — app shell & auth

- [x] Root layout + wallet provider (Phantom / Solflare, devnet)
- [x] Landing page
- [x] Auth guard + app shell (sidebar, top bar)
- [x] `AuthContext` — sign-in flow, session
- [x] JWT + user in localStorage
- [x] Role toggle (freelancer / client) in UI store
- [x] API client parses `{ "error": "..." }` from backend

---

## Frontend — pages

| Route | Status |
|-------|--------|
| `/` | [x] Landing |
| `/dashboard` | [x] |
| `/marketplace` | [x] |
| `/marketplace/[id]` | [x] |
| `/applications` | [x] |
| `/jobs` | [x] |
| `/jobs/new` | [x] |
| `/jobs/[id]/applicants` | [x] |
| `/messages` | [x] |
| `/messages/[chatId]` | [x] |
| `/invoices` | [x] |
| `/invoices/[id]` | [x] |
| `/profile` | [x] |
| `/settings` | [x] |
| `/docs/*` | [x] In-app documentation |

---

## Frontend — data layer (hooks & services)

- [x] `useAsyncData` — shared fetch pattern
- [x] `useTasks` / `useTask` — marketplace
- [x] `useMyApplications` — `GET /api/bids/mine`
- [x] `useMyPostedJobs` — `GET /api/tasks/mine`
- [x] `useInvoices` — `GET /api/invoices`
- [x] `useFreelancerProjects` — accepted bids for invoice workspace
- [x] `useDashboardStats` — `GET /api/dashboard/stats`
- [x] `useNotifications` — REST snapshot + live WebSocket merge
- [x] `useChats` / `useMessages` — REST + visibility-aware polling
- [x] `useInvoiceForm` — form state + draft localStorage
- [x] `useReconnectingWebSocket` — auto-reconnecting authenticated socket
- [x] WebSocket hook for live notifications
- [x] Message polling for live chat

---

## Frontend — feature areas

### Marketplace
- [x] Browse, detail, apply, post job, my jobs, applicants, accept bid

### Chat
- [x] Channel list, message thread, send message
- [x] Real-time receive (other user's messages via polling, no refresh needed)

### Invoices
- [x] Project selector, client info, details, preview, Kanban pipeline
- [x] Generate invoice via API
- [x] Invoice detail + status update
- [x] On-chain Solana payment execution (native SOL transfer, Devnet)
- [ ] PDF export

### Notifications
- [x] TopBar bell + dropdown
- [x] Dashboard recent activity feed
- [x] Mark read / mark all read
- [x] Live push via WebSocket

### Landing
- [x] Hero, trust matrix, project mockup
- [x] Featured jobs (live API)
- [x] Featured talent (live API with trust-card fallback)

---

## Documentation

- [x] `README.md` — product overview
- [x] `frontend/frontend.md` — full product spec
- [x] `COMMANDS.md` — local dev + API testing
- [x] In-app docs (`/docs/getting-started`, wallet auth, jobs, invoicing, etc.)
- [x] `docs/api-spec.md` — full route map, error contract, WebSocket envelope
- [x] `docs/database.md` — all tables (users, chats, messages, invoices, tasks, bids, notifications)
- [x] `docs/architecture.md` — layering, realtime hub, error handling, E2E flow

---

## QA & release

- [x] Code committed to `main`
- [x] Solana Pay integration (native SOL transfer on Devnet)
- [x] Backend `cargo build` + `cargo test` (17 passing) and frontend `tsc` + lint + build verified locally
- [ ] Full E2E manual test: post job → apply → accept → chat → invoice → pay
- [ ] Staging / production environment

---

## Suggested next actions

1. [x] Wire frontend to `/api/ws/notifications` for live notification updates
2. [x] Add message polling for real-time chat
3. [x] Implement Solana Pay in `SolanaPaymentSection.tsx`
4. [x] Extend JSON `ErrorResponse` to all API routes (tasks, invoices, auth, etc.)
5. [x] Update `docs/api-spec.md`, `docs/database.md`, `docs/architecture.md` to match current schema
6. [x] Add CI (`.github/workflows/ci.yml` — Rust `cargo test`, frontend `tsc` + lint + build)
7. [x] Live featured talent API (`GET /api/users/talent`)
8. [x] E2E smoke test script (`scripts/smoke-test.sh`) — run against local or staging stack
9. [x] Upgrade chat to native WebSocket push (reuses notifications realtime hub; polling removed)

---

## Quick local dev checklist

Before testing the app end-to-end:

- [ ] `cd infrastructure && docker compose up -d`
- [ ] `cd backend && cargo run` (migrations run automatically)
- [ ] `cd frontend && npm run dev`
- [ ] Connect wallet on http://localhost:3000
- [ ] API base URL is `http://localhost:8080` (not 3000)
