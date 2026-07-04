-- Mart36 tenant billing / subscription setup
-- Stores tenant plan, billing method, and disbursement eligibility.

CREATE TABLE IF NOT EXISTS `tenant_billing_methods` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tenant_id`          BIGINT UNSIGNED NOT NULL,
    `provider`           VARCHAR(40)     NOT NULL COMMENT 'payos|momo|bank|manual',
    `provider_ref`       VARCHAR(190)    NULL COMMENT 'External payment method or account reference',
    `status`             VARCHAR(30)     NOT NULL DEFAULT 'pending' COMMENT 'pending|verified|failed|disabled',
    `is_default`         TINYINT(1)      NOT NULL DEFAULT 0,
    `last_verified_at`   DATETIME        NULL,
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ux_tenant_billing_provider_ref` (`provider`, `provider_ref`),
    KEY `ix_tenant_billing_methods_tenant_id` (`tenant_id`),
    KEY `ix_tenant_billing_methods_status` (`status`),
    CONSTRAINT `fk_tenant_billing_methods_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `tenants`
    ADD COLUMN IF NOT EXISTS `billing_status` VARCHAR(30) NOT NULL DEFAULT 'unconfigured' COMMENT 'unconfigured|pending|active|suspended',
    ADD COLUMN IF NOT EXISTS `disbursement_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `disbursement_method_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'FK to tenant_billing_methods.id when enabled';
