-- V1__init_schema.sql
-- Initial schema: users + auth + campaigns.
-- Clips/wallet/payments tables land in a later migration once those
-- modules are wired up — see backend README for the sequencing plan.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- provides gen_random_uuid()

CREATE TYPE user_role AS ENUM ('CREATOR', 'CLIPPER', 'ADMIN');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    role            user_role NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

CREATE TABLE creator_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id),
    company_name        VARCHAR(150),
    website_url         TEXT,
    total_campaigns      INT NOT NULL DEFAULT 0,
    total_spent_paise    BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clipper_profiles (
    user_id                 UUID PRIMARY KEY REFERENCES users(id),
    bio                     TEXT,
    portfolio_url            TEXT,
    upi_id                    VARCHAR(100),
    total_clips_submitted     INT NOT NULL DEFAULT 0,
    total_earned_paise        BIGINT NOT NULL DEFAULT 0,
    trust_level               SMALLINT NOT NULL DEFAULT 1,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TYPE campaign_status AS ENUM ('DRAFT', 'PENDING_FUNDING', 'LIVE', 'BUDGET_SPENT', 'PAUSED', 'CLOSED');

CREATE TABLE campaigns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id          UUID NOT NULL REFERENCES users(id),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    category            VARCHAR(50),
    cpm_paise           BIGINT NOT NULL CHECK (cpm_paise > 0),
    budget_total_paise  BIGINT NOT NULL CHECK (budget_total_paise > 0),
    budget_spent_paise  BIGINT NOT NULL DEFAULT 0 CHECK (budget_spent_paise >= 0),
    allowed_platforms   TEXT[] NOT NULL,
    status              campaign_status NOT NULL DEFAULT 'DRAFT',
    rules               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT chk_budget_not_exceeded CHECK (budget_spent_paise <= budget_total_paise)
);
CREATE INDEX idx_campaigns_creator ON campaigns(creator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
