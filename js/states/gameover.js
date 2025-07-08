/**
 * GameOverState class
 * Handles the game over state
 */
import { logger } from '../utils/logger.js';
class GameOverState {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.victory = false;
        this.menuOptions = [
            { text: 'Play Again', action: () => this.playAgain() },
            { text: 'Return to Menu', action: () => this.returnToMenu() }
        ];
        this.selectedOption = 0;
        this.keyDelay = 200;
        this.lastKeyTime = 0;
    }
    
    /**
     * Enter the game over state
     */
    enter() {
        logger.info('Entering Game Over State');
        
        // Show game over screen
        document.getElementById('game-over-screen').style.display = 'flex';
        
        // Get player score
        if (this.game.player) {
            this.score = this.game.player.score;
        }
        
        // Check if player completed all levels (victory)
        if (this.game.states.game && this.game.states.game.level > 2) {
            this.victory = true;
        }
        
        // Set up game over screen
        this.setupGameOverScreen();
    }
    
    /**
     * Set up the game over screen
     */
    setupGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        gameOverScreen.innerHTML = '';
        
        // Create game over container
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        // Add title
        const title = document.createElement('h1');
        title.textContent = this.victory ? 'Victory!' : 'Game Over';
        title.style.color = this.victory ? '#ffcc00' : '#ff3333';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        container.appendChild(title);
        
        // Add message
        const message = document.createElement('p');
        message.textContent = this.victory ? 
            'Congratulations! You have completed all levels!' : 
            'Your ship has been destroyed!';
        message.style.color = 'white';
        message.style.fontSize = '24px';
        message.style.marginBottom = '30px';
        container.appendChild(message);
        
        // Add score
        const score = document.createElement('p');
        score.textContent = `Final Score: ${this.score}`;
        score.style.color = '#ffcc00';
        score.style.fontSize = '36px';
        score.style.marginBottom = '40px';
        container.appendChild(score);
        
        // Add menu options
        this.menuOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.textContent = option.text;
            optionElement.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            optionElement.style.fontSize = '24px';
            optionElement.style.margin = '10px';
            optionElement.style.cursor = 'pointer';
            optionElement.style.textShadow = index === this.selectedOption ? '0 0 10px #ffcc00' : 'none';
            
            // Add hover effect
            optionElement.addEventListener('mouseover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            
            // Add click handler
            optionElement.addEventListener('click', option.action);
            
            container.appendChild(optionElement);
        });
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.bottom = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '16px';
        instructions.textContent = 'Use Arrow Keys to navigate, Enter to select';
        container.appendChild(instructions);
        
        gameOverScreen.appendChild(container);
    }
    
    /**
     * Update menu selection highlighting
     */
    updateMenuSelection() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const options = gameOverScreen.querySelectorAll('div > div:not(:last-child)');
        
        options.forEach((option, index) => {
            option.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            option.style.textShadow = index === this.selectedOption ? '0 0 10px #ffcc00' : 'none';
        });
    }
    
    /**
     * Update the game over state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Handle keyboard navigation with delay
        if (now - this.lastKeyTime > this.keyDelay) {
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }
            
            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }
            
            if (this.game.input.isKeyPressed('Enter') || this.game.input.isKeyPressed(' ')) {
                this.menuOptions[this.selectedOption].action();
                this.lastKeyTime = now;
            }
        }
    }
    
    /**
     * Render the game over state
     */
    render() {
        // Game over is rendered using HTML/CSS in the game-over-screen element
    }
    
    /**
     * Play the game again
     */
    playAgain() {
        // Reset game state
        if (this.game.states.game) {
            this.game.states.game.level = 1;
        }
        
        // Change to game state
        this.game.changeState('game');
    }
    
    /**
     * Return to the main menu
     */
    returnToMenu() {
        this.game.changeState('menu');
    }
    
    /**
     * Exit the game over state
     */
    exit() {
        logger.info('Exiting Game Over State');
        
        // Hide game over screen
        document.getElementById('game-over-screen').style.display = 'none';
    }
}

export { GameOverState };

