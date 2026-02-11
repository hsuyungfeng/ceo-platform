/**
 * Sentry Server-Side Configuration
 * Handles error tracking for API routes and server-side operations
 */

import * as Sentry from '@sentry/nextjs';

export function initSentryServer() {
  const environment = process.env.NODE_ENV || 'development';
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured, server error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    debug: environment === 'development',

    // Release tracking
    release: process.env.APP_VERSION || 'unknown',

    // Ignored errors
    ignoreErrors: [
      'NetworkError',
      'Network request failed',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
    ],

    // Server-specific integrations
    integrations: [
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],

    // Performance monitoring
    beforeSend(event, hint) {
      // Filter out health checks and internal requests
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }

      // Mask sensitive data
      if (event.request?.headers) {
        event.request.headers = {
          ...event.request.headers,
          authorization: '[REDACTED]',
          cookie: '[REDACTED]',
        };
      }

      return event;
    },
  });
}

/**
 * Capture security events on server
 */
export function captureServerSecurityEvent(
  eventType: 'csrf_failure' | 'validation_failure' | 'auth_failure' | 'rate_limit_exceeded' | 'injection_attempt',
  context: Record<string, any>,
  level: 'warning' | 'error' = 'warning'
) {
  Sentry.captureException(
    new Error(`Server Security Event: ${eventType}`),
    {
      tags: {
        eventType,
        category: 'security',
        serverSide: true,
      },
      level,
      contexts: {
        security: {
          ...context,
          timestamp: new Date().toISOString(),
        },
      },
    }
  );
}

/**
 * Track request duration and status
 */
export function trackApiRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  Sentry.captureEvent({
    message: `API ${method} ${endpoint}`,
    level: statusCode >= 400 ? 'warning' : 'info',
    tags: {
      method,
      endpoint,
      statusCode: String(statusCode),
      performance: duration > 1000 ? 'slow' : 'normal',
    },
    contexts: {
      request: {
        method,
        endpoint,
        statusCode,
        durationMs: duration,
        userId,
      },
    },
  });
}

/**
 * Monitor database operations
 */
export function trackDatabaseOperation(
  operation: string,
  table: string,
  duration: number,
  error?: Error
) {
  const level = error ? 'error' : 'info';

  if (error) {
    Sentry.captureException(error, {
      tags: {
        operation,
        table,
        category: 'database',
      },
      contexts: {
        database: {
          operation,
          table,
          durationMs: duration,
        },
      },
    });
  } else {
    Sentry.captureEvent({
      message: `Database ${operation} on ${table}`,
      level,
      tags: {
        operation,
        table,
        performance: duration > 100 ? 'slow' : 'normal',
      },
      contexts: {
        database: {
          operation,
          table,
          durationMs: duration,
        },
      },
    });
  }
}

/**
 * Track email operations
 */
export function trackEmailOperation(
  templateType: string,
  recipient: string,
  success: boolean,
  error?: Error
) {
  if (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'email',
        templateType,
        status: 'failed',
      },
      contexts: {
        email: {
          templateType,
          recipient: maskEmail(recipient),
        },
      },
    });
  } else {
    Sentry.captureEvent({
      message: `Email sent: ${templateType}`,
      level: 'info',
      tags: {
        operation: 'email',
        templateType,
        status: 'success',
      },
      contexts: {
        email: {
          templateType,
          recipient: maskEmail(recipient),
        },
      },
    });
  }
}

/**
 * Set server user context
 */
export function setSentryServerUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: maskEmail(email),
  });
}

/**
 * Clear server user context
 */
export function clearSentryServerUser() {
  Sentry.setUser(null);
}

/**
 * Mask email for privacy
 */
function maskEmail(email?: string): string {
  if (!email) return '';
  const [name, domain] = email.split('@');
  return `${name.substring(0, 1)}***@${domain}`;
}

/**
 * Add server-side breadcrumb
 */
export function addServerBreadcrumb(
  message: string,
  category: string = 'server',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Flush pending Sentry events (call before server shutdown)
 */
export async function flushSentry(timeout = 5000) {
  return Sentry.close(timeout);
}
