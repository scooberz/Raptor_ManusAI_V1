/**
 * @jest-environment jsdom
 */

import { Game } from '../../js/engine/game.js';

describe('Game State Machine', () => {
    let game;
    let originalAudioContext;
    let mockCanvases = {};

    const createMockCanvas = (id) => {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.getContext = jest.fn(() => ({
            clearRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            globalCompositeOperation: '',
            imageSmoothingEnabled: true,
            fillText: jest.fn(),
            drawImage: jest.fn(),
        }));
        canvas.addEventListener = jest.fn();
        canvas.removeEventListener = jest.fn();
        return canvas;
    };

    beforeAll(() => {
        // Mock AudioContext
        originalAudioContext = window.AudioContext;
        window.AudioContext = jest.fn().mockImplementation(function() {
            this.createGain = jest.fn(() => ({
                connect: jest.fn(),
                disconnect: jest.fn(),
                gain: { value: 1 },
            }));
            this.decodeAudioData = jest.fn();
        });
        window.webkitAudioContext = window.AudioContext; // Mock webkitAudioContext as well

        // Mock requestAnimationFrame to prevent infinite loop during Game construction
        global.requestAnimationFrame = jest.fn(cb => {
            return 1;
        });

        // Mock Image constructor for AssetManager
        Object.defineProperty(global, 'Image', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'load') {
                        // Simulate immediate load for tests
                        callback();
                    }
                }),
                removeEventListener: jest.fn(),
                src: '',
            })),
        });

        // Create mock canvases and append them to the document body once
        mockCanvases['background-layer'] = createMockCanvas('background-layer');
        mockCanvases['enemy-layer'] = createMockCanvas('enemy-layer');
        mockCanvases['projectile-layer'] = createMockCanvas('projectile-layer');
        mockCanvases['player-layer'] = createMockCanvas('player-layer');
        mockCanvases['explosion-layer'] = createMockCanvas('explosion-layer');
        mockCanvases['ui-layer'] = createMockCanvas('ui-layer');

        for (const id in mockCanvases) {
            document.body.appendChild(mockCanvases[id]);
        }

        // Mock document.getElementById
        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (mockCanvases[id]) {
                return mockCanvases[id];
            }
            // Mock for menu-screen, game-over-screen, and loading-screen
            if (id === 'menu-screen' || id === 'game-over-screen' || id === 'loading-screen') {
                return { style: { display: '' } };
            }
            return null;
        });

        // Mock document.createElement for elements like buttons and canvas
        jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
            const element = {
                tagName: tagName.toUpperCase(),
                style: {},
                appendChild: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                setAttribute: jest.fn(),
            };

            if (tagName.toLowerCase() === 'canvas') {
                element.getContext = jest.fn(() => ({
                    clearRect: jest.fn(),
                    globalCompositeOperation: '',
                    imageSmoothingEnabled: true,
                    fillText: jest.fn(),
                    drawImage: jest.fn(),
                }));
                element.width = 0;
                element.height = 0;
            }
            return element;
        });

        // Mock window.addEventListener
        jest.spyOn(window, 'addEventListener').mockImplementation(jest.fn());

        // Mock fetch API
        global.fetch = jest.fn((url) => {
            if (url.includes('introCutscene.json')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ events: [] }),
                });
            } else if (url.includes('level1.json')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ levelName: 'Mock Level', waves: [] }),
                });
            }
            return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
        });
    });

    beforeEach(() => {
        document.body.innerHTML = ''; // Clear the DOM before each test
        mockCanvases = {};

        // Mock window properties
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
        Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 });
        Object.defineProperty(window, 'ontouchstart', { writable: true, value: undefined });
        Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 0 });

        mockCanvases['background-layer'] = createMockCanvas('background-layer');
        mockCanvases['enemy-layer'] = createMockCanvas('enemy-layer');
        mockCanvases['projectile-layer'] = createMockCanvas('projectile-layer');
        mockCanvases['player-layer'] = createMockCanvas('player-layer');
        mockCanvases['explosion-layer'] = createMockCanvas('explosion-layer');
        mockCanvases['ui-layer'] = createMockCanvas('ui-layer');

        // Append canvases to the document body
        for (const id in mockCanvases) {
            document.body.appendChild(mockCanvases[id]);
        }

        // Prevent the Game constructor from calling changeState immediately
        const originalChangeState = Game.prototype.changeState;
        jest.spyOn(Game.prototype, 'changeState').mockImplementation(async function(stateName) {
            if (stateName === 'boot' && !this._bootStateEntered) {
                this._bootStateEntered = true;
                const bootStateInstance = { enter: jest.fn(), exit: jest.fn(), render: jest.fn() };
                this.states.boot = bootStateInstance;
                this.currentState = bootStateInstance;
                await bootStateInstance.enter();
                return;
            }
            return originalChangeState.apply(this, [stateName]);
        });

        game = new Game();
        game.playerData = { health: 100, money: 0, score: 0 };

        jest.spyOn(Game.prototype, 'changeState').mockRestore();

        for (const stateName in game.states) {
            const stateInstance = game.states[stateName];
            if (stateInstance && typeof stateInstance.enter === 'function') {
                jest.spyOn(stateInstance, 'enter');
            }
            if (stateInstance && typeof stateInstance.exit === 'function') {
                jest.spyOn(stateInstance, 'exit');
            }
            if (stateInstance.enter) stateInstance.enter.mockClear();
            if (stateInstance.exit) stateInstance.exit.mockClear();
        }

        game.currentState = game.states.menu;
        game.currentState.enter.mockClear();
        game.currentState.exit.mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        window.AudioContext = originalAudioContext; // Restore original AudioContext
        window.webkitAudioContext = originalAudioContext; // Restore original webkitAudioContext
    });

    test('should initialize with correct default properties', () => {
        const gameInstance = new Game();
        expect(gameInstance.fps).toBe(30);
        expect(gameInstance.frameInterval).toBe(1000 / 30);
        expect(gameInstance.lastTime).toBe(0);
        expect(gameInstance.timer).toBe(0);
        expect(gameInstance.running).toBe(true);
    });

    test('should have instantiated all core managers', () => {
        const gameInstance = new Game();
        expect(gameInstance.input).toBeDefined();
        expect(gameInstance.assets).toBeDefined();
        expect(gameInstance.audio).toBeDefined();
        expect(gameInstance.collision).toBeDefined();
        expect(gameInstance.entityManager).toBeDefined();
        expect(gameInstance.saveManager).toBeDefined();
        expect(gameInstance.projectilePool).toBeDefined();
        expect(gameInstance.missilePool).toBeDefined();
    });

    test('should start in the BootState', async () => {
        const gameInstance = new Game();
        // The changeState mock handles the boot state entry
        expect(gameInstance.currentState).toBe(gameInstance.states.boot);
        expect(gameInstance.states.boot.enter).toHaveBeenCalledTimes(1);
    });

    test('changeState should call exit on the old state and enter on the new state', async () => {
        const oldState = game.currentState;
        const newState = game.states.game;

        expect(oldState.exit).not.toHaveBeenCalled();
        expect(newState.enter).not.toHaveBeenCalled();

        await game.changeState('game');

        expect(oldState.exit).toHaveBeenCalledTimes(1);
        expect(newState.enter).toHaveBeenCalledTimes(1);
    });

    test('changeState should update the game.currentState property', async () => {
        const oldState = game.currentState;
        const newState = game.states.gameover;

        expect(game.currentState).toBe(oldState);

        await game.changeState('gameover');

        expect(game.currentState).toBe(newState);
        expect(game.currentState).not.toBe(oldState);
    });

    test('changeState should not call exit if there is no current state', async () => {
        game.currentState = null;
        const newState = game.states.menu;

        await game.changeState('menu');

        expect(newState.enter).toHaveBeenCalledTimes(1);
    });

    test('changeState should log an error if the state is not found', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await game.changeState('nonExistentState');

        expect(consoleErrorSpy).toHaveBeenCalledWith('State "nonExistentState" not found!');
        expect(game.currentState).toBe(game.states.menu);

        consoleErrorSpy.mockRestore();
    });
});