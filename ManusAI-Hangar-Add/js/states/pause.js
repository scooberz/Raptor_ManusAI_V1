/**
 * PauseState class
 * Handles the game pause state
 */
class PauseState {
    constructor(game) {
        this.game = game;
        this.previousState = null;
        this.menuOptions = [
            { text: 'Resume Game', action: () => this.resumeGame() },
            { text: 'Return to Menu', action: () => this.returnToMenu() }
        ];
        this.selectedOption = 0;
        this.keyDelay = 200;
        this.lastKeyTime = 0;
    }
    
    /**
     * Enter the pause state
     */
    enter() {
        console.log('Entering Pause State');
        
        // Store previous state
        this.previousState = this.game.currentState;
        
        // Pause audio
        this.game.audio.pauseMusic();
    }
    
    /**
     * Update the pause state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Handle keyboard navigation with delay
        if (now - this.lastKeyTime > this.keyDelay) {
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.lastKeyTime = now;
            }
            
            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.lastKeyTime = now;
            }
            
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
     */
    render() {
        // First render the previous state (game) to show it in the background
        if (this.previousState) {
            this.previousState.render();
        }
        
        const ctx = this.game.layers.ui;
        
        // Create semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw pause title
        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Paused', this.game.width / 2, this.game.height / 3);
        
        // Draw menu options
        ctx.font = '24px Arial';
        this.menuOptions.forEach((option, index) => {
            ctx.fillStyle = index === this.selectedOption ? '#ffcc00' : 'white';
            ctx.fillText(option.text, this.game.width / 2, this.game.height / 2 + index * 40);
        });
        
        // Draw controls reminder
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '16px Arial';
        ctx.fillText('Use Arrow Keys to navigate, Enter to select', this.game.width / 2, this.game.height - 50);
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        if (this.previousState) {
            this.game.currentState = this.previousState;
            
            // Resume audio
            this.game.audio.resumeMusic();
            
            console.log('Resuming Game');
        }
    }
    
    /**
     * Return to the main menu
     */
    returnToMenu() {
        this.game.changeState('menu');
    }
    
    /**
     * Exit the pause state
     */
    exit() {
        console.log('Exiting Pause State');
        this.previousState = null;
    }
}

