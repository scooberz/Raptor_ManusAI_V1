// jest.config.js
export default {
  // Use 'setupFiles' to run setup code BEFORE the test environment is set up.
  setupFiles: ['./tests/jest-setup.js'],
  
  // Add this line to use the browser-like environment
  testEnvironment: 'jsdom',
};