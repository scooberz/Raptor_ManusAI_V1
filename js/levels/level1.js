/**
 * Level1 class
 * Implements the first level of the game with sector-based terrain identity.
 */
import { EnemyFactory } from '../entities/enemyFactory.js';
import { EnvironmentFactory } from '../entities/environmentFactory.js';
import { BackgroundManager } from '../environment/BackgroundManager.js';
import { Collectible } from '../entities/collectible.js';
import { Tilemap } from '../environment/tilemap.js';
import { logger } from '../utils/logger.js';

const LEVEL1_TERRAIN_SECTIONS = [
    { id: 'coastal_outskirts', title: 'Coastal Outskirts', theme: 'coastal', waveRange: [0, 1], pickupAnchorX: 180 },
    { id: 'industrial_shoreline', title: 'Industrial Shoreline', theme: 'industrial', waveRange: [2, 3], pickupAnchorX: 620 },
    { id: 'bridge_corridor', title: 'Bridge Corridor', theme: 'bridge', waveRange: [4, 5], pickupAnchorX: 400 },
    { id: 'refinery_inlet', title: 'Refinery Inlet', theme: 'refinery', waveRange: [6, 7], pickupAnchorX: 560 },
    { id: 'hardened_complex', title: 'Hardened Complex', theme: 'military', waveRange: [8, 10], pickupAnchorX: 400 }
];

const LEVEL1_ENVIRONMENT_PLAN = {
    wave_01_coastal_pickett: [
        { type: 'COASTAL_RADAR', x: 110, y: -140, delay: 0 },
        { type: 'SHORE_BUNKER', x: 620, y: -240, delay: 1200 },
        { type: 'FUEL_TANK', x: 235, y: -360, delay: 2800 },
        { type: 'COASTAL_RADAR', x: 540, y: -500, delay: 5200 },
        { type: 'FUEL_DEPOT', x: 150, y: -620, delay: 7200, landmark: true }
    ],
    wave_02_harbor_intercept: [
        { type: 'SHORE_BUNKER', x: 120, y: -120, delay: 400 },
        { type: 'FUEL_TANK', x: 650, y: -240, delay: 1800 },
        { type: 'COASTAL_RADAR', x: 300, y: -420, delay: 4200 },
        { type: 'FUEL_DEPOT', x: 560, y: -620, delay: 7600 }
    ],
    wave_03_warehouse_crossing: [
        { type: 'SHORE_BUNKER', x: 140, y: -130, delay: 200 },
        { type: 'FUEL_DEPOT', x: 320, y: -260, delay: 1600 },
        { type: 'COASTAL_RADAR', x: 610, y: -410, delay: 3200 },
        { type: 'FUEL_DEPOT', x: 500, y: -640, delay: 7000, landmark: true }
    ],
    wave_04_factory_choke: [
        { type: 'SHORE_BUNKER', x: 80, y: -180, delay: 600 },
        { type: 'FUEL_DEPOT', x: 240, y: -340, delay: 2200 },
        { type: 'COASTAL_RADAR', x: 650, y: -520, delay: 4800 },
        { type: 'BRIDGE_TURRET', x: 400, y: -690, delay: 8400 }
    ],
    wave_05_bridge_lockdown: [
        { type: 'BRIDGE_TURRET', x: 110, y: -160, delay: 0, landmark: true },
        { type: 'BRIDGE_TURRET', x: 620, y: -160, delay: 0, landmark: true },
        { type: 'FUEL_DEPOT', x: 365, y: -360, delay: 2800 },
        { type: 'BRIDGE_TURRET', x: 240, y: -560, delay: 6200 },
        { type: 'BRIDGE_TURRET', x: 490, y: -560, delay: 6200 }
    ],
    wave_06_bridge_mine_run: [
        { type: 'BRIDGE_TURRET', x: 150, y: -180, delay: 500 },
        { type: 'REFINERY_TANK', x: 380, y: -320, delay: 2100, landmark: true },
        { type: 'REFINERY_TANK', x: 520, y: -460, delay: 3600 },
        { type: 'REFINERY_RADAR', x: 230, y: -640, delay: 5600 }
    ],
    wave_07_refinery_strike: [
        { type: 'REFINERY_TANK', x: 150, y: -180, delay: 200 },
        { type: 'REFINERY_TANK', x: 310, y: -240, delay: 1200 },
        { type: 'REFINERY_TANK', x: 490, y: -300, delay: 2200 },
        { type: 'REFINERY_RADAR', x: 650, y: -420, delay: 4200 },
        { type: 'FUEL_DEPOT', x: 380, y: -620, delay: 7600, landmark: true }
    ],
    wave_08_refinery_crossfire: [
        { type: 'REFINERY_TANK', x: 120, y: -200, delay: 400 },
        { type: 'REFINERY_RADAR', x: 300, y: -320, delay: 1900 },
        { type: 'REFINERY_TANK', x: 610, y: -520, delay: 4600 },
        { type: 'FUEL_DEPOT', x: 450, y: -700, delay: 7000 }
    ],
    wave_09_outer_wall: [
        { type: 'HARDENED_BUNKER', x: 100, y: -160, delay: 200, landmark: true },
        { type: 'COMMAND_RADAR', x: 610, y: -240, delay: 1600 },
        { type: 'HARDENED_BUNKER', x: 330, y: -420, delay: 3600 },
        { type: 'FUEL_DEPOT', x: 520, y: -640, delay: 6200 }
    ],
    wave_10_command_approach: [
        { type: 'COMMAND_RADAR', x: 180, y: -180, delay: 300 },
        { type: 'HARDENED_BUNKER', x: 560, y: -320, delay: 2200, landmark: true },
        { type: 'HARDENED_BUNKER', x: 280, y: -520, delay: 4800 },
        { type: 'COMMAND_RADAR', x: 410, y: -720, delay: 7600 }
    ],
    wave_11_boss_finale: []
};

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
        this.currentTerrainSection = null;
        this.sectionBannerTimer = 0;
        this.sectionBannerDuration = 2200;
        this.sectionBannerText = '';
        this.pendingWaveTransition = null;
    }

    async init() {
        try {
            const response = await fetch('js/levels/level1.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.levelData = await response.json();
            this.decorateLevelData();
            logger.info(`Successfully loaded level data: ${this.levelData.levelName}`);

            const bgImage = this.game.assets.getImage('backgroundLevel1');
            this.game.mainScrollSpeed = 50;
            this.background = new BackgroundManager(this.game, bgImage, this.game.mainScrollSpeed, this.levelData.terrainSections);
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
            this.pendingWaveTransition = null;
            this.applyTerrainForWave(0, true);

            this.game.audio.playMusic('gameMusic1');
        } catch (error) {
            logger.error('Failed to load level1.json:', error);
            throw error;
        }

        return this;
    }

    decorateLevelData() {
        this.levelData.terrainSections = LEVEL1_TERRAIN_SECTIONS.map((section) => ({ ...section }));
        this.levelData.waves = this.levelData.waves.map((wave, index) => {
            const section = this.getSectionForWaveIndex(index);
            const environmentObjects = LEVEL1_ENVIRONMENT_PLAN[wave.wave_id] || [];
            return {
                ...wave,
                sectionId: section?.id || null,
                environment_objects: [...(wave.environment_objects || []), ...environmentObjects.map((env) => ({ ...env }))]
            };
        });
    }

    getSectionForWaveIndex(index) {
        return this.levelData?.terrainSections?.find((section) => index >= section.waveRange[0] && index <= section.waveRange[1]) || null;
    }

    applyTerrainForWave(index, force = false) {
        const section = this.getSectionForWaveIndex(index);
        if (!section) {
            return;
        }

        if (!force && this.currentTerrainSection?.id === section.id) {
            return;
        }

        this.currentTerrainSection = section;
        this.sectionBannerText = section.title;
        this.sectionBannerTimer = this.sectionBannerDuration;
        if (this.background) {
            this.background.setActiveSection(section.id);
        }
        logger.info(`Entering terrain section: ${section.title}`);
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
        if (this.sectionBannerTimer > 0) {
            this.sectionBannerTimer -= deltaTime;
        }

        if (this.showBossWarning) {
            this.bossWarningTimer += deltaTime;
            this.bossHealthBarFill = Math.min(1, this.bossWarningTimer / this.bossWarningDuration);
            if (this.bossWarningTimer >= this.bossWarningDuration) {
                this.showBossWarning = false;
                this.spawnBoss();
            }
        } else if (this.pendingWaveTransition) {
            this.updatePendingWaveTransition(deltaTime);
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
        const waveTime = this.levelTime - this.waveStartTime;

        currentWave.enemies = currentWave.enemies || [];
        currentWave.environment_objects = currentWave.environment_objects || [];

        currentWave.enemies.forEach((enemyData) => {
            if (enemyData.delay <= waveTime && !enemyData.spawned) {
                this.spawnEnemy(enemyData);
                enemyData.spawned = true;
            }
        });

        currentWave.environment_objects.forEach((envData) => {
            if (envData.delay <= waveTime && !envData.spawned) {
                this.spawnEnvironmentObject(envData);
                envData.spawned = true;
            }
        });

        const allEnemiesSpawned = currentWave.enemies.every((enemy) => enemy.spawned);
        const allEnemiesCleared = this.game.collision.collisionGroups.enemies.length === 0;
        if (allEnemiesSpawned && allEnemiesCleared && waveTime > 1000) {
            const nextWave = this.levelData.waves[this.waveIndex + 1];
            if (nextWave?.isBossWave) {
                this.queueWaveTransition('boss_warning', nextWave.delay_after_previous_wave_ms || 2800, this.waveIndex + 1);
            } else if (nextWave) {
                this.queueWaveTransition('advance', nextWave.delay_after_previous_wave_ms || 1500, this.waveIndex + 1);
            }
        }
    }

    updatePendingWaveTransition(deltaTime) {
        if (!this.pendingWaveTransition) {
            return;
        }

        this.pendingWaveTransition.timer -= deltaTime;
        if (this.pendingWaveTransition.timer > 0) {
            return;
        }

        const { type, targetWaveIndex } = this.pendingWaveTransition;
        this.pendingWaveTransition = null;

        if (type === 'boss_warning') {
            this.triggerBossWarning(targetWaveIndex);
            return;
        }

        this.advanceToNextWave(targetWaveIndex);
    }

    queueWaveTransition(type, timer, targetWaveIndex) {
        if (this.pendingWaveTransition) {
            return;
        }

        this.pendingWaveTransition = {
            type,
            timer: Math.max(600, timer || 0),
            targetWaveIndex
        };
    }

    spawnEnemy(enemyData) {
        this.enemyFactory.createEnemy(enemyData, this);
    }

    spawnEnvironmentObject(envData) {
        this.environmentFactory.createEnvironmentObject(envData, this);
    }

    advanceToNextWave(targetWaveIndex = this.waveIndex + 1) {
        this.pendingWaveTransition = null;

        if (targetWaveIndex < this.levelData.waves.length) {
            this.waveIndex = targetWaveIndex;
            this.waveStartTime = this.levelTime;
            const nextWave = this.levelData.waves[this.waveIndex];
            const nextWaveName = nextWave.name || nextWave.wave_id || `Wave ${this.waveIndex + 1}`;
            logger.info(`Starting ${nextWaveName}`);
            this.applyTerrainForWave(this.waveIndex);
            this.maybeSpawnMidMissionPickup();
        }
    }

    forceNextWave() {
        if (!this.levelData) {
            return;
        }

        logger.debug('DEBUG: Forcing next wave.');
        this.pendingWaveTransition = null;
        const enemies = this.game.collision.collisionGroups.enemies;
        enemies.forEach((enemy) => {
            if (enemy.active) {
                enemy.destroy();
            }
        });

        const nextWave = this.levelData.waves[this.waveIndex + 1];
        if (nextWave?.isBossWave) {
            this.triggerBossWarning(this.waveIndex + 1);
        } else {
            this.advanceToNextWave();
        }
    }

    triggerBossWarning(targetWaveIndex = this.levelData.waves.findIndex((wave) => wave.isBossWave || wave.wave_id === 'wave_11_boss_finale')) {
        if (this.bossSpawned) {
            return;
        }

        this.waveIndex = Math.max(targetWaveIndex, this.waveIndex);
        this.pendingWaveTransition = null;
        const bossWave = this.levelData.waves[this.waveIndex];
        this.bossWarningDuration = bossWave?.boss_warning_duration_ms || 3000;
        this.showBossWarning = true;
        this.bossWarningTimer = 0;
        logger.info('BOSS APPROACHING!');
    }

    spawnBoss() {
        const bossWave = this.levelData.waves[this.waveIndex] || this.levelData.waves.find((wave) => wave.isBossWave || wave.wave_id === 'wave_11_boss_finale');
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

    getCurrentWave() {
        return this.levelData?.waves?.[this.waveIndex] || null;
    }

    getCurrentWaveLabel() {
        const wave = this.getCurrentWave();
        if (!wave) {
            return 'Wave 1';
        }

        return wave.name || `Wave ${Math.min(this.waveIndex + 1, this.levelData.waves.length)}`;
    }

    getCurrentThreatLabel() {
        const wave = this.getCurrentWave();
        if (this.bossSpawned) {
            return wave?.threatLabel || 'Flagship Engaged';
        }
        if (this.showBossWarning) {
            return 'Boss Approaching';
        }
        if (this.pendingWaveTransition?.type === 'boss_warning') {
            return 'Command Carrier Inbound';
        }
        if (this.pendingWaveTransition?.type === 'advance') {
            return 'Airspace Secured';
        }
        return wave?.threatLabel || 'Contract Airspace';
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

        if (!this.currentTerrainSection || this.currentTerrainSection.id !== 'bridge_corridor') {
            return;
        }

        const bounds = this.getPlayableBounds();
        const pickupX = this.translateLevelX(this.currentTerrainSection.pickupAnchorX) - 15;
        const collectible = new Collectible(this.game, pickupX, bounds.top - 60, 30, 30, 'weapon', 'MISSILE');
        this.game.entityManager.add(collectible);
        this.game.collision.addToGroup(collectible, 'collectibles');
        this.missilePickupSpawned = true;
        logger.info('Missile pickup deployed near the bridge corridor.');
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

        const ctxUI = contexts.ui;
        if (this.showBossWarning) {
            ctxUI.save();
            ctxUI.font = 'bold 48px Arial';
            ctxUI.fillStyle = 'yellow';
            ctxUI.textAlign = 'center';
            ctxUI.fillText('BOSS APPROACHING', this.game.width / 2, offsetY + 180);
            if (this.game.hasSystem('bossHealthIndicator')) {
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
            }
            ctxUI.restore();
        }

        this.renderBossIndicator(ctxUI, offsetY);

        if (this.sectionBannerTimer > 0 && this.sectionBannerText) {
            this.renderSectionBanner(contexts.ui, offsetY);
        }
    }

    renderSectionBanner(ctx, offsetY) {
        const alpha = Math.min(1, this.sectionBannerTimer / this.sectionBannerDuration + 0.15);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(6, 8, 12, 0.78)';
        ctx.fillRect(this.game.width / 2 - 180, offsetY + 20, 360, 56);
        ctx.strokeStyle = 'rgba(255, 204, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.game.width / 2 - 180, offsetY + 20, 360, 56);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 26px Arial';
        ctx.fillText(this.sectionBannerText, this.game.width / 2, offsetY + 56);
        ctx.restore();
    }

    getActiveBoss() {
        return this.game.collision?.collisionGroups?.enemies?.find((enemy) => enemy.isBoss && enemy.active) || null;
    }

    renderBossIndicator(ctxUI, offsetY) {
        const boss = this.getActiveBoss();
        if (!boss || !this.game.hasSystem('bossHealthIndicator')) {
            return;
        }

        const barWidth = 440;
        const barHeight = 18;
        const barX = (this.game.width - barWidth) / 2;
        const barY = offsetY + 18;
        ctxUI.save();
        ctxUI.fillStyle = 'rgba(0,0,0,0.76)';
        ctxUI.fillRect(barX, barY, barWidth, barHeight);
        ctxUI.fillStyle = '#d64848';
        ctxUI.fillRect(barX, barY, barWidth * (boss.health / Math.max(boss.maxHealth, 1)), barHeight);
        ctxUI.strokeStyle = '#ffffff';
        ctxUI.lineWidth = 2;
        ctxUI.strokeRect(barX, barY, barWidth, barHeight);
        ctxUI.fillStyle = '#ffcc00';
        ctxUI.font = 'bold 16px Arial';
        ctxUI.textAlign = 'center';
        ctxUI.fillText('BOSS STRUCTURAL READOUT', this.game.width / 2, barY - 20);
        ctxUI.restore();
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
        this.missilePickupSpawned = false;
        this.currentTerrainSection = null;
        this.sectionBannerTimer = 0;
        this.sectionBannerText = '';
        this.pendingWaveTransition = null;
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
