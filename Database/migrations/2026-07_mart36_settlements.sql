-- Mart36 settlement records
-- Created: 2026-07-03
-- Stores one settlement row per completed payment so tenant disbursement is idempotent.

CREATE TABLE IF NOT EXISTS `mart36_settlements` (
    `id`                  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `payment_intent_id`   VARCHAR(255)     NOT NULL COMMENT 'Unique payment completion reference',
    `tenant_id`           INT UNSIGNED     NOT NULL DEFAULT 1 COMMENT 'Tenant receiving settlement',
    `subtotal_amount`     DECIMAL(10,2)    NOT NULL DEFAULT '0.00',
    `discount_amount`     DECIMAL(10,2)    NOT NULL DEFAULT '0.00',
    `disbursement_amount` DECIMAL(10,2)    NOT NULL DEFAULT '0.00',
    `fee_breakdown`       JSON             NULL COMMENT 'Fixed/payment/service/marketing/tax breakdown',
    `payment_status`      VARCHAR(30)      NOT NULL DEFAULT 'paid' COMMENT 'Payment completion state at settlement time',
    `settled_at`          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ux_mart36_settlements_payment_intent_id` (`payment_intent_id`),
    KEY `ix_mart36_settlements_tenant_id` (`tenant_id`),
    KEY `ix_mart36_settlements_settled_at` (`settled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
