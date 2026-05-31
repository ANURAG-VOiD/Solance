# API Specification

Base URL (local): `http://localhost:8080`

All endpoints are prefixed with `/api`. Protected routes require an
`Authorization: Bearer <jwt>` header (issued by `POST /api/auth/verify`).

## Conventions

- **Auth:** wallet-based. Request a nonce, sign it with the Solana wallet, then
  exchange the signature for a JWT (7-day TTL).
- **Errors:** every route returns a JSON body `{ "error": "<message>" }` with an
  appropriate HTTP status code (e.g. `400`, `401`, `403`, `404`, `409`, `500`).
- **IDs:** UUID v4. **Amounts:** decimal strings (`NUMERIC(18,6)`).

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health/` | — | Liveness probe |

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/request-nonce` | — | Body `{ wallet_address }` → `{ message, expires_at }` |
| POST | `/api/auth/verify` | — | Body `{ wallet_address, signature, message }` → `{ token, user }` |
| GET | `/api/auth/me` | ✓ | Current authenticated user |

## Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/` | — | Body `{ wallet_address }` → created user |
| GET | `/api/users/talent` | — | Freelancers with completed profiles (landing-page discovery) |
| GET | `/api/users/by-wallet/:wallet` | — | Resolve a user by wallet address (404 if no profile) |
| GET | `/api/users/:id` | — | Fetch user by id |
| PATCH | `/api/users/profile` | ✓ | Body `{ title?, bio?, skills?, avatar_cid? }` |

## Tasks (jobs) & Bids

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tasks/` | — | Open tasks |
| GET | `/api/tasks/:id` | — | Task detail |
| POST | `/api/tasks/` | ✓ | Body `{ title, description, budget }` |
| GET | `/api/tasks/mine` | ✓ | Tasks posted by the caller |
| POST | `/api/tasks/:id/bids` | ✓ | Body `{ cover_letter, proposed_amount }` |
| GET | `/api/tasks/:id/bids` | ✓ | Applicants for a task (owner only) |
| GET | `/api/bids/mine` | ✓ | The caller's submitted bids (with task) |
| PATCH | `/api/bids/:id/accept` | ✓ | Accept a bid → `{ bid, task, chat }` |

## Chats & Messages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/chats/` | ✓ | Create chat channel |
| GET | `/api/chats/` | ✓ | List chats |
| POST | `/api/messages/` | ✓ | Body `{ chat_id, content }` |
| GET | `/api/messages/:chat_id` | ✓ | List messages in a chat |

> The frontend polls `GET /api/messages/:chat_id` every few seconds while a chat
> is open to surface the other party's messages in near real time.

## Invoices

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/invoices/` | ✓ | Body `{ receiver_wallet, amount }` |
| GET | `/api/invoices/` | ✓ | List invoices for the caller's wallet |
| GET | `/api/invoices/:id` | ✓ | Invoice detail |
| PATCH | `/api/invoices/:id` | ✓ | Body `{ status }` (e.g. `"paid"`) |

> On-chain settlement: the client pays the freelancer's wallet directly with a
> native SOL transfer (Devnet) from the browser. After the transaction confirms,
> the frontend calls `PATCH /api/invoices/:id` with `{ status: "paid" }`.

## Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/stats` | ✓ | Role-based aggregate stats |

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications/` | ✓ | Latest notifications (most recent first) |
| PATCH | `/api/notifications/:id/read` | ✓ | Mark one read |
| PATCH | `/api/notifications/read-all` | ✓ | Mark all read → `{ updated }` |

## Realtime (WebSocket)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ws/notifications?token=<jwt>` | ✓ (query) | Live notification stream |

The JWT is passed as a `token` **query parameter** because browsers cannot set
an `Authorization` header on a WebSocket handshake. Each frame is a JSON
envelope:

```json
{
  "event": "notification.created",
  "wallet": "<recipient_wallet>",
  "payload": { "id": "...", "notification_type": "message", "title": "...", "body": "...", "href": "...", "read": false, "created_at": "..." }
}
```

Notification types emitted today: `application`, `proposal_accepted`,
`invoice_created`, `invoice_paid`, `message`.
