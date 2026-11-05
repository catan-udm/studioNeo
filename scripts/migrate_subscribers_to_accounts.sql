-- ========================================================================
-- Database Migration Script: subscribers -> accounts Refactor
-- Target Database: experimental_studio_db (Azure Database for MySQL Flexible Server)
-- Option A: Cryptographic Identity, Content Rights & Roles Standardization
-- ========================================================================
-- Summary of Operations:
-- 1. Rename table `subscribers` to `accounts`.
-- 2. Standardize column `tier` to `role` with default 'user'.
-- 3. Purge legacy plans and map them to 'user'.
-- 4. Purge Stripe columns (`stripe_customer_id`, `stripe_subscription_id`).
-- 5. Rename column `subscriber_id` to `account_id` across child tables:
--    `auth_magic_tokens`, `totp_credentials`, `totp_backup_codes`,
--    `perk_unlocks`, `webauthn_credentials`, `subscriber_oauth_accounts`, `cels`.
-- 6. Update all foreign keys and index constraints.
-- 7. Create backward-compatible view `subscribers`.
-- ========================================================================

USE `experimental_studio_db`;

-- Step 1: Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Rename primary table `subscribers` to `accounts`
RENAME TABLE `subscribers` TO `accounts`;

-- Step 3: Refactor columns and indexes in `accounts`
ALTER TABLE `accounts`
  CHANGE COLUMN `tier` `role` VARCHAR(32) NOT NULL DEFAULT 'user',
  DROP INDEX `idx_subscribers_email`,
  DROP INDEX `idx_subscribers_is_verified`,
  DROP INDEX `idx_subscribers_tier`,
  ADD UNIQUE KEY `idx_accounts_email` (`email`),
  ADD KEY `idx_accounts_is_verified` (`is_verified`),
  ADD KEY `idx_accounts_role` (`role`),
  DROP COLUMN `stripe_customer_id`,
  DROP COLUMN `stripe_subscription_id`;

-- Step 4: Normalize existing legacy roles to standard Option A roles
UPDATE `accounts`
SET `role` = 'user'
WHERE `role` IN ('free', 'collector', 'studio', 'studio-alpha', 'studio-atelier', 'enterprise');

UPDATE `accounts`
SET `role` = 'featured'
WHERE `role` = 'artist_resident';

UPDATE `accounts`
SET `role` = 'artist'
WHERE `role` IN ('illustrator_pro', 'illustrator');

-- Step 5: Migrate child table `auth_magic_tokens`
ALTER TABLE `auth_magic_tokens`
  DROP FOREIGN KEY `fk_magic_tokens_subscriber`,
  DROP INDEX `idx_magic_tokens_subscriber_active`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NOT NULL,
  ADD KEY `idx_magic_tokens_account_active` (`account_id`, `consumed_at`, `expires_at`),
  ADD CONSTRAINT `fk_magic_tokens_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Migrate child table `totp_credentials`
ALTER TABLE `totp_credentials`
  DROP FOREIGN KEY `fk_totp_credentials_subscriber`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NOT NULL,
  ADD CONSTRAINT `fk_totp_credentials_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Migrate child table `totp_backup_codes`
ALTER TABLE `totp_backup_codes`
  DROP FOREIGN KEY `fk_totp_backup_codes_subscriber`,
  DROP INDEX `idx_backup_codes_subscriber_unused`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NOT NULL,
  ADD KEY `idx_backup_codes_account_unused` (`account_id`, `is_used`),
  ADD CONSTRAINT `fk_totp_backup_codes_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Migrate child table `perk_unlocks`
ALTER TABLE `perk_unlocks`
  DROP FOREIGN KEY `fk_perk_unlocks_subscriber`,
  DROP INDEX `idx_unlock_subscriber_perk`,
  DROP INDEX `idx_unlock_subscriber`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NOT NULL,
  ADD UNIQUE KEY `idx_unlock_account_perk` (`account_id`, `perk_id`),
  ADD KEY `idx_unlock_account` (`account_id`),
  ADD CONSTRAINT `fk_perk_unlocks_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Migrate child table `webauthn_credentials`
ALTER TABLE `webauthn_credentials`
  DROP FOREIGN KEY `fk_webauthn_subscriber`,
  DROP INDEX `idx_webauthn_subscriber`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NOT NULL,
  ADD KEY `idx_webauthn_account` (`account_id`),
  ADD CONSTRAINT `fk_webauthn_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Migrate child table `subscriber_oauth_accounts`
ALTER TABLE `subscriber_oauth_accounts`
  DROP FOREIGN KEY `fk_oauth_subscriber`,
  DROP INDEX `idx_oauth_subscriber`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NOT NULL,
  ADD KEY `idx_oauth_account` (`account_id`),
  ADD CONSTRAINT `fk_oauth_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 11: Migrate child table `cels`
ALTER TABLE `cels`
  DROP FOREIGN KEY `fk_cels_subscriber`,
  DROP INDEX `idx_cels_subscriber`,
  CHANGE COLUMN `subscriber_id` `account_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  ADD KEY `idx_cels_account` (`account_id`),
  ADD CONSTRAINT `fk_cels_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 12: Create backwards-compatibility view `subscribers`
-- Enables legacy SELECT queries targeting `subscribers` and `tier` to continue working transparently
CREATE OR REPLACE VIEW `subscribers` AS
  SELECT
    `id`,
    `email`,
    `is_verified`,
    `role` AS `tier`,
    `role`,
    `subscription_status`,
    `created_at`,
    `updated_at`
  FROM `accounts`;

-- Step 13: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 14: Verification queries
SHOW TABLES;
DESCRIBE `accounts`;
