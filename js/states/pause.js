/**
 * PauseState class
 * Handles the game pause state as a simple overlay without changing game states
 */
class PauseState {
    /**
     * Create a new PauseState instance
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
        this.isPaused = false;
        this.pauseOverlay = null;
        
        // Define menu options with their associated actions
        this.menuOptions = [
            { text: 'Resume Game', action: () => this.resumeGame() },
            { text: 'Save Game', action: () => this.saveGame() },
            { text: 'Return to Menu', action: () => this.returnToMenu() }
        ];
        
        this.selectedOption = 0;
        this.keyDelay = 200;
        this.lastKeyTime = 0;
        this.saveMessage = '';
        this.saveMessageTimeout = null;
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        if (this.isPaused) return;
        
        console.log('Pausing game with overlay');
        this.isPaused = true;
        
        // Pause game audio
        this.game.audio.pauseMusic();
        
        // Create the pause overlay
        this.createPauseOverlay();
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        if (!this.isPaused) return;
        
        console.log('Resuming game');
        this.isPaused = false;
        
        // Remove the pause overlay
        this.removePauseOverlay();
        
        // Resume game audio
        this.game.audio.resumeMusic();
    }
    
    /**
     * Create the pause overlay UI
     */
    createPauseOverlay() {
        // Create pause overlay container
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.id = 'pause-overlay';
        this.pauseOverlay.style.position = 'absolute';
        this.pauseOverlay.style.top = '0';
        this.pauseOverlay.style.left = '0';
        this.pauseOverlay.style.width = '100%';
        this.pauseOverlay.style.height = '100%';
        this.pauseOverlay.style.display = 'flex';
        this.pauseOverlay.style.flexDirection = 'column';
        this.pauseOverlay.style.alignItems = 'center';
        this.pauseOverlay.style.justifyContent = 'center';
        this.pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.pauseOverlay.style.zIndex = '1000';
        this.pauseOverlay.style.backdropFilter = 'blur(2px)';
        
        // Create title
        const title = document.createElement('div');
        title.textContent = 'PAUSED';
        title.style.color = '#ffcc00';
        title.style.fontSize = '36px';
        title.style.fontFamily = 'Arial';
        title.style.marginBottom = '40px';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        this.pauseOverlay.appendChild(title);
        
        // Create menu options as clickable buttons
        this.menuOptions.forEach((option, index) => {
            const button = document.createElement('div');
            button.textContent = option.text;
            button.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            button.style.fontSize = '24px';
            button.style.fontFamily = 'Arial';
            button.style.margin = '10px';
            button.style.padding = '10px 20px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.2s ease';
            button.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            button.style.borderRadius = '5px';
            
            // Add hover effect
            button.addEventListener('mouseenter', () => {
                button.style.color = '#ffcc00';
                button.style.transform = 'scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
                button.style.transform = 'scale(1)';
            });
            
            // Add click handler
            button.addEventListener('click', () => {
                option.action();
            });
            
            this.pauseOverlay.appendChild(button);
        });
        
        // Create save message container
        const saveMessageContainer = document.createElement('div');
        saveMessageContainer.id = 'pause-save-message';
        saveMessageContainer.style.color = '#00ff00';
        saveMessageContainer.style.fontSize = '20px';
        saveMessageContainer.style.fontFamily = 'Arial';
        saveMessageContainer.style.marginTop = '20px';
        saveMessageContainer.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        this.pauseOverlay.appendChild(saveMessageContainer);
        
        // Create controls reminder
        const controlsReminder = document.createElement('div');
        controlsReminder.textContent = 'Use Arrow Keys or W/S to navigate, Enter to select, or click buttons';
        controlsReminder.style.color = 'rgba(255, 255, 255, 0.5)';
        controlsReminder.style.fontSize = '16px';
        controlsReminder.style.fontFamily = 'Arial';
        controlsReminder.style.marginTop = '40px';
        controlsReminder.style.textAlign = 'center';
        this.pauseOverlay.appendChild(controlsReminder);
        
        // Add to document
        document.body.appendChild(this.pauseOverlay);
    }
    
    /**
     * Remove the pause overlay
     */
    removePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.remove();
            this.pauseOverlay = null;
        }
        
        // Clear any pending save message timeout
        if (this.saveMessageTimeout) {
            clearTimeout(this.saveMessageTimeout);
            this.saveMessageTimeout = null;
        }
    }
    
    /**
     * Update the pause state
     */
    update(deltaTime) {
        if (!this.isPaused) return;
        
        const now = Date.now();
        
        // Handle keyboard navigation with delay to prevent too rapid menu movement
        if (now - this.lastKeyTime > this.keyDelay) {
            let optionChanged = false;
            
            // Navigate up in menu
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.lastKeyTime = now;
                optionChanged = true;
            }
            
            // Navigate down in menu
            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.lastKeyTime = now;
                optionChanged = true;
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
            
            // Update button highlighting if option changed
            if (optionChanged) {
                this.updateButtonHighlighting();
            }
        }
    }
    
    /**
     * Update button highlighting based on selected option
     */
    updateButtonHighlighting() {
        if (!this.pauseOverlay) return;
        
        const buttons = this.pauseOverlay.querySelectorAll('div');
        // Skip the first div (title) and last two divs (save message and controls reminder)
        for (let i = 1; i < buttons.length - 2; i++) {
            const button = buttons[i];
            const optionIndex = i - 1;
            
            if (optionIndex === this.selectedOption) {
                button.style.color = '#ffcc00';
            } else {
                button.style.color = 'white';
            }
        }
    }
    
    /**
     * Save the current game
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
     */
    showSaveMessage(message) {
        this.saveMessage = message;
        
        // Update the HTML message container
        const saveMessageContainer = document.getElementById('pause-save-message');
        if (saveMessageContainer) {
            saveMessageContainer.textContent = message;
        }
        
        // Clear any existing timeout
        if (this.saveMessageTimeout) {
            clearTimeout(this.saveMessageTimeout);
        }
        
        // Set timeout to clear message after 2 seconds
        this.saveMessageTimeout = setTimeout(() => {
            this.saveMessage = '';
            if (saveMessageContainer) {
                saveMessageContainer.textContent = '';
            }
        }, 2000);
    }
    
    /**
     * Return to the main menu
     */
    returnToMenu() {
        // Remove the pause overlay
        this.removePauseOverlay();
        
        // Save game before returning to menu
        this.game.saveManager.saveGame();
        
        // Change to menu state
        this.game.changeState('menu');
    }
    
    /**
     * Render the pause overlay (called by game state when paused)
     */
    render(contexts) {
        // The pause overlay is rendered as HTML, so we don't need canvas rendering
    }
}

export { PauseState };

