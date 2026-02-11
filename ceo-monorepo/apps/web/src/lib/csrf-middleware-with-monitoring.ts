/**
 * Enhanced CSRF Middleware with Sentry Monitoring
 * Combines CSRF protection with security event tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/csrf-protection';
import { logger } from '@/lib/logger';
import { securityEventTracker, type SecurityEventContext } from '@/lib/security-event-tracker';

/**
 * Validate CSRF token with security event tracking
 */
export async function validateCSRFTokenWithMonitoring(
  request: NextRequest,
  getContext?: (req: NextRequest) => SecurityEventContext
) {
  // Only validate state-changing methods
  const method = request.method.toUpperCase();
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (!stateChangingMethods.includes(method)) {
    return null;
  }

  // Skip CSRF validation for specific endpoints
  const pathname = new URL(request.url).pathname;
  const skipCSRFPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/health',
  ];

  if (skipCSRFPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  // Get security context
  const context: SecurityEventContext = getContext
    ? getContext(request)
    : securityEventTracker.constructor.getContextFromRequest(request);

  // Get CSRF token from header or body
  let token = request.headers.get('x-csrf-token');

  if (!token) {
    const csrfCookie = request.cookies.get('x-csrf-token')?.value;
    if (csrfCookie) {
      token = csrfCookie;
    }
  }

  // Get session ID from cookie
  const sessionId = request.cookies.get('sessionId')?.value;

  if (!token || !sessionId) {
    logger.warn(
      {
        pathname,
        hasToken: !!token,
        hasSession: !!sessionId,
      },
      'CSRF 令牌或會話 ID 缺失'
    );

    // Track security event
    securityEventTracker.trackCSRFFailure(context, 'missing_token_or_session');

    return NextResponse.json(
      {
        error: '缺少 CSRF 令牌',
        code: 'CSRF_TOKEN_MISSING',
      },
      { status: 403 }
    );
  }

  // Verify CSRF token
  const isValid = csrfProtection.verifyToken(sessionId, token);

  if (!isValid) {
    logger.warn(
      {
        pathname,
        sessionId: sessionId.substring(0, 8),
      },
      'CSRF 令牌驗證失敗'
    );

    // Track security event with details
    securityEventTracker.trackCSRFFailure(context, 'invalid_token');

    return NextResponse.json(
      {
        error: 'CSRF 令牌無效',
        code: 'CSRF_TOKEN_INVALID',
      },
      { status: 403 }
    );
  }

  // Token is valid, track success
  securityEventTracker.trackSecurityEvent('csrf_validation', context, 'success');

  return null;
}

/**
 * Wrap CSRF middleware with performance tracking
 */
export async function validateCSRFWithPerformance(
  request: NextRequest,
  getContext?: (req: NextRequest) => SecurityEventContext
) {
  const startTime = Date.now();

  try {
    const result = await validateCSRFTokenWithMonitoring(request, getContext);
    const duration = Date.now() - startTime;

    // Track performance
    if (duration > 50) {
      logger.warn(
        { duration, path: request.url },
        'CSRF validation took longer than expected'
      );
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(
      { error, duration, path: request.url },
      'CSRF validation error'
    );

    throw error;
  }
}

/**
 * Generate CSRF token with logging
 */
export function generateCSRFTokenWithTracking(sessionId: string): string {
  const token = csrfProtection.generateToken(sessionId);

  logger.info(
    { sessionId: sessionId.substring(0, 8) },
    'CSRF token generated'
  );

  return token;
}
