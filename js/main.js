/**
 * Raptor: Call of the Shadows Reimagined
 * Main entry point for the game
 */
logger.info('main.js: Starting to load...');

import { Game } from './engine/game.js';
import { logger } from './utils/logger.js';
logger.info('main.js: Game class imported successfully');

// Function to start the game
function startGame() {
    logger.info('main.js: Starting game...');
    try {
        // Create and start the game
        const game = new Game();
        logger.info('main.js: Game instance created successfully');
        
        // Expose game to window for debugging
        window.game = game;
        
        logger.info('Raptor: Call of the Shadows Reimagined - Game Initialized');
    } catch (error) {
        logger.error('main.js: Error creating game instance:', error);
    }
}

// Check if the window is already loaded
if (document.readyState === 'complete') {
    logger.info('main.js: Window already loaded, starting game immediately');
    startGame();
} else {
    logger.info('main.js: Window not loaded yet, waiting for load event');
    window.addEventListener('load', () => {
        logger.info('main.js: Window load event fired');
        startGame();
    });
}

logger.info('main.js: Event listener added successfully');

