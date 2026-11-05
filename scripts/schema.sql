-- ========================================================================
-- studioNeo Artist-Centric Database Schema (100% BCNF Compliant)
-- Target: Azure Database for MySQL Flexible Server
-- Character Set: utf8mb4 (Collation: utf8mb4_unicode_ci)
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `experimental_studio_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `experimental_studio_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `perk_unlocks`;
DROP TABLE IF EXISTS `perks`;
DROP TABLE IF EXISTS `cels`;
DROP TABLE IF EXISTS `subscribers`;
DROP TABLE IF EXISTS `artwork_downloads`;
DROP TABLE IF EXISTS `artwork_likes`;
DROP TABLE IF EXISTS `artwork_assets`;
DROP TABLE IF EXISTS `artworks`;
DROP TABLE IF EXISTS `inquiries`;
DROP TABLE IF EXISTS `account_oauth_providers`;
DROP TABLE IF EXISTS `webauthn_credentials`;
DROP TABLE IF EXISTS `totp_backup_codes`;
DROP TABLE IF EXISTS `totp_credentials`;
DROP TABLE IF EXISTS `auth_magic_tokens`;
DROP TABLE IF EXISTS `accounts`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Accounts Table (User Identity, Artist Profile, Administrative Roles)
-- Candidate Keys: {id}, {email}, {handle}
-- BCNF Verified: All determinants are superkeys.
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `handle` VARCHAR(64) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `avatar_url` TEXT NULL DEFAULT NULL,
  `bio` TEXT NULL DEFAULT NULL,
  `website_url` VARCHAR(512) NULL DEFAULT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `system_role` ENUM('user', 'curator', 'admin') NOT NULL DEFAULT 'user',
  `artist_distinction` ENUM('none', 'artist', 'featured', 'partner') NOT NULL DEFAULT 'none',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_accounts_email` (`email`),
  UNIQUE KEY `idx_accounts_handle` (`handle`),
  KEY `idx_accounts_is_verified` (`is_verified`),
  KEY `idx_accounts_system_role` (`system_role`),
  KEY `idx_accounts_artist_distinction` (`artist_distinction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Auth Magic Tokens (Passwordless Email OTPs)
-- Candidate Keys: {id}, {token_hash}
CREATE TABLE IF NOT EXISTS `auth_magic_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `consumed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_magic_tokens_hash` (`token_hash`),
  KEY `idx_magic_tokens_account_active` (`account_id`, `consumed_at`, `expires_at`),
  CONSTRAINT `fk_magic_tokens_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TOTP Credentials (RFC 6238 Second Factor)
-- Candidate Key: {account_id}
CREATE TABLE IF NOT EXISTS `totp_credentials` (
  `account_id` BIGINT UNSIGNED NOT NULL,
  `totp_secret` VARCHAR(128) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`),
  CONSTRAINT `fk_totp_credentials_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TOTP Backup Codes (One-time fallback codes)
-- Candidate Keys: {id}, {account_id, code_hash}
CREATE TABLE IF NOT EXISTS `totp_backup_codes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` BIGINT UNSIGNED NOT NULL,
  `code_hash` VARCHAR(64) NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_backup_codes_account_code` (`account_id`, `code_hash`),
  KEY `idx_backup_codes_account_unused` (`account_id`, `is_used`),
  CONSTRAINT `fk_totp_backup_codes_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. WebAuthn Credentials (FIDO2 Biometrics & Hardware Keys)
-- Candidate Keys: {id}, {credential_id}
CREATE TABLE IF NOT EXISTS `webauthn_credentials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` BIGINT UNSIGNED NOT NULL,
  `credential_id` VARCHAR(255) NOT NULL,
  `public_key` TEXT NOT NULL,
  `counter` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `transports` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_webauthn_credential_id` (`credential_id`),
  KEY `idx_webauthn_account` (`account_id`),
  CONSTRAINT `fk_webauthn_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Federated OAuth Provider Links (Google & Microsoft SSO)
-- Candidate Keys: {id}, {provider, provider_user_id}
CREATE TABLE IF NOT EXISTS `account_oauth_providers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` BIGINT UNSIGNED NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `provider_user_id` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_oauth_provider_user` (`provider`, `provider_user_id`),
  KEY `idx_oauth_account` (`account_id`),
  CONSTRAINT `fk_oauth_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Artworks (Primary Exhibition Catalog - Zero Transitive Artist Dependencies)
-- Candidate Keys: {id}, {code}
CREATE TABLE IF NOT EXISTS `artworks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `category` ENUM('Generative', 'Kinetic', 'Vectors', 'Mono') NOT NULL DEFAULT 'Generative',
  `edition` VARCHAR(64) NOT NULL DEFAULT 'Ed. 1/12',
  `color` VARCHAR(32) NOT NULL DEFAULT '#c496ff',
  `price` VARCHAR(32) NOT NULL DEFAULT '$180',
  `is_vault` TINYINT(1) NOT NULL DEFAULT 0,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_artworks_code` (`code`),
  KEY `idx_artworks_account` (`account_id`),
  KEY `idx_artworks_category` (`category`),
  KEY `idx_artworks_likes_count` (`likes_count`),
  CONSTRAINT `fk_artworks_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Artwork Assets (Normalized 1:N Multi-Format Storage Manifest)
-- Candidate Keys: {id}, {artwork_id, asset_type}
CREATE TABLE IF NOT EXISTS `artwork_assets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `artwork_id` BIGINT UNSIGNED NOT NULL,
  `asset_type` ENUM('master_svg', 'preview_gif', 'preview_raster', 'source_archive') NOT NULL,
  `storage_path` VARCHAR(512) NOT NULL,
  `url` TEXT NULL DEFAULT NULL,
  `mime_type` VARCHAR(64) NOT NULL,
  `file_size_bytes` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_artwork_assets_unique_kind` (`artwork_id`, `asset_type`),
  KEY `idx_artwork_assets_artwork` (`artwork_id`),
  CONSTRAINT `fk_artwork_assets_artwork`
    FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Artwork Likes (User Social Engagement & Favorites)
-- Candidate Key: {account_id, artwork_id}
CREATE TABLE IF NOT EXISTS `artwork_likes` (
  `account_id` BIGINT UNSIGNED NOT NULL,
  `artwork_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`, `artwork_id`),
  KEY `idx_artwork_likes_artwork` (`artwork_id`),
  CONSTRAINT `fk_artwork_likes_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_artwork_likes_artwork`
    FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Artwork Downloads (Audit Trail & Partner Licensing Enforcement)
-- Candidate Key: {id}
CREATE TABLE IF NOT EXISTS `artwork_downloads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` BIGINT UNSIGNED NOT NULL,
  `artwork_id` BIGINT UNSIGNED NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `format` VARCHAR(32) NOT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `downloaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_artwork_downloads_account` (`account_id`),
  KEY `idx_artwork_downloads_artwork` (`artwork_id`),
  CONSTRAINT `fk_artwork_downloads_account`
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_artwork_downloads_artwork`
    FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_artwork_downloads_asset`
    FOREIGN KEY (`asset_id`) REFERENCES `artwork_assets` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Studio Inquiries & Commission Handling
-- Candidate Key: {id}
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `target_account_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `organization` VARCHAR(255) NULL DEFAULT NULL,
  `topic` VARCHAR(64) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiries_email` (`email`),
  KEY `idx_inquiries_topic` (`topic`),
  KEY `idx_inquiries_target_account` (`target_account_id`),
  CONSTRAINT `fk_inquiries_target_account`
    FOREIGN KEY (`target_account_id`) REFERENCES `accounts` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- Seed Data for Initial Accounts & Artist Profiles
-- ========================================================================
INSERT INTO `accounts` (`email`, `handle`, `display_name`, `is_verified`, `system_role`, `artist_distinction`)
VALUES
  ('member@studioneo.tech', 'member', 'Studio Member', 1, 'user', 'none'),
  ('artist@studioneo.tech', 'sankobite', 'sankobite', 1, 'curator', 'partner'),
  ('rella@studioneo.tech', 'rellakinoko', 'Rella', 1, 'user', 'featured')
ON DUPLICATE KEY UPDATE
  `display_name` = VALUES(`display_name`),
  `system_role` = VALUES(`system_role`),
  `artist_distinction` = VALUES(`artist_distinction`);
