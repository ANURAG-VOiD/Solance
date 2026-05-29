CREATE TABLE users (
    id UUID PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chats (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES chats(id),
    sender_wallet TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    sender_wallet TEXT NOT NULL,
    receiver_wallet TEXT NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);