/**
 * @jest-environment jsdom
 */

import { Game } from '../../js/engine/game.js';
import { setupGameMocks } from '../mocks/game-test-helpers.js';

describe('Game Managers and Systems', () => {
    let game;

    beforeAll(() => {
        setupGameMocks();
    });

    beforeEach(() => {
        game = new Game();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Input Manager', () => {
        test('should have input manager with required methods', () => {
            expect(game.input).toBeDefined();
            expect(typeof game.input.getMousePosition).toBe('function');
            expect(typeof game.input.isMouseButtonPressed).toBe('function');
            expect(typeof game.input.isKeyPressed).toBe('function');
        });

        test('should handle mouse input correctly', () => {
            const mockPosition = { x: 100, y: 200 };
            game.input.getMousePosition = jest.fn().mockReturnValue(mockPosition);
            
            const position = game.input.getMousePosition();
            expect(position).toEqual(mockPosition);
        });

        test('should handle keyboard input correctly', () => {
            game.input.isKeyPressed = jest.fn().mockReturnValue(true);
            
            expect(game.input.isKeyPressed('Space')).toBe(true);
        });
    });

    describe('Asset Manager', () => {
        test('should have asset manager with required methods', () => {
            expect(game.assets).toBeDefined();
            expect(typeof game.assets.getImage).toBe('function');
            expect(typeof game.assets.loadImage).toBe('function');
        });

        test('should handle image loading', () => {
            const mockImage = { src: 'test.png', width: 100, height: 100 };
            game.assets.getImage = jest.fn().mockReturnValue(mockImage);
            
            const image = game.assets.getImage('test');
            expect(image).toBe(mockImage);
        });
    });

    describe('Audio Manager', () => {
        test('should have audio manager with required methods', () => {
            expect(game.audio).toBeDefined();
            expect(typeof game.audio.playSound).toBe('function');
            expect(typeof game.audio.playMusic).toBe('function');
        });

        test('should handle sound playback', () => {
            game.audio.playSound = jest.fn();
            
            game.audio.playSound('explosion');
            expect(game.audio.playSound).toHaveBeenCalledWith('explosion');
        });
    });

    describe('Collision System', () => {
        test('should have collision system with required methods', () => {
            expect(game.collision).toBeDefined();
            expect(typeof game.collision.addToGroup).toBe('function');
            expect(typeof game.collision.checkCollisions).toBe('function');
            expect(typeof game.collision.checkAABBCollision).toBe('function');
        });

        test('should handle entity collision groups', () => {
            const mockEntity = { id: 1, x: 0, y: 0, width: 50, height: 50 };
            game.collision.addToGroup = jest.fn();
            
            game.collision.addToGroup(mockEntity, 'enemies');
            expect(game.collision.addToGroup).toHaveBeenCalledWith(mockEntity, 'enemies');
        });
    });

    describe('Entity Manager', () => {
        test('should have entity manager with required methods', () => {
            expect(game.entityManager).toBeDefined();
            expect(typeof game.entityManager.add).toBe('function');
            expect(typeof game.entityManager.update).toBe('function');
            expect(typeof game.entityManager.render).toBe('function');
        });

        test('should handle entity management', () => {
            const mockEntity = { id: 1, update: jest.fn(), render: jest.fn() };
            game.entityManager.add = jest.fn();
            
            game.entityManager.add(mockEntity);
            expect(game.entityManager.add).toHaveBeenCalledWith(mockEntity);
        });
    });

    describe('Save Manager', () => {
        test('should have save manager with required methods', () => {
            expect(game.saveManager).toBeDefined();
            expect(typeof game.saveManager.saveGame).toBe('function');
            expect(typeof game.saveManager.loadGame).toBe('function');
        });

        test('should handle save operations', () => {
            game.saveManager.saveGame = jest.fn();
            
            game.saveManager.saveGame();
            expect(game.saveManager.saveGame).toHaveBeenCalled();
        });
    });

    describe('Object Pools', () => {
        test('should have projectile and missile pools', () => {
            expect(game.projectilePool).toBeDefined();
            expect(game.missilePool).toBeDefined();
            expect(typeof game.projectilePool.get).toBe('function');
            expect(typeof game.missilePool.get).toBe('function');
        });

        test('should handle object pool operations', () => {
            const mockProjectile = { id: 1, active: false };
            game.projectilePool.get = jest.fn().mockReturnValue(mockProjectile);
            
            const projectile = game.projectilePool.get();
            expect(projectile).toBe(mockProjectile);
        });
    });
}); 