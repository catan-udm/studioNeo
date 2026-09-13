-- ========================================================================
-- Database Schema for experimental_studio_db
-- Target: Azure Database for MySQL Flexible Server
-- Character Set: utf8mb4 (Recommended for international email & full Unicode)
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `experimental_studio_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `experimental_studio_db`;

-- 1. Subscribers Table
CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_subscribers_email` (`email`),
  KEY `idx_subscribers_is_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Auth Magic Tokens (Passwordless Email OTPs)
CREATE TABLE IF NOT EXISTS `auth_magic_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL, -- SHA-256 digest (64 hex characters)
  `expires_at` TIMESTAMP NOT NULL,
  `consumed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_magic_tokens_subscriber_active` (`subscriber_id`, `consumed_at`, `expires_at`),
  KEY `idx_magic_tokens_hash` (`token_hash`),
  CONSTRAINT `fk_magic_tokens_subscriber`
    FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TOTP Credentials (RFC 6238 Second Factor)
CREATE TABLE IF NOT EXISTS `totp_credentials` (
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `totp_secret` VARCHAR(128) NOT NULL, -- Base32-encoded secret
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`subscriber_id`),
  CONSTRAINT `fk_totp_credentials_subscriber`
    FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TOTP Backup Codes (One-time fallback codes)
CREATE TABLE IF NOT EXISTS `totp_backup_codes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `code_hash` VARCHAR(64) NOT NULL, -- SHA-256 digest of 8-character backup code
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backup_codes_subscriber_unused` (`subscriber_id`, `is_used`),
  CONSTRAINT `fk_totp_backup_codes_subscriber`
    FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Perks / Digital Assets
CREATE TABLE IF NOT EXISTS `perks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `storage_file_path` VARCHAR(512) NOT NULL, -- Azure Blob Storage blob name/path
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_perks_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Perk Unlocks (Subscriber Asset Authorizations)
CREATE TABLE IF NOT EXISTS `perk_unlocks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `perk_id` BIGINT UNSIGNED NOT NULL,
  `unlocked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unlock_subscriber_perk` (`subscriber_id`, `perk_id`),
  KEY `idx_unlock_subscriber` (`subscriber_id`),
  KEY `idx_unlock_perk` (`perk_id`),
  CONSTRAINT `fk_perk_unlocks_subscriber`
    FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_perk_unlocks_perk`
    FOREIGN KEY (`perk_id`) REFERENCES `perks` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- Seed Data for Testing & Verification
-- ========================================================================
INSERT INTO `perks` (`slug`, `title`, `description`, `storage_file_path`)
VALUES
  ('alpha-access-guide', 'Studio Alpha Access Guide', 'Exclusive architecture and deployment walkthrough PDF', 'assets/guides/alpha-access-guide.pdf'),
  ('starter-kit-v1', 'Azure Cloud Starter Kit', 'Starter templates and ARM/Bicep configurations', 'assets/kits/starter-kit-v1.zip'),
  ('pro-audio-pack', 'Studio Sound FX & Audio Assets Pack', 'Curated lossless audio stems for game/app creators', 'assets/media/pro-audio-pack.tar.gz')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `storage_file_path` = VALUES(`storage_file_path`);
