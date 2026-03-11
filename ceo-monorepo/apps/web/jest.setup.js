import '@testing-library/jest-dom'
import dotenv from 'dotenv'

// Load .env.local for tests
dotenv.config({ path: '.env.local' })

// Polyfill Request, Response, and other Web APIs for Next.js middleware testing
if (typeof global.Request === 'undefined') {
  try {
    const { Request, Response, fetch } = require('node-fetch-polyfill')
    global.Request = Request
    global.Response = Response
    global.fetch = fetch
  } catch (error) {
    // 如果 node-fetch-polyfill 未安裝，則創建簡單的模擬
    console.warn('node-fetch-polyfill not available, creating simple mocks')
    global.Request = class Request {}
    global.Response = class Response {}
    global.fetch = jest.fn()
  }
}

// Mock logger module
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth to avoid ES module import errors
jest.mock('next-auth', () => ({
  __esModule: true,
  default: () => ({
    handlers: {},
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(),
  }),
}));

// Mock next-auth providers
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('next-auth/providers/apple', () => ({
  __esModule: true,
  default: () => ({}),
}));

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  __esModule: true,
  encode: jest.fn(),
  decode: jest.fn(),
}));

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-do-not-use-in-production'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-key-do-not-use-in-production'
process.env.NODE_ENV = 'test'

// Polyfill TextEncoder and TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
