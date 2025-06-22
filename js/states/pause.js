/**
 * PauseState class
 * Handles the game pause state, providing a menu interface for saving the game,
 * resuming gameplay, or returning to the main menu. This state overlays the
 * current game state without destroying it, allowing for seamless resumption.
 */
class PauseState {
    /**
     * Create a new PauseState instance
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
        this.previousState = null;
        
        // Define menu options with their associated actions
        this.menuOptions = [
            { text: 'Resume Game', action: async () => await this.resumeGame() },
            { text: 'Save Game', action: () => this.saveGame() },
            { text: 'Return to Menu', action: () => this.returnToMenu() }
        ];
        
        this.selectedOption = 0;
        this.keyDelay = 200; // Delay between key presses to prevent too rapid menu navigation
        this.lastKeyTime = 0;
        this.saveMessage = ''; // Message to display after save attempt
        this.saveMessageTimeout = null; // Timeout for clearing save message
    }
    
    /**
     * Enter the pause state
     * Stores the previous state and pauses game audio
     */
    enter() {
        console.log('Entering Pause State');
        
        // Store previous state for resuming later
        this.previousState = this.game.currentState;
        
        // Pause game audio
        this.game.audio.pauseMusic();
    }
    
    /**
     * Update the pause state
     * Handles menu navigation and option selection
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Handle keyboard navigation with delay to prevent too rapid menu movement
        if (now - this.lastKeyTime > this.keyDelay) {
            // Navigate up in menu
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.lastKeyTime = now;
            }
            
            // Navigate down in menu
            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.lastKeyTime = now;
            }
            
            // Select current menu option
            if (this.game.input.isKeyPressed('Enter') || this.game.input.isKeyPressed(' ')) {
                this.menuOptions[this.selectedOption].action();
                this.lastKeyTime = now;
            }
            
            // Resume game if Escape or P is pressed
            if (this.game.input.isKeyPressed('Escape') || this.game.input.isKeyPressed('p')) {
                this.resumeGame();
                this.lastKeyTime = now;
            }
        }
    }
    
    /**
     * Render the pause state
     * Draws the pause menu overlay with options and any save messages
     */
    render() {
        const ctx = this.game.contexts.ui;
        
        // Draw semi-transparent overlay to dim the game
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw menu title
        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', this.game.width / 2, this.game.height / 3);
        
        // Draw menu options with highlighting for selected option
        ctx.font = '24px Arial';
        this.menuOptions.forEach((option, index) => {
            ctx.fillStyle = index === this.selectedOption ? '#ffcc00' : 'white';
            ctx.fillText(option.text, this.game.width / 2, this.game.height / 2 + index * 40);
        });
        
        // Draw save message if exists
        if (this.saveMessage) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px Arial';
            ctx.fillText(this.saveMessage, this.game.width / 2, this.game.height / 2 + 160);
        }
        
        // Draw controls reminder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.fillText('Use Arrow Keys or W/S to navigate, Enter to select', this.game.width / 2, this.game.height - 50);
    }
    
    /**
     * Resume the game
     * Restores the previous state and resumes game audio
     */
    async resumeGame() {
        if (this.previousState) {
            // Resume game audio
            this.game.audio.resumeMusic();
            
            // Set the previous state's paused flag to false
            this.previousState.isPaused = false;
            
            // If we have a game state, ensure the background is properly restored
            if (this.previousState.name === 'game' && this.previousState.currentLevel) {
                // Ensure the background is properly initialized
                if (this.previousState.currentLevel.background) {
                    this.previousState.currentLevel.background.reset();
                }
            }
            
            // Use the proper state transition mechanism
            await this.game.changeState('game');
            
            console.log('Resuming Game');
        }
    }
    
    /**
     * Save the current game
     * Attempts to save the game and displays appropriate feedback
     */
    saveGame() {
        if (this.game.saveManager.saveGame()) {
            this.showSaveMessage('Game saved successfully!');
        } else {
            this.showSaveMessage('Failed to save game.');
        }
    }
    
    /**
     * Show a temporary save message
     * Displays a message that automatically fades out after a delay
     * @param {string} message - The message to display
     */
    showSaveMessage(message) {
        this.saveMessage = message;
        
        // Clear any existing timeout
        if (this.saveMessageTimeout) {
            clearTimeout(this.saveMessageTimeout);
        }
        
        // Set timeout to clear message after 2 seconds
        this.saveMessageTimeout = setTimeout(() => {
            this.saveMessage = '';
        }, 2000);
    }
    
    /**
     * Return to the main menu
     * Saves the game before transitioning to the menu state
     */
    returnToMenu() {
        // Save game before returning to menu
        this.game.saveManager.saveGame();
        
        // Change to menu state
        this.game.changeState('menu');
    }

    exit() {
        console.log('Exiting Pause State');
    }
}

export { PauseState };

