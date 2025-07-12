/**
 * @jest-environment jsdom
 */

import { Game } from '../../js/engine/game.js';
import { setupGameMocks, createMockState } from '../mocks/game-test-helpers.js';

describe('Game State Machine', () => {
    let game;

    beforeAll(() => {
        setupGameMocks();
    });

    beforeEach(() => {
        game = new Game();
        
        // Mock all states to prevent complex initialization
        game.states = {
            boot: createMockState('boot'),
            menu: createMockState('menu'),
            game: createMockState('game'),
            gameover: createMockState('gameover'),
            pause: createMockState('pause')
        };
        
        // Set initial state
        game.currentState = game.states.menu;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should start in the BootState by default', () => {
        const newGame = new Game();
        expect(newGame.currentState).toBe(newGame.states.boot);
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

    test('should handle state transitions correctly', async () => {
        const states = ['menu', 'game', 'pause', 'gameover'];
        
        for (let i = 0; i < states.length - 1; i++) {
            const currentState = game.states[states[i]];
            const nextState = game.states[states[i + 1]];
            
            await game.changeState(states[i + 1]);
            
            expect(currentState.exit).toHaveBeenCalledTimes(1);
            expect(nextState.enter).toHaveBeenCalledTimes(1);
            expect(game.currentState).toBe(nextState);
            
            // Reset mocks for next iteration
            currentState.exit.mockClear();
            nextState.enter.mockClear();
        }
    });
}); 