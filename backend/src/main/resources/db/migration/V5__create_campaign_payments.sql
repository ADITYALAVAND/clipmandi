CREATE TABLE campaign_payments (
    id UUID PRIMARY KEY,

    campaign_id UUID NOT NULL,
    creator_id UUID NOT NULL,

    amount_paise BIGINT NOT NULL,

    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,

    status VARCHAR(30) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,

    CONSTRAINT fk_campaign_payment_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES campaigns(id),

    CONSTRAINT chk_campaign_payment_amount
        CHECK (amount_paise > 0)
);

CREATE INDEX idx_campaign_payments_campaign_id
    ON campaign_payments(campaign_id);

CREATE INDEX idx_campaign_payments_creator_id
    ON campaign_payments(creator_id);