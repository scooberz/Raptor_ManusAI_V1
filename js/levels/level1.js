/**
 * Level1 class
 * Implements the first level of the game with data-driven configuration
 */
import { EnemyFactory } from '../entities/enemyFactory.js';
import { EnvironmentFactory } from '../entities/environmentFactory.js';
import { BackgroundManager } from '../environment/BackgroundManager.js';
import { Tilemap } from '../environment/tilemap.js';

class Level1 {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.logicalGrid = null; // Renamed from tilemap
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

            // 1. Create scrolling background
            const bgImage = this.game.assets.getImage('backgroundLevel1');
            this.background = new BackgroundManager(this.game, bgImage, 50); // Use your desired scroll speed

            // 2. Create the logical grid (the old tilemap)
            this.logicalGrid = new Tilemap(this.game, this.levelData.tilemap, 50); // Must use same scroll speed!

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
        if (!this.levelData) return;
        if (this.game.input.skipWavePressed) {
            this.forceNextWave();
            this.game.input.skipWavePressed = false;
        }
        this.levelTime += deltaTime;
        this.background.update(deltaTime);
        this.logicalGrid.update(deltaTime);
        if (this.showBossWarning) {
            this.bossWarningTimer += deltaTime;
            this.bossHealthBarFill = Math.min(1, this.bossWarningTimer / this.bossWarningDuration);
            if (this.bossWarningTimer >= this.bossWarningDuration) {
                this.showBossWarning = false;
                this.spawnBoss();
            }
        } else if (!this.bossSpawned) {
            this.updateWave(deltaTime);
        }
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
        currentWave.enemies = currentWave.enemies || [];
        currentWave.environment_objects = currentWave.environment_objects || [];
        const waveTime = this.levelTime - this.waveStartTime;
        currentWave.enemies.forEach(enemyData => {
            if (enemyData.delay <= waveTime && !enemyData.spawned) {
                this.spawnEnemy(enemyData);
                enemyData.spawned = true;
            }
        });
        currentWave.environment_objects.forEach(envData => {
            if (envData.delay <= waveTime && !envData.spawned) {
                this.spawnEnvironmentObject(envData);
                envData.spawned = true;
            }
        });
        const allEnemiesSpawned = currentWave.enemies.every(e => e.spawned);
        const allEnemiesCleared = this.game.collision.collisionGroups.enemies.length === 0;
        if (allEnemiesSpawned && allEnemiesCleared && waveTime > 1000) {
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
        this.background.render(contexts.background);
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
        this.levelData = null;
        this.background = null;
        this.logicalGrid = null;
        this.enemyFactory = null;
        this.environmentFactory = null;
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