// jest.config.js
export default {
  // Use 'jsdom' to simulate a browser environment for tests.
  testEnvironment: 'jsdom',

  // Run the setup file before tests to create the fake browser objects.
  setupFilesAfterEnv: ['./tests/jest-setup.js'],

  // Tell Jest where to find the test files.
  testMatch: [
    '**/tests/**/*.test.js'
  ],
};