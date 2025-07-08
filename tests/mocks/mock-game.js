// tests/mocks/mock-game.js

/**
 * @deprecated Use createMockGame from game-test-helpers.js instead
 * This file is kept for backward compatibility
 */

import { createMockGame as createMockGameHelper } from './game-test-helpers.js';

/**
 * Creates a mock game object for use in Jest tests.
 * This provides a consistent base with all necessary mocked
 * properties and methods that other classes might depend on.
 */
export function createMockGame() {
  return createMockGameHelper();
}