# Solance Development Commands

Reference for running the Solance monorepo locally during Phase 13 (wallet auth). Each command lists **where to run it**.

---

## Prerequisites

Install these before starting:

| Tool | Purpose | Verify |
|------|---------|--------|
| **Docker** | Postgres via docker compose | `docker --version` |
| **Rust** (stable) | Backend API | `rustc --version` / `cargo --version` |
| **Node.js** (18+) | Next.js frontend | `node --version` / `npm --version` |

Optional: **Solana wallet browser extension** (Phantom or Solflare) for UI testing.

---

## Port Map

| Service | Port | URL |
|---------|------|-----|
| **Frontend** (Next.js) | **3000** | http://localhost:3000 |
| **Backend** (Axum) | **8080** | http://localhost:8080 |
| **Postgres** | **5432** | `localhost:5432` |

> **Important:** API calls must target **8080**, not 3000. Hitting auth routes on port 3000 returns Next.js HTML 404 pages, not JSON.

---

## Infrastructure (Postgres)

**Where:** `infrastructure/` folder (from repo root: `cd infrastructure`)

### Start Postgres

```bash
docker compose up -d
```

### Stop Postgres

```bash
docker compose down
```

### Stop and remove data volume

```bash
docker compose down -v
```

### Check container status

```bash
docker compose ps
```

Default credentials (from `docker-compose.yml`):

- User: `solance`
- Password: `solance`
- Database: `solance`
- URL: `postgres://solance:solance@localhost:5432/solance`

---

## Backend

**Where:** `backend/` folder (from repo root: `cd backend`)

### Environment setup

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

Required variables in `backend/.env`:

```env
PORT=8080
DATABASE_URL=postgres://solance:solance@localhost:5432/solance
JWT_SECRET=dev-secret-change-in-production
RUST_LOG=info
```

| Variable | Description |
|----------|-------------|
| `PORT` | Backend listen port — use **8080** (not 3000) |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret for signing session JWTs after wallet verify |
| `RUST_LOG` | Log level (optional) |

### Run database migrations

**Where:** `backend/` (Postgres must be running)

```bash
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run
```

### Run the server

**Where:** `backend/`

```bash
cargo run
```

Expected output: `Solance backend running on http://0.0.0.0:8080`

### Run tests

**Where:** `backend/`

```bash
cargo test
```

### Type-check without running

**Where:** `backend/`

```bash
cargo check
```

### Health check

**Where:** any terminal

```bash
curl http://localhost:8080/api/health/
```

Expected: `System is healthy`

---

## Frontend

**Where:** `frontend/` folder (from repo root: `cd frontend`)

### Install dependencies (first time or after package changes)

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

App runs at **http://localhost:3000**.

### Hard refresh after code changes

If wallet UI or styles look stale, hard refresh the browser:

- **macOS:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

Or open DevTools → Network → enable **Disable cache**, then reload.

### Other scripts

```bash
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

---

## Auth API Testing (curl)

All auth endpoints live on the **backend** at `http://localhost:8080/api/auth/...`.

### Step 1 — Request nonce

**Where:** any terminal (backend must be running on 8080)

```bash
curl -s -X POST http://localhost:8080/api/auth/request-nonce \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"7YLw3qnPNM5uomPqiA2GUydD2dDDHHVfhssNzKZpkadb"}'
```

**Expected response shape:**

```json
{
  "message": "Sign in to Solance\nNonce: <uuid>\nTimestamp: <RFC3339>",
  "expires_at": "2026-05-30T12:00:00Z"
}
```

Save the `message` value — the wallet must sign this exact string.

### Step 2 — Verify signature (after signing with wallet)

**Where:** any terminal

Replace `<BASE58_SIGNATURE>` with the signature from your wallet (Phantom/Solflare sign message flow):

```bash
curl -s -X POST http://localhost:8080/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "7YLw3qnPNM5uomPqiA2GUydD2dDDHHVfhssNzKZpkadb",
    "signature": "<BASE58_SIGNATURE>",
    "message": "<EXACT_MESSAGE_FROM_STEP_1>"
  }'
```

**Expected response shape:**

```json
{
  "token": "<JWT>",
  "user": {
    "id": "<uuid>",
    "wallet_address": "7YLw3qnPNM5uomPqiA2GUydD2dDDHHVfhssNzKZpkadb",
    "created_at": "2026-05-30T12:00:00Z"
  }
}
```

### Common errors

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| HTML 404 page | Request sent to **:3000** instead of **:8080** | Use `http://localhost:8080/api/auth/...` |
| `curl: (7) Failed to connect` / connection refused | Backend not running | `cd backend && cargo run` |
| HTTP 400 | Invalid wallet address in JSON body | Use a valid base58 Solana pubkey (32 bytes) |
| HTTP 401 on `/verify` | Expired/missing nonce, wrong message, or bad signature | Call `/request-nonce` again; sign the exact `message`; retry within 5 minutes |
| HTTP 500 | Postgres down or migration not applied | Start docker compose; run `sqlx migrate run` |

### Wrong port example (do not do this)

```bash
# Returns Next.js HTML 404 — NOT the API
curl http://localhost:3000/api/auth/request-nonce
```

---

## Wallet UI (Browser)

**Where:** browser at http://localhost:3000 (frontend dev server must be running)

1. Open the app and click **Select Wallet**.
2. Choose **Phantom** or **Solflare** (browser extension required).
3. Approve the connection in the extension popup.

### WalletNotReadyError / SSR hydration issues

The wallet adapter must only run in the browser:

- `WalletContextProvider` delays `autoConnect` until after client mount (waits for `window.phantom` injection).
- `WalletConnectButton` uses Next.js `dynamic(..., { ssr: false })` for `WalletMultiButton` to avoid SSR crashes.

If you still see wallet errors on first load, hard refresh once the page has fully mounted.

---

## Troubleshooting

### Postgres not running

```bash
cd infrastructure
docker compose up -d
docker compose ps   # should show solance-postgres healthy/running
```

Backend startup fails with database connection errors → confirm `DATABASE_URL` matches docker compose credentials.

### Backend not running

```bash
cd backend
cargo run
```

Verify: `curl http://localhost:8080/api/health/`

### Port conflicts

**Port 8080 in use (backend):**

```bash
lsof -i :8080
# kill the process or set PORT to another value in backend/.env
```

**Port 3000 in use (frontend):**

```bash
lsof -i :3000
# or start Next.js on another port:
npm run dev -- -p 3001
```

**Port 5432 in use (Postgres):**

Another Postgres instance may be bound to 5432. Stop it or change the host port mapping in `infrastructure/docker-compose.yml`.

### JWT_SECRET missing

Backend panics at startup with `JWT_SECRET must be set`. Add it to `backend/.env` (see Backend → Environment setup).

---

## Typical dev session (quick start)

**Terminal 1 — Postgres**

```bash
cd infrastructure && docker compose up -d
```

**Terminal 2 — Backend**

```bash
cd backend
cp .env.example .env   # first time only
sqlx migrate run       # first time only
cargo run
```

**Terminal 3 — Frontend**

```bash
cd frontend
npm install            # first time only
npm run dev
```

Then open http://localhost:3000 and test API calls against http://localhost:8080.

---

## Phase 13 Steps 7–9 (Complete)

### Step 7 — Protected routes & CORS

- **CORS** allows `FRONTEND_URL` (default `http://localhost:3000`) on the backend.
- **Protected route:** `GET /api/auth/me` requires `Authorization: Bearer <JWT>`.

**Where:** any terminal (backend running on 8080)

```bash
# Without token — expect 401
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/auth/me

# With token — expect 200 and user JSON
curl -s http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <JWT_FROM_VERIFY>"
```

### Step 8 — Frontend sign-in flow

**Where:** browser at http://localhost:3000

1. Connect wallet (Phantom/Solflare).
2. Click **Sign in with wallet**.
3. Approve the sign-message prompt in your extension.
4. UI shows **Signed in** with user ID and active JWT session.

**Frontend env** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Step 9 — End-to-end verification checklist

| Test | Expected |
|------|----------|
| Connect wallet on frontend | Address shown |
| Sign in with wallet | Green "Signed in" card, JWT stored |
| `GET /api/auth/me` with JWT | 200 + user JSON |
| `GET /api/auth/me` without JWT | 401 |
| Verify with bad signature | 401 |
| Verify with wrong message | 400 |
| Request nonce on port 3000 | HTML 404 (wrong server) |

**Automated backend tests:**

```bash
cd backend && cargo test
```

---

## Phase 14 — Chats API (JWT-protected)

All chat routes require `Authorization: Bearer <JWT>` from the wallet sign-in flow.

### Create a chat

**Where:** any terminal (backend on 8080, valid JWT required)

```bash
curl -s -X POST http://localhost:8080/api/chats/ \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json"
```

**Expected (201):**

```json
{
  "id": "<uuid>",
  "created_at": "2026-05-30T12:00:00Z"
}
```

### List chats

```bash
curl -s http://localhost:8080/api/chats/ \
  -H "Authorization: Bearer <JWT>"
```

**Expected (200):** array of chat objects, newest first.

### Without JWT

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/chats/
```

**Expected:** `401`

---

## Phase 15 — Messages API (JWT-protected)

Sender wallet is taken from the JWT — do not send it in the request body.

### Send a message

**Where:** any terminal (backend on 8080, valid JWT required)

```bash
curl -s -X POST http://localhost:8080/api/messages/ \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"<CHAT_UUID>","content":"Hello from Solance!"}'
```

**Expected (201):**

```json
{
  "id": "<uuid>",
  "chat_id": "<uuid>",
  "sender_wallet": "<your-wallet>",
  "content": "Hello from Solance!",
  "created_at": "2026-05-30T12:00:00Z"
}
```

### List messages for a chat

```bash
curl -s http://localhost:8080/api/messages/<CHAT_UUID> \
  -H "Authorization: Bearer <JWT>"
```

**Expected (200):** array of messages, oldest first.

### Error cases

| Request | Expected |
|---------|----------|
| Missing JWT | `401` |
| Unknown `chat_id` | `404` |
| Empty `content` | `400` |

---

## Phase 16 — Invoices API (JWT-protected)

`sender_wallet` is taken from the JWT. Amount uses decimal SOL (matches DB `NUMERIC(18,6)`).

Valid statuses: `pending`, `paid`, `cancelled`

### Create an invoice

```bash
curl -s -X POST http://localhost:8080/api/invoices/ \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver_wallet": "7YLw3qnPNM5uomPqiA2GUydD2dDDHHVfhssNzKZpkadb",
    "amount": "150.50"
  }'
```

**Expected (201):** invoice with `status: "pending"`

### Get an invoice (sender or receiver only)

```bash
curl -s http://localhost:8080/api/invoices/<INVOICE_UUID> \
  -H "Authorization: Bearer <JWT>"
```

### Update invoice status (sender or receiver only)

```bash
curl -s -X PATCH http://localhost:8080/api/invoices/<INVOICE_UUID> \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"status":"paid"}'
```

### Error cases

| Request | Expected |
|---------|----------|
| Missing JWT | `401` |
| Unknown invoice | `404` |
| Not sender/receiver | `403` |
| Invalid amount / wallet | `400` |

---

## Backend API summary (MVP complete)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health/` | No | Health check |
| POST | `/api/auth/request-nonce` | No | Wallet sign-in challenge |
| POST | `/api/auth/verify` | No | Verify signature, get JWT |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/users/` | No | Create user (legacy) |
| GET | `/api/users/:id` | No | Get user by ID |
| POST | `/api/chats/` | JWT | Create chat |
| GET | `/api/chats/` | JWT | List chats |
| POST | `/api/messages/` | JWT | Send message |
| GET | `/api/messages/:chat_id` | JWT | List messages |
| POST | `/api/invoices/` | JWT | Create invoice |
| GET | `/api/invoices/:id` | JWT | Get invoice |
| PATCH | `/api/invoices/:id` | JWT | Update invoice status |

**Next:** Solana Pay integration for on-chain invoice settlement.

---

## Phase 17 — Frontend Workspace

**Where:** browser at http://localhost:3000

### Flow

1. **Home** (`/`) — connect wallet → **Sign in with wallet**
2. **Workspace** (`/dashboard`) — chats, messages, invoices
3. Header shows **Workspace** link when signed in

### Prerequisites

- Backend running on **8080**
- Frontend running on **3000**
- `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8080`

### Workspace features

| Panel | Actions |
|-------|---------|
| **Chats** | Create chat, select chat |
| **Messages** | View thread, send message |
| **Invoices** | Create invoice, mark as paid |
