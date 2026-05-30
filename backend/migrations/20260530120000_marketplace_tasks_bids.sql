-- User profile fields for Web3 freelancer identity
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS skills TEXT[],
    ADD COLUMN IF NOT EXISTS avatar_cid TEXT;

-- Link marketplace chats to client/freelancer wallet pair
ALTER TABLE chats
    ADD COLUMN IF NOT EXISTS client_wallet TEXT,
    ADD COLUMN IF NOT EXISTS freelancer_wallet TEXT;

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_wallet TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(18, 6) NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tasks_status_check CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT tasks_budget_positive CHECK (budget > 0)
);

CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_client_wallet ON tasks (client_wallet);

CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    freelancer_wallet TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_amount NUMERIC(18, 6) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bids_status_check CHECK (status IN ('pending', 'accepted', 'rejected')),
    CONSTRAINT bids_amount_positive CHECK (proposed_amount > 0),
    CONSTRAINT bids_unique_freelancer_per_task UNIQUE (task_id, freelancer_wallet)
);

CREATE INDEX idx_bids_task_id ON bids (task_id);
CREATE INDEX idx_bids_freelancer_wallet ON bids (freelancer_wallet);
