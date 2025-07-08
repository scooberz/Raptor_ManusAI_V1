/**
 * GameState class
 * Handles the main gameplay state
 */
import { Level1 } from '../levels/level1.js';
import { Level2 } from '../levels/level2.js';
import { Player } from '../entities/player.js';
import { HUD } from '../ui/hud.js';
import { BackgroundManager } from '../environment/BackgroundManager.js';
import { EffectManager } from '../engine/effectManager.js';
import { logger } from '../utils/logger.js';

class GameState {
    constructor(game) {
        this.game = game;
        this.name = 'game';  // Add name property for state identification
        this.level = 1;
        this.player = null;
        this.currentLevel = null;
        this.hud = null;
        this.backgroundManager = null; // Changed from this.background
        this.gameTime = 0;
        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.levelCompleteDelay = 3000; // 3 seconds before next level
        this.isInitializing = false;
        this.debugMode = true; // Add debug mode flag
        this.effectManager = new EffectManager(); // Add effect manager
    }

    /**
     * Enter the game state
     */
    async enter() {
        logger.info('Entering Game State');

        // Prevent multiple rapid transitions
        if (this.isInitializing) return;
        this.isInitializing = true;

        // Initialize game components
        await this.initializeGame();

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
        if (this.game.currentState !== this) return;

        if (this.game.states.pause && this.game.states.pause.isPaused) return;

        // (Your existing debug mode toggles can stay here)
        if (this.game.input.wasKeyJustPressed('1')) {
            this.debugMode = !this.debugMode;
            logger.debug(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
        }

        // Restart level with '3' key (debug)
        if (this.game.input.restartLevelPressed) {
            logger.debug('Restarting current level...');
            this.restartLevel();
            this.game.input.restartLevelPressed = false; // Reset the flag
        }

        this.gameTime += deltaTime;

        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }

        this.game.entityManager.update(deltaTime);

        this.game.collision.checkCollisions();

        // Update effect manager
        this.effectManager.update(deltaTime);

        // (Your existing logic for debug invincibility, level completion, game over, etc., can stay here)
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

        // Check for pause - use the overlay approach
        if (this.game.input.isKeyPressed('Escape') || this.game.input.isKeyPressed('p')) {
            if (this.game.states.pause) {
                this.game.states.pause.togglePause();
            }
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
        this.effectManager.render(contexts.explosion);
        this.hud.render(contexts.ui);

        // Debug rendering to help identify issues
        if (this.debugMode) {
            const ctx = contexts.ui;

            // --- NEW FONT STYLE ---
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = 'white';     // Set the main text color to white
            ctx.strokeStyle = 'black';   // Set the outline color to black
            ctx.lineWidth = 4;           // Make the outline thick enough to be visible
            // ----------------------

            // --- UPDATED DRAWING LOGIC ---
            // For each line of text, we now draw the outline first, then the fill.
            ctx.strokeText('DEBUG MODE', 10, 30);
            ctx.fillText('DEBUG MODE', 10, 30);

            // 1. FPS (Frames Per Second)
            const fps = this.game.currentFPS || 0;
            ctx.strokeText(`FPS: ${fps}`, 10, 60);
            ctx.fillText(`FPS: ${fps}`, 10, 60);

            // 2. Current Game State
            const currentStateName = this.game.currentState.constructor.name;
            ctx.strokeText(`State: ${currentStateName}`, 10, 90);
            ctx.fillText(`State: ${currentStateName}`, 10, 90);

            // 3. Level/Wave Information (only show when in a level)
            if (this.currentLevel && this.currentLevel.levelData) {
                const waveIndex = this.currentLevel.waveIndex || 0;
                const totalWaves = this.currentLevel.levelData.waves ? this.currentLevel.levelData.waves.length : 0;
                ctx.strokeText(`Wave: ${waveIndex + 1} / ${totalWaves}`, 10, 120);
                ctx.fillText(`Wave: ${waveIndex + 1} / ${totalWaves}`, 10, 120);

                // Show next spawn timer if available
                if (this.currentLevel.waveStartTime !== undefined && this.currentLevel.levelTime !== undefined) {
                    const waveTime = this.currentLevel.levelTime - this.currentLevel.waveStartTime;
                    const currentWave = this.currentLevel.levelData.waves[waveIndex];
                    if (currentWave && currentWave.enemies) {
                        const nextSpawn = currentWave.enemies.find(e => !e.spawned);
                        if (nextSpawn) {
                            const timeUntilSpawn = Math.max(0, nextSpawn.delay - waveTime);
                            ctx.strokeText(`Next Spawn In: ${Math.round(timeUntilSpawn / 1000)}s`, 10, 150);
                            ctx.fillText(`Next Spawn In: ${Math.round(timeUntilSpawn / 1000)}s`, 10, 150);
                        }
                    }
                }
            }

            // Show player position and status
            if (this.player) {
                ctx.strokeText(`Player: ${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}`, 10, 180);
                ctx.fillText(`Player: ${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}`, 10, 180);
                ctx.strokeText(`Health: ${this.player.health}`, 10, 210);
                ctx.fillText(`Health: ${this.player.health}`, 10, 210);
                ctx.strokeText(`Visible: ${this.player.visible}`, 10, 240);
                ctx.fillText(`Visible: ${this.player.visible}`, 10, 240);
            } else {
                ctx.strokeText('Player: NULL', 10, 180);
                ctx.fillText('Player: NULL', 10, 180);
            }

            // Show game dimensions
            ctx.strokeText(`Game: ${this.game.width}x${this.game.height}`, 10, 270);
            ctx.fillText(`Game: ${this.game.width}x${this.game.height}`, 10, 270);

            // Show entity counts
            const entities = this.game.entityManager.entities;
            ctx.strokeText(`Entities: ${entities.length}`, 10, 300);
            ctx.fillText(`Entities: ${entities.length}`, 10, 300);

            // Show canvas contexts
            const contextKeys = Object.keys(contexts);
            ctx.strokeText(`Contexts: ${contextKeys.join(', ')}`, 10, 330);
            ctx.fillText(`Contexts: ${contextKeys.join(', ')}`, 10, 330);
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
        // Sync player stats with playerData before leaving
        if (this.player && this.game.playerData) {
            this.game.playerData.health = this.player.health;
            this.game.playerData.money = this.player.money;
            this.game.playerData.score = this.player.score;
            this.game.playerData.shield = this.player.shield;
            this.game.playerData.unlockedWeapons = this.player.unlockedWeapons;

            // Save to localStorage
            try {
                localStorage.setItem('raptor_manus_save', JSON.stringify(this.game.playerData));
                logger.info('Player data saved after level completion:', this.game.playerData);
            } catch (error) {
                logger.error('Error saving player data after level completion:', error);
            }
        }

        this.game.changeState('hangar');
    }

    /**
     * Restart the current level (debug function)
     */
    async restartLevel() {
        logger.info(`Restarting level ${this.level}...`);

        // Reset level completion state
        this.levelComplete = false;
        this.levelCompleteTime = 0;

        // Clear all entities except the player
        this.game.collision.clearAll();
        this.game.entityManager.clear();

        // Re-add the player
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');

        // Reset player position to starting position
        this.player.x = this.game.width / 2 - 32;
        this.player.y = this.game.height - 100;

        // Reset player health and shields (optional - comment out if you want to keep current health)
        // this.player.health = this.player.maxHealth;
        // this.player.shields = this.player.maxShields;

        // Reinitialize the current level
        await this.initializeLevel();

        logger.info(`Level ${this.level} restarted successfully`);
    }

    /**
     * Cycles to the next level for debugging purposes.
     * If the current level is the last one, it loops back to the first level.
     */
    async cycleLevel() {
        logger.info("Cycling level...");
        this.level++;
        // Assuming you have a maximum number of levels, e.g., 2
        const maxLevels = 2; // Adjust this based on your actual number of levels
        if (this.level > maxLevels) {
            this.level = 1;
        }

        // Reset level completion state
        this.levelComplete = false;
        this.levelCompleteTime = 0;

        // Clear all entities except the player
        this.game.collision.clearAll();
        this.game.entityManager.clear();

        // Re-add the player
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');

        // Reset player position to starting position
        this.player.x = this.game.width / 2 - 32;
        this.player.y = this.game.height - 100;

        // Reinitialize the current level
        await this.initializeLevel();

        logger.info(`Cycled to level ${this.level}`);
    }

    /**
     * Exit the game state
     */
    exit() {
        logger.info('Exiting Game State');

        // Clear effect manager
        this.effectManager.clear();

        // Full cleanup when leaving the game
        if (this.currentLevel && typeof this.currentLevel.cleanup === 'function') {
            this.currentLevel.cleanup();
        }

        // Clear references
        this.game.player = null;
        this.currentLevel = null;
    }
}

export { GameState };
