// Jest setup file for mobile
// Mock environment variables
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000';

// Mock Alert
global.Alert = {
  alert: jest.fn(),
};

// Mock Platform
global.Platform = {
  OS: 'ios',
  select: jest.fn(),
};