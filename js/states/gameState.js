/**
 * GameState class
 * Handles the main gameplay state
 */
import { Level1 } from '../levels/level1.js';
import { Level2 } from '../levels/level2.js';
import { Player } from '../entities/player.js';
import { HUD } from '../ui/hud.js';

class GameState {
    constructor(game) {
        this.game = game;
        this.name = 'game';  // Add name property for state identification
        this.level = 1;
        this.player = null;
        this.currentLevel = null;
        this.hud = null;
        this.gameTime = 0;
        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.levelCompleteDelay = 3000; // 3 seconds before next level
        this.isPaused = false;
        this.isInitializing = false;
        this.debugMode = false; // Add debug mode flag
    }
    
    /**
     * Enter the game state
     */
    async enter() {
        console.log('Entering Game State');
        
        // Prevent multiple rapid transitions
        if (this.isInitializing) return;
        this.isInitializing = true;
        
        // Initialize game components
        await this.initializeGame();
        this.isPaused = false;
        
        // Reset initialization flag after a short delay
        setTimeout(() => {
            this.isInitializing = false;
        }, 1000);
    }
    
    /**
     * Initialize game components
     */
    async initializeGame() {
        // Clear all old entities from the collision system to prevent "ghost" collisions.
        this.game.collision.clearAll();
        
        // Clear existing entities from the entity manager.
        this.game.entityManager.clear();
        
        // Reset game state
        this.gameTime = 0;
        this.levelComplete = false;
        this.level = 1;
        
        // Create player
        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 100);
        this.player.loadSprites();
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');
        this.game.player = this.player; // Store a global reference
        
        // Create HUD
        this.hud = new HUD(this.game);
        
        // Initialize the current level
        await this.initializeLevel();
        
        // Start level music
        this.game.audio.playMusic('level1Music');
    }
    
    /**
     * Initialize the current level
     */
    async initializeLevel() {
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }

        if (this.level === 1) {
            this.currentLevel = await new Level1(this.game).init(); // Use await for async init
        } else if (this.level === 2) {
            this.currentLevel = new Level2(this.game);
            this.currentLevel.init(); // Level2 still uses sync init for now
        } else {
            // No more levels, game is won
            this.game.changeState('gameover');
            return;
        }
    }
    
    /**
     * Update the game state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Don't update if the game is over or paused
        if (this.game.currentState !== this || this.isPaused) return;
        
        // Toggle debug mode with '1' key - only on key press, not hold
        if (this.game.input.wasKeyJustPressed('1')) {
            this.debugMode = !this.debugMode;
            console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
        }
        
        this.gameTime += deltaTime;
        
        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }
        
        this.game.entityManager.update(deltaTime);
        this.game.collision.checkCollisions();
        
        // In debug mode, player cannot die
        if (this.debugMode && this.player) {
            this.player.health = this.player.maxHealth;
        }
        
        // Check for level completion
        if (!this.levelComplete && this.currentLevel && this.currentLevel.isComplete()) {
            this.levelComplete = true;
            this.levelCompleteTime = this.gameTime;
        }
        
        // Handle level completion delay
        if (this.levelComplete) {
            if (this.gameTime - this.levelCompleteTime > this.levelCompleteDelay) {
                this.completeLevel();
            }
        }
        
        // Check for game over
        if (!this.player || !this.player.active) {
            this.game.changeState('gameover');
            return;
        }
        
        // Check for pause
        if (this.game.input.isKeyPressed('Escape') || this.game.input.isKeyPressed('p')) {
            this.isPaused = true;
            this.game.changeState('pause');
        }
    }
    
    /**
     * Render the game state
     * @param {Object} contexts - The canvas rendering contexts
     */
    render(contexts) {
        if (this.currentLevel) {
            this.currentLevel.render(contexts);
        }
        this.game.entityManager.render(contexts);
        this.hud.render(contexts.ui);
        
        // Render debug mode indicator
        if (this.debugMode) {
            const ctx = contexts.ui;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('DEBUG MODE', 10, 30);
        }
        
        // Render level complete message if needed
        if (this.levelComplete) {
            this.renderLevelComplete();
        }
    }
    
    /**
     * Render level complete message
     */
    renderLevelComplete() {
        const ctx = this.game.contexts.ui;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${this.level} Complete!`, this.game.width / 2, this.game.height / 2 - 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Loading next level...', this.game.width / 2, this.game.height / 2 + 30);
    }
    
    /**
     * Complete the current level and move to the next
     */
    completeLevel() {
        // If Level 1 is complete, go to hangar instead of next level
        if (this.level === 1) {
            this.game.changeState('hangar');
            return;
        }
        this.level++;
        this.initializeGame(); // This will handle loading the next level or ending the game
    }
    
    /**
     * Exit the game state
     */
    exit() {
        console.log('Exiting Game State');
        // Don't set isPaused here as it might be a temporary exit (pause)
        // Only cleanup if we're actually leaving the game
        if (this.game.currentState.name !== 'pause') {
            if (this.currentLevel) {
                this.currentLevel.cleanup();
            }
            // Clear references
            this.game.player = null;
            this.currentLevel = null;
        }
    }
}

export { GameState };
