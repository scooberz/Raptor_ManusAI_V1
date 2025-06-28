/**
 * Raptor: Call of the Shadows Reimagined
 * Main entry point for the game
 */
console.log('main.js: Starting to load...');

import { Game } from './engine/game.js';
console.log('main.js: Game class imported successfully');

// Function to start the game
function startGame() {
    console.log('main.js: Starting game...');
    try {
        // Create and start the game
        const game = new Game();
        console.log('main.js: Game instance created successfully');
        
        // Expose game to window for debugging
        window.game = game;
        
        console.log('Raptor: Call of the Shadows Reimagined - Game Initialized');
    } catch (error) {
        console.error('main.js: Error creating game instance:', error);
    }
}

// Check if the window is already loaded
if (document.readyState === 'complete') {
    console.log('main.js: Window already loaded, starting game immediately');
    startGame();
} else {
    console.log('main.js: Window not loaded yet, waiting for load event');
    window.addEventListener('load', () => {
        console.log('main.js: Window load event fired');
        startGame();
    });
}

console.log('main.js: Event listener added successfully');

