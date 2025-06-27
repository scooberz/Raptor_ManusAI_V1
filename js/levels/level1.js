/**
 * Level1 class
 * Implements the first level of the game with data-driven configuration
 */
import { EnemyFactory } from '../entities/enemyFactory.js';
import { EnvironmentFactory } from '../entities/environmentFactory.js';
import { BackgroundManager } from '../environment/BackgroundManager.js';

class Level1 {
    constructor(game) {
        this.game = game;
        this.levelData = null; // Will be populated by the async loader
        this.background = null;
        this.enemyFactory = null;
        this.waveIndex = 0;
        this.levelTime = 0;
        this.waveStartTime = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.levelComplete = false;
        this.showBossWarning = false;
        this.bossWarningTimer = 0;
        this.bossWarningDuration = 3000;
        this.bossHealthBarFill = 0;
        this.transitioning = false;
        this.environmentFactory = null;
    }

    /**
     * Initialize the level - this is the async constructor equivalent
     */
    async init() {
        try {
            const response = await fetch('js/levels/level1.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.levelData = await response.json();
            console.log(`Successfully loaded level data: ${this.levelData.levelName}`);

            // Create scrolling background if it doesn't exist
            if (!this.background) {
                const bgImage = this.game.assets.getImage('backgroundLevel1'); // Or your correct key
                this.background = new BackgroundManager(this.game, bgImage, 50);
            } else {
                this.background.reset();
            }

            // Create enemy factory
            this.enemyFactory = new EnemyFactory(this.game);

            // Create environment factory
            this.environmentFactory = new EnvironmentFactory(this.game);

            // Reset level state
            this.waveIndex = 0;
            this.levelTime = 0;
            this.waveStartTime = 0;
            this.bossSpawned = false;
            this.bossDefeated = false;
            this.levelComplete = false;
            this.showBossWarning = false;
            this.bossWarningTimer = 0;
            this.bossHealthBarFill = 0;
            this.transitioning = false;

            // Play level music
            this.game.audio.playMusic('gameMusic1');

        } catch (error) {
            console.error("Failed to load level1.json:", error);
            throw error;
        }
        return this; // Return the instance for chaining
    }

    /**
     * Update the level
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (!this.levelData) return; // Don't run if data failed to load

        // Check for wave-skipper debug feature
        if (this.game.input.skipWavePressed) {
            this.forceNextWave();
            this.game.input.skipWavePressed = false; // Reset the flag
        }

        this.levelTime += deltaTime;
        this.background.update(deltaTime);

        // Handle the boss warning sequence
        if (this.showBossWarning) {
            this.bossWarningTimer += deltaTime;
            this.bossHealthBarFill = Math.min(1, this.bossWarningTimer / this.bossWarningDuration);

            if (this.bossWarningTimer >= this.bossWarningDuration) {
                this.showBossWarning = false;
                this.spawnBoss();
            }
        } else if (!this.bossSpawned) {
            // If no boss warning, update the regular enemy waves
            this.updateWave(deltaTime);
        }

        // --- Check for Level Completion ---
        if (this.bossDefeated && !this.transitioning) {
            this.transitioning = true;
            this.levelComplete = true;
            console.log("Boss defeated! Transitioning to Hangar in 3 seconds...");
            setTimeout(() => {
                this.game.changeState('hangar');
            }, 3000);
        }
    }

    /**
     * Update the current wave
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateWave(deltaTime) {
        if (this.waveIndex >= this.levelData.waves.length) {
            return;
        }

        const currentWave = this.levelData.waves[this.waveIndex];
        // Ensure enemies and other arrays exist to prevent errors
        currentWave.enemies = currentWave.enemies || [];
        currentWave.environment_objects = currentWave.environment_objects || [];

        const waveTime = this.levelTime - this.waveStartTime;

        // Process enemy spawns for current wave
        currentWave.enemies.forEach(enemyData => {
            if (enemyData.delay <= waveTime && !enemyData.spawned) {
                this.spawnEnemy(enemyData);
                enemyData.spawned = true;
            }
        });

        // --- NEW: Spawn Environment Objects ---
        currentWave.environment_objects.forEach(envData => {
            if (envData.delay <= waveTime && !envData.spawned) {
                this.spawnEnvironmentObject(envData);
                envData.spawned = true;
            }
        });
        // --- END NEW ---

        // Check if wave is complete
        const allEnemiesSpawned = currentWave.enemies.every(e => e.spawned);
        const allEnemiesCleared = this.game.collision.collisionGroups.enemies.length === 0;

        if (allEnemiesSpawned && allEnemiesCleared && waveTime > 1000) { // Added 1s grace period
            // Check if this wave triggers the boss
            const nextWave = this.levelData.waves[this.waveIndex + 1];
            if (nextWave && nextWave.isBossWave) {
                this.triggerBossWarning();
            } else {
                this.advanceToNextWave();
            }
        }
    }

    /**
     * Spawn an enemy
     * @param {Object} enemyData - Enemy data object
     */
    spawnEnemy(enemyData) {
        this.enemyFactory.createEnemy(enemyData, this);
    }

    // --- NEW: Spawn Environment Object Method ---
    spawnEnvironmentObject(envData) {
        // Use the environment factory to create destructible objects
        this.environmentFactory.createEnvironmentObject(envData);
    }
    // --- END NEW ---

    advanceToNextWave() {
        if (this.waveIndex < this.levelData.waves.length - 1) {
            this.waveIndex++;
            this.waveStartTime = this.levelTime;
            const nextWaveName = this.levelData.waves[this.waveIndex].name || `Wave ${this.waveIndex + 1}`;
            console.log(`Starting ${nextWaveName}`);
        }
    }

    forceNextWave() {
        if (!this.levelData) return;

        console.log("DEBUG: Forcing next wave.");
        
        // Get enemies from collision system and destroy them
        const enemies = this.game.collision.collisionGroups.enemies;
        enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });

        this.advanceToNextWave();
    }

    triggerBossWarning() {
        if (this.bossSpawned) return;
        this.showBossWarning = true;
        this.bossWarningTimer = 0;
        console.log("BOSS APPROACHING!");
    }

    spawnBoss() {
        const bossWave = this.levelData.waves.find(w => w.isBossWave);
        if (bossWave && bossWave.enemies.length > 0) {
            const bossData = bossWave.enemies[0];
            this.spawnEnemy(bossData);
            this.bossSpawned = true;
        }
    }

    render(contexts) {
        if (this.background) {
            this.background.render(contexts.background);
        }
        if (this.showBossWarning) {
            const ctx = contexts.ui;
            ctx.save();
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS APPROACHING', this.game.width / 2, 180);
            const barWidth = 400; const barHeight = 20;
            const barX = (this.game.width - barWidth) / 2; const barY = 40;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = 'red';
            ctx.fillRect(barX, barY, barWidth * this.bossHealthBarFill, barHeight);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            ctx.restore();
        }
    }
    /**
     * Check if the level is complete
     * @returns {boolean} True if level is complete, false otherwise
     */
    isComplete() {
        return this.levelComplete;
    }

    /**
     * Cleanup the level when exiting
     */
    cleanup() {
        console.log('Cleaning up Level1');
        
        // Clear level data
        this.levelData = null;
        this.background = null;
        this.enemyFactory = null;
        this.environmentFactory = null;
        
        // Reset state
        this.waveIndex = 0;
        this.levelTime = 0;
        this.waveStartTime = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.levelComplete = false;
        this.showBossWarning = false;
        this.bossWarningTimer = 0;
        this.bossHealthBarFill = 0;
        this.transitioning = false;
    }
}

export { Level1 };