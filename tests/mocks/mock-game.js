import { jest } from '@jest/globals';

export function createMockGame() {
  return {
    entityManager: {
      add: jest.fn(),
      getEnemies: jest.fn(() => []),
    },
    collision: {
      addToGroup: jest.fn(),
      check: jest.fn(() => ({ collisions: [] })),
    },
    assets: {
      get: jest.fn((asset) => {
        if (asset.endsWith('json')) return {};
        return { width: 10, height: 10 };
      }),
    },
    input: {
      isDown: jest.fn(() => false),
    },
    width: 800,
    height: 600,
    // Add any other game properties or methods that Player might need
  };
}
