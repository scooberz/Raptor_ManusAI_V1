/**
 * Level1 class
 * Implements the first level of the game with data-driven configuration
 */
import { EnemyFactory } from '../entities/enemyFactory.js';
import { ScrollingBackground } from '../environment/scrolling-background.js';

class Level1 {
    constructor(game) {
        this.game = game;
        this.levelData = null; // Will be populated by the async loader
        this.background = null;
        this.enemyFactory = null;
        this.spawnQueue = [];
        this.collectibleQueue = [];
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
        this.currentWaveIndex = 0;
        this.waveTimer = 3000; // Default starting delay
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

            // Initialize based on loaded data
            this.currentWaveIndex = 0;
            if (this.levelData.waves && this.levelData.waves.length > 0) {
                this.waveTimer = this.levelData.waves[0].delay_after_previous_wave_ms || 3000;
            }

            // Create scrolling background if it doesn't exist
            if (!this.background) {
                this.background = new ScrollingBackground(this.game, 50, 1);
            } else {
                // Reset background if it exists
                this.background.reset();
            }

            // Create enemy factory
            this.enemyFactory = new EnemyFactory(this.game);

            // Reset level state
            this.spawnQueue = [];
            this.collectibleQueue = [];
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
            // Handle error, maybe by loading a default fallback level
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

        // This is the final, correct check for level completion.
        // In js/levels/level1.js, find and replace the old `if` block with this one.

        // --- Check for Level Completion ---
        if (this.bossDefeated && !this.transitioning) {
            this.transitioning = true; // This flag prevents the code from running more than once.
            console.log("Boss defeated! Transitioning to Hangar in 3 seconds...");

            // Wait 3 seconds before changing the state to give the player a moment.
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
        const waveTime = this.levelTime - this.waveStartTime;

        // Process enemy spawns for current wave
        currentWave.enemies.forEach(enemy => {
            if (enemy.delay <= waveTime && !enemy.spawned) {
                // Support for movement patterns
                this.spawnEnemy(enemy);
                enemy.spawned = true;
                // Do not set bossSpawned here; boss is spawned after warning
            }
        });

        // Check if wave is complete
        if (waveTime >= currentWave.duration) {
            // Check if all enemies from this wave are defeated
            const allEnemiesDefeated = currentWave.enemies.every(enemy => {
                return enemy.spawned && !this.isEnemyActive(enemy);
            });

            if (allEnemiesDefeated) {
                this.advanceToNextWave();

                // Check if we have now run out of normal waves
                const nextWave = this.levelData.waves[this.waveIndex];
                if (nextWave && nextWave.name === "Boss Wave") {
                    this.triggerBossWarning();
                }
            }
        }
    }

    /**
     * Spawn an enemy
     * @param {Object} enemyData - Enemy data object
     */
    spawnEnemy(enemyData) {
        // Pass the entire enemyData object to the factory
        this.enemyFactory.createEnemy(enemyData, this);
    }

    /**
     * Check if an enemy is still active
     * @param {Object} enemyData - Enemy data object
     * @returns {boolean} True if enemy is active, false otherwise
     */
    isEnemyActive(enemyData) {
        // Check if any enemies of this type are still active at the spawn position
        const enemies = this.game.collision.collisionGroups.enemies;
        return enemies.some(enemy => {
            return enemy.type === enemyData.type &&
                Math.abs(enemy.x - enemyData.spawn_x) < 10 &&
                enemy.active;
        });
    }

    /**
     * Advance to the next wave
     */
    advanceToNextWave() {
        this.waveIndex++;
        this.waveStartTime = this.levelTime;

        // Log wave change
        if (this.waveIndex < this.levelData.waves.length) {
            console.log(`Starting Wave ${this.waveIndex + 1}: ${this.levelData.waves[this.waveIndex].name}`);
        }
    }

    /**
     * Force advance to the next wave (debug feature)
     */
    forceNextWave() {
        if (!this.levelData) return;

        console.log("DEBUG: Forcing next wave.");

        // Clear out any remaining enemies from the current wave
        const enemies = this.game.collision.collisionGroups.enemies;
        enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });

        if (this.waveIndex < this.levelData.waves.length - 1) {
            this.waveIndex++;
            this.waveStartTime = this.levelTime;
            console.log(`DEBUG: Advanced to wave index ${this.waveIndex + 1}: ${this.levelData.waves[this.waveIndex].name}`);
        } else {
            console.log("DEBUG: Already on the last wave.");
        }
    }

    /**
     * Check if the level is complete
     */
    checkLevelCompletion() {
        if (this.bossDefeated && !this.transitioning) {
            this.transitioning = true; // Use a flag to prevent multiple calls
            setTimeout(() => {
                this.game.stateMachine.changeState('Hangar');
            }, 3000); // 3 second delay
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
     * Render the level
     * @param {object} contexts - Rendering contexts (e.g., { background, ui, ... })
     */
    render(contexts) {
        // Render background
        this.background.render(contexts.background);
        // Render boss warning UI
        if (this.showBossWarning) {
            const ctx = contexts.ui;
            ctx.save();
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS APPROACHING', this.game.width / 2, 180);
            // Draw boss health bar at top of screen, animating fill
            const barWidth = 400;
            const barHeight = 20;
            const barX = (this.game.width - barWidth) / 2;
            const barY = 40;
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
     * Clean up level resources
     */
    cleanup() {
        // Don't destroy the background, just reset it
        if (this.background) {
            this.background.reset();
        }

        // Clear other resources
        this.enemyFactory = null;
        this.spawnQueue = [];
        this.collectibleQueue = [];
    }

    // Boss warning sequence logic
    triggerBossWarning() {
        this.showBossWarning = true;
        this.bossWarningTimer = 0;
        this.bossWarningDuration = 3000; // 3 seconds
        this.bossHealthBarFill = 0;
        this.bossSpawned = false; // Ensure boss is not spawned yet
    }

    spawnBoss() {
        // Actually spawn the boss entity after warning
        const bossWave = this.levelData.waves.find(w => w.name === 'Boss Wave');
        if (bossWave && bossWave.enemies.length > 0) {
            const bossData = bossWave.enemies[0];
            this.spawnEnemy(bossData);
            this.bossSpawned = true;
        }
    }
}

export { Level1 }; 