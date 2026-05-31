# Solance Architecture

## Overview

Solance is a wallet-native freelancer marketplace and collaboration platform
built on Solana. It pairs a Rust/Axum API with a Next.js frontend and settles
payments directly between wallets — no custodial intermediary.

Core capabilities:

- Connect a Solana wallet and authenticate by signing a nonce (JWT session)
- Post jobs (tasks), browse the marketplace, and submit bids/proposals
- Accept a bid, which spins up a dedicated chat channel for the pair
- Chat in near real time (REST + lightweight polling)
- Generate invoices and settle them with an on-chain SOL transfer (Devnet)
- Receive live notifications over a WebSocket

## Tech Stack

### Frontend
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Zustand (UI state), Motion (animations)
- Solana Wallet Adapter (Phantom, Solflare) + `@solana/web3.js`

### Backend
- Rust + Axum 0.8 (HTTP + WebSocket)
- SQLx (PostgreSQL, compile-time-checked queries, auto migrations)
- JWT (`jsonwebtoken`) + Ed25519 signature verification (`ed25519-dalek`, `bs58`)

### Database
- PostgreSQL 16 (see `docs/database.md`)

### Blockchain
- Solana Devnet
- Solana Wallet Adapter for signing
- Native SOL transfers for invoice settlement

## Backend layering

```
routes/        HTTP + WebSocket handlers (return JSON `{ error }` on failure)
  └─ services/   business logic + typed error enums
       └─ repositories/  SQLx data access
auth/          JWT issue/validate, Ed25519 verify, nonce store, middleware
state.rs       AppState: db pool, nonce store, jwt secret, realtime hub
```

### Realtime hub

`services/realtime_service.rs` holds a `tokio::sync::broadcast` channel.
When a notification is persisted, the service publishes a `WsEvent` to the hub;
the `/api/ws/notifications` socket filters events by recipient wallet and
streams them to the connected client. The WebSocket authenticates via a `token`
query parameter (browsers cannot set headers on the WS handshake).

### Error handling

All routes return a uniform `{ "error": "<message>" }` body via
`error::api_error`, including the `require_auth` middleware and the `AuthUser`
extractor. Clients parse this in `services/api-client.ts`.

## Frontend data layer

- `services/api-client.ts` — `apiFetch` / `authFetch` wrappers + `{ error }` parsing
- `hooks/useAsyncData` — shared fetch/loading/error pattern
- `hooks/useReconnectingWebSocket` — auto-reconnecting authenticated socket
- `hooks/useNotifications` — REST snapshot + live WebSocket merge
- `hooks/useMessages` — REST + visibility-aware polling for near-real-time chat
- `lib/solana-pay.ts` — builds, sends and confirms SOL transfers

## End-to-end flow

```
Connect wallet → sign nonce → JWT session
        ↓
Client posts a job (task)
        ↓
Freelancer submits a bid  ── notification ─▶ client
        ↓
Client accepts bid → chat channel created  ── notification ─▶ freelancer
        ↓
Both parties chat (polling keeps it live)
        ↓
Freelancer issues an invoice  ── notification ─▶ client
        ↓
Client pays on-chain (SOL transfer, Devnet)
        ↓
Frontend marks invoice paid  ── notification ─▶ freelancer
```
