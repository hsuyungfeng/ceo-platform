module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/mobile'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'apps/mobile/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
    '^@ceo/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@ceo/auth/(.*)$': '<rootDir>/packages/auth/src/$1',
    '^@ceo/api-client/(.*)$': '<rootDir>/packages/api-client/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mobile.js'],
  collectCoverageFrom: [
    'apps/mobile/src/**/*.{ts,tsx}',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage/mobile',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};