-- ========================================================================
-- Non-Destructive Migration Script: armscii8 -> utf8mb4
-- Database: experimental_studio_db
-- Target: Azure Database for MySQL Flexible Server
-- ========================================================================
-- RATIONALE:
-- The legacy DB dump specifies `CHARACTER SET armscii8` (Armenian 8-bit ASCII),
-- which is incapable of representing accented letters, CJK characters, emojis,
-- and international email formats (RFC 6531 / EAI).
--
-- Running CONVERT TO CHARACTER SET utf8mb4 safely re-encodes ASCII/alphanumeric
-- text without truncating data, and updates column and collation definitions.
-- ========================================================================

USE `experimental_studio_db`;

-- Step 1: Temporarily disable foreign key checks to safely adjust collations
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Convert Database Default Charset
ALTER DATABASE `experimental_studio_db` 
  CHARACTER SET = utf8mb4 
  COLLATE = utf8mb4_unicode_ci;

-- Step 3: Convert subscribers table & columns
ALTER TABLE `subscribers` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `subscribers`
  MODIFY `email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Step 4: Convert auth_magic_tokens table & columns
ALTER TABLE `auth_magic_tokens` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `auth_magic_tokens`
  MODIFY `token_hash` VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Step 5: Convert totp_credentials table & columns
ALTER TABLE `totp_credentials` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `totp_credentials`
  MODIFY `totp_secret` VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Step 6: Convert totp_backup_codes table & columns
ALTER TABLE `totp_backup_codes` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `totp_backup_codes`
  MODIFY `code_hash` VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Step 7: Convert perks table & columns
ALTER TABLE `perks` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `perks`
  MODIFY `slug` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY `title` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY `storage_file_path` VARCHAR(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Step 8: Convert perk_unlocks table
ALTER TABLE `perk_unlocks` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 9: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification Query: Show updated charsets
SELECT TABLE_NAME, TABLE_COLLATION 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'experimental_studio_db';
