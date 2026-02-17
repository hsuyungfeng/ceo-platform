/**
 * Sentry Client-Side Configuration
 * Handles error tracking and performance monitoring for browser
 */

import * as Sentry from '@sentry/nextjs';

export function initSentryClient() {
  if (typeof window === 'undefined') {
    return;
  }

  const environment = process.env.NODE_ENV || 'development';
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    debug: environment === 'development',

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

    // Allowed URLs for error tracking
    allowUrls: [
      /^https?:\/\/(localhost|127\.0\.0\.1|.*\.ceo-buy\.com)/,
    ],

    // Ignored errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Network errors that are expected
      'NetworkError',
      'Network request failed',

      // ResizeObserver errors (common and harmless)
      'ResizeObserver loop limit exceeded',

      // Random plugins/extensions
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
    ],

    // Denylist for URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],

    // Performance monitoring
    integrations: [],

    // Session replay disabled
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Attach stack traces
    attachStacktrace: true,
  });
}

/**
 * Capture security-related exceptions
 */
export function captureSecurityEvent(
  eventType: 'csrf_failure' | 'validation_failure' | 'auth_failure' | 'xss_detected' | 'sql_injection_detected',
  context: Record<string, any>,
  level: 'warning' | 'error' = 'warning'
) {
  Sentry.captureException(new Error(`Security Event: ${eventType}`), {
    tags: {
      eventType,
      category: 'security',
    },
    level,
    contexts: {
      security: context,
    },
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  operationName: string,
  duration: number,
  tags?: Record<string, string>
) {
  // No-op for now
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for context
 */
export function addSentryBreadcrumb(
  message: string,
  category: string = 'user-action',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}
