-- V2__create_clips.sql
-- Adds clip submissions for the Clipper -> Creator campaign workflow.

CREATE TYPE clip_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    clipper_id UUID NOT NULL REFERENCES users(id),

    platform VARCHAR(30) NOT NULL,
    content_url VARCHAR(2048) NOT NULL,

    status clip_status NOT NULL DEFAULT 'PENDING',

    views BIGINT NOT NULL DEFAULT 0
        CHECK (views >= 0),

    earnings_paise BIGINT NOT NULL DEFAULT 0
        CHECK (earnings_paise >= 0),

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_clips_campaign
    ON clips(campaign_id);

CREATE INDEX idx_clips_clipper
    ON clips(clipper_id);

CREATE INDEX idx_clips_status
    ON clips(status);