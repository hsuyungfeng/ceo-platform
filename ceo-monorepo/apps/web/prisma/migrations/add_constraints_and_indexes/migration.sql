-- Migration: add_constraints_and_indexes
-- Description: Database-level safeguards for User and OAuth models

-- 1. CHECK constraints for data validation
ALTER TABLE "User" ADD CONSTRAINT password_is_hashed
  CHECK (password IS NULL OR length(password) >= 50);

ALTER TABLE "User" ADD CONSTRAINT points_non_negative
  CHECK (points >= 0);

ALTER TABLE "User" ADD CONSTRAINT email_valid
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 2. Partial indexes for admin queries (only non-active and non-member)
CREATE INDEX users_status_non_active_idx ON "User" (status)
  WHERE status != 'ACTIVE';

CREATE INDEX users_role_admin_idx ON "User" (role)
  WHERE role != 'MEMBER';

-- 3. TempOAuth lookup index for OAuth registration flow
CREATE INDEX temp_oauth_provider_email_idx ON "TempOAuth" (provider, email);

-- 4. User creation date index for admin dashboards
CREATE INDEX users_created_at_idx ON "User" ("createdAt");

-- 5. Convert timestamps to timestamptz for timezone safety
-- Note: This requires data migration. For now, documents that all DateTime fields
-- should be defined with @db.Timestamptz in schema.prisma
