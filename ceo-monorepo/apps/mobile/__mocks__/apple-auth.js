module.exports = {
  isSupported: true,
  AppleAuthRequestOperation: {
    LOGIN: 'LOGIN',
    REFRESH: 'REFRESH',
    LOGOUT: 'LOGOUT',
  },
  AppleAuthRequestScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
  performRequest: jest.fn(),
  getCredentialStateForUser: jest.fn(),
};