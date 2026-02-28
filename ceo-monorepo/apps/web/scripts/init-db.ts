#!/usr/bin/env npx tsx

/**
 * Initialize PostgreSQL database tables for authentication
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Initializing PostgreSQL database tables...\n');

    // Create ENUM types
    console.log('Creating ENUM types...');
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
          CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN');
        END IF;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userstatus') THEN
          CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
        END IF;
      END $$;
    `);

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        "taxId" TEXT UNIQUE,
        name TEXT,
        "firmName" TEXT,
        phone TEXT UNIQUE,
        address TEXT,
        "contactPerson" TEXT,
        points INT DEFAULT 0,
        role "UserRole" DEFAULT 'MEMBER',
        status "UserStatus" DEFAULT 'ACTIVE',
        "emailVerified" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "loginAttempts" INT DEFAULT 0,
        "lockedUntil" TIMESTAMP
      );
    `);

    // Create oauth_accounts table
    console.log('Creating oauth_accounts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "oauth_accounts" (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        name TEXT,
        picture TEXT,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE(provider, "providerId")
      );
    `);

    // Create temp_oauth table
    console.log('Creating temp_oauth table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "temp_oauth" (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        picture TEXT,
        "accessToken" TEXT NOT NULL,
        "refreshToken" TEXT,
        "tokenExpiresAt" TIMESTAMP,
        data TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "expiresAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE(provider, "providerId")
      );
    `);

    // Create indexes
    console.log('Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS users_status_idx ON "users" (status);
      CREATE INDEX IF NOT EXISTS users_role_idx ON "users" (role);
      CREATE INDEX IF NOT EXISTS oauth_provider_email_idx ON "oauth_accounts" (provider, email);
      CREATE INDEX IF NOT EXISTS users_created_at_idx ON "users" ("createdAt");
      CREATE INDEX IF NOT EXISTS temp_oauth_expires_at_idx ON "temp_oauth" ("expiresAt");
    `);

    console.log('\n✅ Database initialization complete!\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
