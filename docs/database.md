# Database Design

PostgreSQL 16. Schema is managed by SQLx migrations in
`backend/migrations/` and applied automatically on backend startup.

Migrations:
1. `20260529200208_init_schema.sql` — users, chats, messages, invoices
2. `20260530120000_marketplace_tasks_bids.sql` — profile fields, tasks, bids, chat wallet links
3. `20260531000500_notifications.sql` — notifications table + indexes

---

## users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| wallet_address | TEXT | NOT NULL, UNIQUE |
| title | TEXT | profile (added in migration 2) |
| bio | TEXT | profile |
| skills | TEXT[] | profile |
| avatar_cid | TEXT | IPFS/Arweave content id |
| created_at | TIMESTAMPTZ | default NOW() |

## chats

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| client_wallet | TEXT | nullable (added in migration 2) |
| freelancer_wallet | TEXT | nullable (added in migration 2) |
| created_at | TIMESTAMPTZ | default NOW() |

## messages

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| chat_id | UUID | FK → chats(id) |
| sender_wallet | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | default NOW() |

## invoices

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| sender_wallet | TEXT | NOT NULL (freelancer) |
| receiver_wallet | TEXT | NOT NULL (client) |
| amount | NUMERIC(18,6) | NOT NULL |
| status | TEXT | `draft` / `pending` / `paid` / `rejected` / `cancelled` |
| created_at | TIMESTAMPTZ | default NOW() |

## tasks

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| client_wallet | TEXT | NOT NULL |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| budget | NUMERIC(18,6) | CHECK > 0 |
| status | TEXT | CHECK in (`open`,`in_progress`,`completed`,`cancelled`), default `open` |
| created_at | TIMESTAMPTZ | default NOW() |

Indexes: `idx_tasks_status`, `idx_tasks_client_wallet`.

## bids

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| task_id | UUID | FK → tasks(id) ON DELETE CASCADE |
| freelancer_wallet | TEXT | NOT NULL |
| cover_letter | TEXT | NOT NULL |
| proposed_amount | NUMERIC(18,6) | CHECK > 0 |
| status | TEXT | CHECK in (`pending`,`accepted`,`rejected`), default `pending` |
| created_at | TIMESTAMPTZ | default NOW() |

Constraints: `UNIQUE (task_id, freelancer_wallet)` — one bid per freelancer per task.
Indexes: `idx_bids_task_id`, `idx_bids_freelancer_wallet`.

## notifications

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| user_wallet | TEXT | NOT NULL (recipient) |
| notification_type | TEXT | `application`, `proposal_accepted`, `invoice_created`, `invoice_paid`, `message` |
| title | TEXT | NOT NULL |
| body | TEXT | NOT NULL |
| href | TEXT | in-app deep link |
| read | BOOLEAN | default FALSE |
| created_at | TIMESTAMPTZ | default NOW() |

Indexes: `idx_notifications_user_wallet_created_at`, `idx_notifications_user_wallet_read`.
