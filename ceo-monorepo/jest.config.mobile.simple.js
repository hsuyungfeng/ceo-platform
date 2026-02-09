module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/apps/mobile'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      configFile: './babel.config.jest.js',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
    '^@ceo/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@ceo/auth/(.*)$': '<rootDir>/packages/auth/src/$1',
    '^@ceo/api-client/(.*)$': '<rootDir>/packages/api-client/src/$1',
    '^react-native$': 'react-native-web',
    '^@react-native-async-storage/async-storage$': '<rootDir>/apps/mobile/__mocks__/async-storage.js',
    '^@invertase/react-native-apple-authentication$': '<rootDir>/apps/mobile/__mocks__/apple-auth.js',
    '^react-native-mmkv$': '<rootDir>/apps/mobile/__mocks__/mmkv.js',
    '^expo-router$': '<rootDir>/apps/mobile/__mocks__/expo-router.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mobile.js'],
  collectCoverageFrom: [
    'apps/mobile/src/**/*.{ts,tsx}',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage/mobile',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
};