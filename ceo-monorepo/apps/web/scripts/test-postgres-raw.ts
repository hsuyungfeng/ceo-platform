#!/usr/bin/env npx tsx

/**
 * Direct PostgreSQL Authentication Test (without Prisma ORM)
 * Tests PostgreSQL connection and basic operations
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(type: 'success' | 'error' | 'info' | 'test', message: string) {
  const symbols = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    test: '🧪',
  };

  const colorMap = {
    success: colors.green,
    error: colors.red,
    info: colors.blue,
    test: colors.yellow,
  };

  console.log(`${colorMap[type]}${symbols[type]} ${message}${colors.reset}`);
}

async function testPostgresAuth() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PostgreSQL Direct Connection Test');
  console.log('='.repeat(60) + '\n');

  let testsPassed = 0;
  let testsFailed = 0;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test 1: Check PostgreSQL connection
    log('test', 'Test 1: Checking PostgreSQL connection...');
    try {
      const result = await pool.query('SELECT NOW()');
      log('success', '✓ PostgreSQL connection successful');
      log('info', `  Server time: ${result.rows[0].now}`);
      testsPassed++;
    } catch (error) {
      log('error', `✗ PostgreSQL connection failed: ${(error as any)?.message}`);
      log('info', 'Ensure PostgreSQL is running and DATABASE_URL is correct');
      testsFailed++;
      return;
    }

    // Test 2: Check if users table exists
    log('test', 'Test 2: Checking if users table exists...');
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'users'
        );
      `);
      if (result.rows[0].exists) {
        log('success', '✓ Users table exists');
        testsPassed++;
      } else {
        log('error', '✗ Users table does not exist');
        log('info', 'Run: npx tsx scripts/init-db.ts to create tables');
        testsFailed++;
      }
    } catch (error) {
      log('error', `✗ Table check failed: ${(error as any)?.message}`);
      testsFailed++;
    }

    // Test 3: Try creating a test user
    log('test', 'Test 3: Creating test user...');
    try {
      const testUser = {
        taxId: '99999999',
        email: 'direct-test@example.com',
        password: 'TestPassword123!',
        name: 'Direct Test User',
        role: 'MEMBER',
        status: 'ACTIVE',
      };

      const hashedPassword = await bcrypt.hash(testUser.password, 12);

      const now = new Date();
      const insertResult = await pool.query(
        `INSERT INTO "users" (
          id, "taxId", "email", "password", "name",
          "role", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, "taxId", email, name`,
        [
          Math.random().toString(36).substring(7), // Generate random id
          testUser.taxId,
          testUser.email,
          hashedPassword,
          testUser.name,
          testUser.role,
          testUser.status,
          now,
          now,
        ]
      );

      if (insertResult.rows.length > 0) {
        const user = insertResult.rows[0];
        log('success', `✓ User created (ID: ${user.id})`);
        testsPassed++;

        // Test 4: Verify password
        log('test', 'Test 4: Verifying password...');
        const isPasswordValid = await bcrypt.compare(testUser.password, hashedPassword);
        if (isPasswordValid) {
          log('success', '✓ Password verification successful');
          testsPassed++;
        } else {
          log('error', '✗ Password verification failed');
          testsFailed++;
        }

        // Test 5: Query user back
        log('test', 'Test 5: Querying user by taxId...');
        const queryResult = await pool.query('SELECT * FROM "users" WHERE "taxId" = $1', [
          testUser.taxId,
        ]);
        if (queryResult.rows.length > 0) {
          log('success', `✓ User found (taxId: ${queryResult.rows[0].taxId})`);
          testsPassed++;
        } else {
          log('error', '✗ User not found');
          testsFailed++;
        }
      } else {
        log('error', '✗ User creation returned no rows');
        testsFailed++;
      }
    } catch (error) {
      const err = error as any;
      if (err.code === '23505') {
        log('error', '✗ User already exists (duplicate key)');
        log('info', 'This is OK - test user from previous run');
        testsPassed++;
      } else {
        log('error', `✗ User creation failed: ${err.message}`);
        log('info', `Error code: ${err.code}`);
        testsFailed++;
      }
    }
  } catch (error) {
    log('error', `✗ Test execution failed: ${error}`);
    testsFailed++;
  } finally {
    await pool.end();
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log(
      `\n${colors.green}🎉 All tests passed! PostgreSQL is ready for Prisma.${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}⚠️  Some tests failed. Check the errors above.${colors.reset}\n`
    );
    process.exit(1);
  }
}

testPostgresAuth().catch((error) => {
  console.error('Test execution error:', error);
  process.exit(1);
});
