/**
 * SaveManager class
 * Handles saving and loading game progress using the browser's localStorage API.
 * This class manages the persistence of game state between sessions, including
 * player progress, stats, and game time.
 */
class SaveManager {
    /**
     * Create a new SaveManager instance
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
        // Unique key for storing save data in localStorage
        this.saveKey = 'raptor_manus_save';
    }

    /**
     * Save the current game state to localStorage
     * Saves essential game data including level, player stats, and game time
     * @returns {boolean} True if save was successful, false otherwise
     */
    saveGame() {
        const gameState = this.game.states.game;
        if (!gameState) return false;

        // Create save data object with essential game information
        const saveData = {
            level: gameState.level,
            playerScore: gameState.player ? gameState.player.score : 0,
            playerLives: gameState.player ? gameState.player.lives : 3,
            playerHealth: gameState.player ? gameState.player.health : 100,
            gameTime: gameState.gameTime,
            timestamp: Date.now() // Store save timestamp for future reference
        };

        try {
            // Convert save data to JSON string and store in localStorage
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    /**
     * Load the saved game state from localStorage
     * @returns {Object|null} The saved game data or null if no save exists or if there was an error
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) return null;

            // Parse the JSON string back into an object
            return JSON.parse(saveData);
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }

    /**
     * Check if a saved game exists in localStorage
     * @returns {boolean} True if a saved game exists, false otherwise
     */
    hasSaveGame() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Delete the saved game from localStorage
     * @returns {boolean} True if deletion was successful, false otherwise
     */
    deleteSaveGame() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save game deleted');
            return true;
        } catch (error) {
            console.error('Error deleting save game:', error);
            return false;
        }
    }

    /**
     * Apply the loaded save data to the current game state
     * This method restores the game to the state it was in when saved
     * @param {Object} saveData - The saved game data to apply
     */
    applySaveData(saveData) {
        if (!saveData) return;

        const gameState = this.game.states.game;
        if (!gameState) return;

        // Restore the level and initialize the game
        gameState.level = saveData.level;
        gameState.initializeGame();

        // Restore player stats if player exists
        if (gameState.player) {
            gameState.player.score = saveData.playerScore;
            gameState.player.lives = saveData.playerLives;
            gameState.player.health = saveData.playerHealth;
        }

        // Restore game time
        gameState.gameTime = saveData.gameTime;
    }
}

export { SaveManager }; 