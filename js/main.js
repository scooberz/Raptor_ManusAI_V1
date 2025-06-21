/**
 * Raptor: Call of the Shadows Reimagined
 * Main entry point for the game
 */
import { Game } from './engine/game.js';

window.addEventListener('load', () => {
    // Create and start the game
    const game = new Game();
    
    // Expose game to window for debugging
    window.game = game;
    
    console.log('Raptor: Call of the Shadows Reimagined - Game Initialized');
});

