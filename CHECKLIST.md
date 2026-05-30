# Solance Project Checklist

Track MVP progress across backend, frontend, and infrastructure. Update this file as features ship.

**Legend:** `[x]` done · `[ ]` not done · `(partial)` works with limitations or workarounds

**Last reviewed:** 2026-05-30

---

## MVP features (from `frontend/frontend.md`)

- [x] Wallet authentication (nonce → sign message → JWT)
- [x] Dashboard (role-based stats)
- [ ] Dashboard recent activity (partial — hardcoded mock in `DashboardOverview.tsx`)
- [x] Profile management (title, bio, skills, avatar CID)
- [x] Job marketplace (browse open tasks)
- [x] Job creation (client post job)
- [x] Applications (freelancer submit proposals)
- [x] Client applicant review + accept bid
- [x] Messaging (create chat, send/list messages)
- [ ] Real-time messaging (partial — REST fetch on load only, no WebSocket/polling)
- [x] Invoice creation (API + rich UI)
- [x] Invoice detail view + mark paid
- [ ] Invoice list API (partial — frontend uses localStorage cache)
- [ ] Solana Pay / on-chain invoice settlement
- [ ] Notifications (partial — UI + seeded mock store, not backend-driven)
- [ ] Reputation system (future)
- [ ] Escrow payments (future)

---

## Infrastructure

- [x] `infrastructure/docker-compose.yml` — Postgres 16 on `:5432`
- [x] Backend env template (`backend/.env.example`)
- [x] Dev commands reference (`COMMANDS.md`)
- [ ] Production deployment config
- [ ] CI/CD pipeline

---

## Backend — core

- [x] `src/main.rs` — Axum server, CORS, route mounting
- [x] `src/config.rs` — env config (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`)
- [x] `src/state.rs` — shared app state
- [x] `src/models.rs` — User, Chat, Message, Invoice, Task, Bid
- [x] `src/db/connection.rs` — SQLx Postgres pool
- [ ] `src/error.rs` — centralized error types (stub)
- [x] Backend unit tests (17 passing)

---

## Backend — database migrations

- [x] `20260529200208_init_schema.sql` — users, chats, messages, invoices
- [x] `20260530120000_marketplace_tasks_bids.sql` — profile fields, tasks, bids, chat wallet links

---

## Backend — authentication

- [x] `auth/nonce_store.rs` — in-memory nonce TTL store
- [x] `auth/signature.rs` — Ed25519 wallet signature verification
- [x] `auth/jwt.rs` — issue and validate JWT
- [x] `auth/middleware.rs` — `require_auth` + `AuthUser` extractor
- [x] `auth/models.rs` — request/response DTOs
- [ ] `auth/handlers.rs` — placeholder (unused)
- [ ] `auth/password.rs` — placeholder (unused)
- [x] `services/auth_service.rs`
- [x] `routes/auth.rs` — `POST /request-nonce`, `POST /verify`, `GET /me`

---

## Backend — API routes

| Endpoint | File | Status |
|----------|------|--------|
| `GET /api/health/` | `routes/health.rs` | [x] |
| `POST /api/auth/request-nonce` | `routes/auth.rs` | [x] |
| `POST /api/auth/verify` | `routes/auth.rs` | [x] |
| `GET /api/auth/me` | `routes/auth.rs` | [x] |
| `POST /api/chats/` | `routes/chats.rs` | [x] |
| `GET /api/chats/` | `routes/chats.rs` | [x] |
| `POST /api/messages/` | `routes/messages.rs` | [x] |
| `GET /api/messages/:chat_id` | `routes/messages.rs` | [x] |
| `POST /api/invoices/` | `routes/invoices.rs` | [x] |
| `GET /api/invoices/:id` | `routes/invoices.rs` | [x] |
| `PATCH /api/invoices/:id` | `routes/invoices.rs` | [x] |
| `GET /api/invoices/` (list) | — | [ ] |
| `GET /api/tasks/` (open tasks) | `routes/tasks.rs` | [x] |
| `GET /api/tasks/:id` | `routes/tasks.rs` | [x] |
| `POST /api/tasks/` | `routes/tasks.rs` | [x] |
| `POST /api/tasks/:id/bids` | `routes/tasks.rs` | [x] |
| `GET /api/tasks/:id/bids` | `routes/tasks.rs` | [x] |
| `PATCH /api/bids/:id/accept` | `routes/bids.rs` | [x] |
| `GET /api/tasks/mine` (client jobs) | — | [ ] |
| `GET /api/bids/mine` (freelancer apps) | — | [ ] |
| `POST /api/users/` | `routes/user.rs` | [x] |
| `GET /api/users/:id` | `routes/user.rs` | [x] |
| `PATCH /api/users/profile` | `routes/user.rs` | [x] |

### Backend — repositories & services

- [x] `repositories/user.rs` + `services/user_service.rs`
- [x] `repositories/chat.rs` + `services/chat_service.rs`
- [x] `repositories/message.rs` + `services/message_service.rs`
- [x] `repositories/invoice.rs` + `services/invoice_service.rs`
- [x] `repositories/task.rs` + `services/task_service.rs`
- [x] `repositories/bid.rs` + `services/bid_service.rs`
- [x] `examples/sign_auth.rs` — dev CLI for curl auth testing
- [ ] `src/api/mod.rs` — empty legacy stub
- [ ] `src/api/user.rs` — empty legacy stub

---

## Frontend — app shell & auth

- [x] `app/layout.tsx` — root layout + wallet provider
- [x] `app/page.tsx` — landing page
- [x] `app/(app)/layout.tsx` — auth guard + app shell
- [x] `app/not-found.tsx`
- [x] `app/globals.css` — theme tokens
- [x] `context/AuthContext.tsx` — sign-in flow, session
- [x] `components/WalletContextProvider.tsx` — Phantom/Solflare, devnet
- [x] `lib/auth-storage.ts` — JWT + user in localStorage
- [x] `components/shared/layout/AuthGuard.tsx`
- [x] `components/shared/layout/AppShell.tsx`
- [x] `components/shared/layout/Sidebar.tsx`
- [x] `components/shared/layout/TopBar.tsx`
- [x] `store/ui.store.ts` — role toggle, sidebar state

---

## Frontend — pages (route → component)

- [x] `/` → `components/shared/LandingPage.tsx`
- [x] `/dashboard` → `components/dashboard/DashboardOverview.tsx`
- [x] `/marketplace` → `components/marketplace/MarketplacePageContent.tsx`
- [x] `/marketplace/[id]` → `components/marketplace/JobDetailContent.tsx`
- [x] `/applications` → `components/marketplace/ApplicationsPageContent.tsx`
- [x] `/jobs` → `components/marketplace/MyJobsPageContent.tsx`
- [x] `/jobs/new` → `components/marketplace/PostJobPageContent.tsx`
- [x] `/jobs/[id]/applicants` → `components/marketplace/ApplicantsPageContent.tsx`
- [x] `/messages` → `components/chat/MessagesWorkspace.tsx`
- [x] `/messages/[chatId]` → `components/chat/MessagesWorkspace.tsx`
- [x] `/invoices` → `components/invoices/InvoiceWorkspace.tsx`
- [x] `/invoices/[id]` → `components/invoices/InvoiceDetailContent.tsx`
- [x] `/profile` → `components/profile/ProfilePageContent.tsx`
- [x] `/settings` → `components/profile/SettingsPageContent.tsx`

---

## Frontend — services (API client)

- [x] `services/api-client.ts` — `apiFetch`, `authFetch`
- [x] `services/auth.service.ts`
- [x] `services/users.service.ts`
- [x] `services/tasks.service.ts`
- [x] `services/chats.service.ts`
- [ ] `services/invoices.service.ts` (partial — list via localStorage cache)

---

## Frontend — hooks

- [x] `hooks/useAsyncData.ts`
- [x] `hooks/useTasks.ts` / `hooks/useTask.ts`
- [ ] `hooks/useApplications.ts` (partial — scans all tasks for user's bids)
- [ ] `hooks/useMyJobs.ts` (partial — filters open tasks by wallet)
- [x] `hooks/useChats.ts`
- [ ] `hooks/useMessages.ts` (partial — no polling/WebSocket)
- [ ] `hooks/useInvoices.ts` (partial — localStorage cache)
- [ ] `hooks/useFreelancerProjects.ts` (partial — localStorage + task fetch)
- [x] `hooks/useInvoiceForm.ts`

---

## Frontend — landing

- [x] `components/landing/HeroSection.tsx`
- [x] `components/landing/TrustMatrix.tsx`
- [x] `components/landing/ProjectMockup.tsx`
- [ ] `components/landing/FeaturedJobs.tsx` (partial — static mock data)
- [ ] `components/landing/FeaturedTalent.tsx` (partial — static mock data)
- [x] `components/shared/WalletStatus.tsx`
- [x] `components/shared/WalletConnectButton.tsx`

---

## Frontend — marketplace

- [x] `components/marketplace/MarketplacePageContent.tsx`
- [x] `components/marketplace/JobDetailContent.tsx`
- [x] `components/marketplace/JobCard.tsx`
- [x] `components/marketplace/PostJobPageContent.tsx`
- [x] `components/marketplace/MyJobsPageContent.tsx`
- [x] `components/marketplace/ApplicationsPageContent.tsx`
- [x] `components/marketplace/ApplicantsPageContent.tsx`
- [x] `components/marketplace/ProposalCard.tsx`
- [x] `lib/project-cache.ts` — cache projects on apply/accept

---

## Frontend — chat

- [x] `components/chat/MessagesWorkspace.tsx`
- [x] `components/chat/ChatBubble.tsx`
- [ ] Typing indicator (future)
- [ ] File attachments (future)

---

## Frontend — invoices

- [x] `components/invoices/InvoiceWorkspace.tsx`
- [x] `components/invoices/InvoiceDetailContent.tsx`
- [x] `components/invoices/ProjectSelector.tsx`
- [x] `components/invoices/ClientInfoCard.tsx`
- [x] `components/invoices/InvoiceDetailsSection.tsx`
- [x] `components/invoices/InvoicePreviewPanel.tsx`
- [x] `components/invoices/InvoiceKanban.tsx`
- [x] `components/invoices/InvoiceRow.tsx`
- [x] `lib/invoice-storage.ts` — draft/meta localStorage
- [x] `types/invoice.ts` — extended invoice draft types
- [ ] `components/invoices/SolanaPaymentSection.tsx` (partial — UI only, no on-chain tx)
- [ ] Download invoice PDF (future)

---

## Frontend — shared UI

- [x] `components/shared/ui/Button.tsx`
- [x] `components/shared/ui/Card.tsx`
- [x] `components/shared/ui/Input.tsx`
- [x] `components/shared/ui/Textarea.tsx`
- [x] `components/shared/ui/Badge.tsx`
- [x] `components/shared/PageHeader.tsx`
- [x] `components/shared/StatCard.tsx`
- [x] `components/shared/NotificationItem.tsx`
- [x] `components/shared/states/LoadingState.tsx`
- [x] `components/shared/states/EmptyState.tsx`
- [x] `components/shared/states/ErrorState.tsx`
- [x] `lib/utils.ts`

---

## Frontend — notifications

- [ ] `store/notifications.store.ts` (partial — seeded mock data, client-side only)
- [ ] Wire notifications to real backend events
- [ ] Email notifications (future)

---

## Documentation

- [ ] `README.md` (partial — one line only)
- [x] `frontend/frontend.md` — full product spec
- [x] `COMMANDS.md` — local dev + API testing
- [ ] `docs/architecture.md` (partial — outdated, no marketplace)
- [ ] `docs/api-spec.md` (partial — missing tasks/bids/profile)
- [ ] `docs/database.md` (partial — missing tasks/bids/profile columns)

---

## Git & release

- [x] Backend committed to `main`
- [ ] Frontend rewrite committed (large uncommitted diff)
- [ ] End-to-end manual test: post job → apply → accept → chat → invoice → pay
- [ ] Solana Pay integration (next milestone per `COMMANDS.md`)

---

## Suggested next actions

1. [ ] Commit frontend workspace to `main`
2. [ ] Add `GET /api/invoices/` list endpoint
3. [ ] Add `GET /api/bids/mine` and `GET /api/tasks/mine` endpoints
4. [ ] Implement Solana Pay in `SolanaPaymentSection.tsx`
5. [ ] Replace mock dashboard activity + notification seeds with real events
6. [ ] Update `docs/` to match current API and schema
7. [ ] Expand `README.md` with setup link to `COMMANDS.md`
