/**
 * Raptor: Call of the Shadows Reimagined
 * Main entry point for the game
 */

window.addEventListener('load', () => {
    // Create and start the game
    const game = new Game();
    
    // Expose game to window for debugging
    window.game = game;
    
    console.log('Raptor: Call of the Shadows Reimagined - Game Initialized');
});

