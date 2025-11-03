// Jest setup file
// This runs before all tests

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};

// Set test environment variables
process.env.NODE_ENV = 'test';
