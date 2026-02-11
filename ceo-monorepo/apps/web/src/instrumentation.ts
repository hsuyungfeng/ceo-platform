/**
 * Next.js Instrumentation Hook
 * Initializes Sentry on both server and client
 * This file is automatically loaded by Next.js 13.4+
 */

export async function register() {
  // Initialize Sentry on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initSentryServer } = await import('@/lib/sentry.server.config');
    initSentryServer();
  }

  // Initialize Sentry on edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    const { initSentryServer } = await import('@/lib/sentry.server.config');
    initSentryServer();
  }
}
