-- V4__create_wallets.sql
-- Creates wallets and wallet transaction history.

CREATE TYPE wallet_transaction_type AS ENUM (
    'EARNING',
    'WITHDRAWAL',
    'ADJUSTMENT'
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE REFERENCES users(id),

    balance_paise BIGINT NOT NULL DEFAULT 0
        CHECK (balance_paise >= 0),

    total_earned_paise BIGINT NOT NULL DEFAULT 0
        CHECK (total_earned_paise >= 0),

    total_withdrawn_paise BIGINT NOT NULL DEFAULT 0
        CHECK (total_withdrawn_paise >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_user
    ON wallets(user_id);


CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    wallet_id UUID NOT NULL REFERENCES wallets(id),

    clip_id UUID REFERENCES clips(id),

    type wallet_transaction_type NOT NULL,

    amount_paise BIGINT NOT NULL
        CHECK (amount_paise != 0),

    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_transactions_wallet
    ON wallet_transactions(wallet_id);

CREATE INDEX idx_wallet_transactions_clip
    ON wallet_transactions(clip_id);

CREATE INDEX idx_wallet_transactions_created
    ON wallet_transactions(created_at);