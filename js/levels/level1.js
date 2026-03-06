/**
 * Level1 class
 * Implements the first level of the game with data-driven configuration.
 */
import { EnemyFactory } from '../entities/enemyFactory.js';
import { EnvironmentFactory } from '../entities/environmentFactory.js';
import { BackgroundManager } from '../environment/BackgroundManager.js';
import { Collectible } from '../entities/collectible.js';
import { Tilemap } from '../environment/tilemap.js';
import { logger } from '../utils/logger.js';

class Level1 {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.logicalGrid = null;
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
        this.missilePickupSpawned = false;
        this.environmentFactory = null;
    }

    async init() {
        try {
            const response = await fetch('js/levels/level1.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.levelData = await response.json();
            logger.info(`Successfully loaded level data: ${this.levelData.levelName}`);

            const bgImage = this.game.assets.getImage('backgroundLevel1');
            this.game.mainScrollSpeed = 50;
            this.background = new BackgroundManager(this.game, bgImage, this.game.mainScrollSpeed);
            this.logicalGrid = new Tilemap(this.game, this.levelData.tilemap, this.game.mainScrollSpeed);
            this.enemyFactory = new EnemyFactory(this.game);
            this.environmentFactory = new EnvironmentFactory(this.game);

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
            this.missilePickupSpawned = false;

            this.game.audio.playMusic('gameMusic1');
        } catch (error) {
            logger.error('Failed to load level1.json:', error);
            throw error;
        }

        return this;
    }

    update(deltaTime) {
        if (!this.levelData) {
            return;
        }

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
            logger.info('Boss defeated. Waiting for mission complete handoff.');
        }
    }

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

        const allEnemiesSpawned = currentWave.enemies.every(enemy => enemy.spawned);
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

    spawnEnemy(enemyData) {
        this.enemyFactory.createEnemy(enemyData, this);
    }

    spawnEnvironmentObject(envData) {
        this.environmentFactory.createEnvironmentObject(envData);
    }

    advanceToNextWave() {
        if (this.waveIndex < this.levelData.waves.length - 1) {
            this.waveIndex++;
            this.waveStartTime = this.levelTime;
            const nextWaveName = this.levelData.waves[this.waveIndex].name || `Wave ${this.waveIndex + 1}`;
            logger.info(`Starting ${nextWaveName}`);
            this.maybeSpawnMidMissionPickup();
        }
    }

    forceNextWave() {
        if (!this.levelData) {
            return;
        }

        logger.debug('DEBUG: Forcing next wave.');
        const enemies = this.game.collision.collisionGroups.enemies;
        enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });
        this.advanceToNextWave();
    }

    triggerBossWarning() {
        if (this.bossSpawned) {
            return;
        }
        this.showBossWarning = true;
        this.bossWarningTimer = 0;
        logger.info('BOSS APPROACHING!');
    }

    spawnBoss() {
        const bossWave = this.levelData.waves.find(wave => wave.isBossWave);
        if (bossWave && bossWave.enemies.length > 0) {
            this.spawnEnemy(bossWave.enemies[0]);
            this.bossSpawned = true;
        }
    }

    static DESIGN_WIDTH = 800;
    static DESIGN_HEIGHT = 720;
    static PLAYABLE_WIDTH = 1024;
    static PLAYABLE_HEIGHT = 720;

    getPlayableOffset() {
        const offsetX = (this.game.width - Level1.PLAYABLE_WIDTH) / 2;
        const offsetY = (this.game.height - Level1.PLAYABLE_HEIGHT) / 2;
        return { offsetX, offsetY };
    }

    getPlayableBounds() {
        const { offsetX, offsetY } = this.getPlayableOffset();
        return {
            left: offsetX,
            top: offsetY,
            right: offsetX + Level1.PLAYABLE_WIDTH,
            bottom: offsetY + Level1.PLAYABLE_HEIGHT
        };
    }

    getDesignWidth() {
        return Level1.DESIGN_WIDTH;
    }

    getDesignHeight() {
        return Level1.DESIGN_HEIGHT;
    }

    translateLevelX(localX) {
        const { left } = this.getPlayableBounds();
        const scaleX = Level1.PLAYABLE_WIDTH / Level1.DESIGN_WIDTH;
        return left + (localX * scaleX);
    }

    translateLevelY(localY) {
        const { top } = this.getPlayableBounds();
        const scaleY = Level1.PLAYABLE_HEIGHT / Level1.DESIGN_HEIGHT;
        return top + (localY * scaleY);
    }

    maybeSpawnMidMissionPickup() {
        if (this.missilePickupSpawned || !this.levelData) {
            return;
        }

        const playerHasMissiles = this.game.player?.hasWeapon?.('MISSILE') || this.game.playerData?.unlockedWeapons?.includes('MISSILE');
        if (playerHasMissiles) {
            this.missilePickupSpawned = true;
            return;
        }

        const unlockWaveIndex = Math.max(1, Math.floor(this.levelData.waves.length / 2));
        if (this.waveIndex < unlockWaveIndex) {
            return;
        }

        const bounds = this.getPlayableBounds();
        const collectible = new Collectible(this.game, bounds.left + Level1.PLAYABLE_WIDTH / 2 - 15, bounds.top - 40, 30, 30, 'weapon', 'MISSILE');
        this.game.entityManager.add(collectible);
        this.game.collision.addToGroup(collectible, 'collectibles');
        this.missilePickupSpawned = true;
        logger.info('Missile pickup deployed in sector.');
    }

    render(contexts) {
        const { offsetX, offsetY } = this.getPlayableOffset();
        this.background.render(contexts.background, offsetX, offsetY, Level1.PLAYABLE_WIDTH, Level1.PLAYABLE_HEIGHT);

        const ctx = contexts.background;
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ffcc00';
        ctx.strokeRect(offsetX, offsetY, Level1.PLAYABLE_WIDTH, Level1.PLAYABLE_HEIGHT);
        ctx.restore();

        if (this.showBossWarning) {
            const ctxUI = contexts.ui;
            ctxUI.save();
            ctxUI.font = 'bold 48px Arial';
            ctxUI.fillStyle = 'yellow';
            ctxUI.textAlign = 'center';
            ctxUI.fillText('BOSS APPROACHING', this.game.width / 2, offsetY + 180);
            const barWidth = 400;
            const barHeight = 20;
            const barX = (this.game.width - barWidth) / 2;
            const barY = offsetY + 40;
            ctxUI.fillStyle = 'rgba(0,0,0,0.7)';
            ctxUI.fillRect(barX, barY, barWidth, barHeight);
            ctxUI.fillStyle = 'red';
            ctxUI.fillRect(barX, barY, barWidth * this.bossHealthBarFill, barHeight);
            ctxUI.strokeStyle = 'white';
            ctxUI.lineWidth = 2;
            ctxUI.strokeRect(barX, barY, barWidth, barHeight);
            ctxUI.restore();
        }
    }

    isComplete() {
        return this.levelComplete;
    }

    cleanup() {
        logger.info('Cleaning up Level1');
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

    resize() {
        if (this.background && typeof this.background.resize === 'function') {
            this.background.resize();
        }
        if (this.logicalGrid && typeof this.logicalGrid.resize === 'function') {
            this.logicalGrid.resize();
        }
    }
}

export { Level1 };






