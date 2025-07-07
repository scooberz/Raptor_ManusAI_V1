// tests/mocks/mock-game.js

/**
 * Creates a mock game object for use in Jest tests.
 * This provides a consistent base with all necessary mocked
 * properties and methods that other classes might depend on.
 */
export function createMockGame() {
  return {
    assets: {
      getImage: jest.fn(),
      getImageAsset: jest.fn(),
    },
    collision: {
      addToGroup: jest.fn(),
      checkCollision: jest.fn(),
    },
    entityManager: {
      add: jest.fn(),
      update: jest.fn(),
      render: jest.fn(),
    },
    input: {
      keys: new Set(),
    },
    audio: {
      play: jest.fn(),
      playMusic: jest.fn(),
      stopMusic: jest.fn(),
    },
    playerData: {
      health: 100,
      money: 0,
      score: 0,
    },
    // Mock the canvas contexts
    contexts: {
      ui: {
        canvas: {
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
      },
    },
    // Mock state-related properties
    currentState: null,
    isTouchDevice: false,
    width: 800,
    height: 600,
    // Mock methods
    changeState: jest.fn(),
  };
}