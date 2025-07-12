/**
 * @jest-environment jsdom
 */

import { Game } from '../../js/engine/game.js';
import { setupGameMocks } from '../mocks/game-test-helpers.js';

describe('Game Initialization', () => {
    let game;

    beforeAll(() => {
        setupGameMocks();
    });

    beforeEach(() => {
        // Create a fresh game instance for each test
        game = new Game();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should initialize with correct default properties', () => {
        expect(game.fps).toBe(30);
        expect(game.frameInterval).toBe(1000 / 30);
        expect(game.lastTime).toBe(0);
        expect(game.timer).toBe(0);
        expect(game.running).toBe(true);
    });

    test('should have instantiated all core managers', () => {
        expect(game.input).toBeDefined();
        expect(game.assets).toBeDefined();
        expect(game.audio).toBeDefined();
        expect(game.collision).toBeDefined();
        expect(game.entityManager).toBeDefined();
        expect(game.saveManager).toBeDefined();
        expect(game.projectilePool).toBeDefined();
        expect(game.missilePool).toBeDefined();
    });

    test('should have correct window dimensions', () => {
        // The game calculates dimensions based on window size and aspect ratio
        // With our mock window size of 800x600, it should calculate 800x450 (16:9 aspect ratio)
        expect(game.width).toBe(800);
        expect(game.height).toBe(450); // 800 * (9/16) = 450
    });

    test('should initialize player data with defaults', () => {
        expect(game.playerData).toBeDefined();
        expect(game.playerData.score).toBe(0);
        expect(game.playerData.money).toBe(0);
        // Note: health is not set in the constructor, it's set elsewhere
    });

    test('should detect touch device correctly', () => {
        // The game detects touch devices based on 'ontouchstart' in window or maxTouchPoints > 0
        // Our mock sets maxTouchPoints to 0, but the test environment might have ontouchstart
        // Let's test the actual detection logic
        const hasTouchStart = 'ontouchstart' in window;
        const maxTouchPoints = navigator.maxTouchPoints;
        const expectedTouchDevice = hasTouchStart || maxTouchPoints > 0;
        
        expect(game.isTouchDevice).toBe(expectedTouchDevice);
    });
}); 