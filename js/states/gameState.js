/**
 * GameState class
 * Handles the main gameplay state.
 */
import { Level1 } from '../levels/level1.js';
import { Level2 } from '../levels/level2.js';
import { Player } from '../entities/player.js';
import { HUD } from '../ui/hud.js';
import { EffectManager } from '../engine/effectManager.js';
import { logger } from '../utils/logger.js';

class GameState {
    constructor(game) {
        this.game = game;
        this.name = 'game';
        this.level = 1;
        this.player = null;
        this.currentLevel = null;
        this.hud = null;
        this.gameTime = 0;
        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.levelCompleteDelay = 2200;
        this.isInitializing = false;
        this.debugMode = false;
        this.effectManager = new EffectManager();
        this.supportedMissionLevels = [1];
        this.missionStats = null;
    }

    getHighestSupportedLevel() {
        return Math.max(...this.supportedMissionLevels);
    }

    getRequestedMissionLevel(level) {
        const requested = Math.max(1, Number(level) || 1);
        return Math.min(requested, this.getHighestSupportedLevel());
    }

    initializeMissionStats() {
        const missionProfile = this.game.getMissionProfile(this.level);
        this.missionStats = {
            missionLevel: this.level,
            missionTitle: missionProfile.title,
            missionCode: missionProfile.codeName,
            landingText: missionProfile.landingText,
            startScore: this.game.playerData?.score || 0,
            startMoney: this.game.playerData?.money || 0,
            airTargetsDestroyed: 0,
            groundTargetsDestroyed: 0,
            airKillsByType: {},
            groundKillsByType: {},
            sectionsVisited: new Map(),
            startedAt: Date.now()
        };
    }

    recordVisitedSection(section) {
        if (!section || !this.missionStats) {
            return;
        }

        if (!this.missionStats.sectionsVisited.has(section.id)) {
            this.missionStats.sectionsVisited.set(section.id, section.title || section.id);
        }
    }

    recordAirKill(type) {
        if (!this.missionStats) {
            return;
        }

        this.missionStats.airTargetsDestroyed += 1;
        this.missionStats.airKillsByType[type] = (this.missionStats.airKillsByType[type] || 0) + 1;
    }

    recordGroundKill(type) {
        if (!this.missionStats) {
            return;
        }

        this.missionStats.groundTargetsDestroyed += 1;
        this.missionStats.groundKillsByType[type] = (this.missionStats.groundKillsByType[type] || 0) + 1;
    }

    buildMissionResult(completed = true) {
        const playerData = this.game.playerData || {};
        const missionProfile = this.game.getMissionProfile(this.level);
        const sectionsVisited = this.missionStats ? [...this.missionStats.sectionsVisited.values()] : [];
        const missionResult = {
            missionLevel: this.level,
            missionTitle: missionProfile.title,
            missionCode: missionProfile.codeName,
            scoreEarned: Math.max(0, (this.player?.score ?? playerData.score ?? 0) - (this.missionStats?.startScore || 0)),
            moneyEarned: Math.max(0, (this.player?.money ?? playerData.money ?? 0) - (this.missionStats?.startMoney || 0)),
            airTargetsDestroyed: this.missionStats?.airTargetsDestroyed || 0,
            groundTargetsDestroyed: this.missionStats?.groundTargetsDestroyed || 0,
            airKillsByType: { ...(this.missionStats?.airKillsByType || {}) },
            groundKillsByType: { ...(this.missionStats?.groundKillsByType || {}) },
            sectionsVisited,
            difficulty: playerData.difficulty,
            shipId: playerData.shipId,
            primaryWeaponLevel: playerData.primaryWeaponLevel,
            landingText: missionProfile.landingText,
            completed,
            completedAt: Date.now()
        };
        missionResult.baseScore = this.game.calculateMissionScore(missionResult);
        return missionResult;
    }

    async enter(context = {}) {
        logger.info('Entering Game State');

        if (this.isInitializing) {
            return;
        }

        this.isInitializing = true;
        const campaignLevel = context.missionLevel || this.game.playerData?.level || this.level || 1;
        this.level = this.getRequestedMissionLevel(campaignLevel);

        try {
            await this.initializeGame();
        } finally {
            window.setTimeout(() => {
                this.isInitializing = false;
            }, 250);
        }
    }

    async initializeGame() {
        this.game.collision.clearAll();
        this.game.entityManager.clear();
        this.effectManager.clear();

        this.gameTime = 0;
        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.game.states.pause.isPaused = false;
        this.initializeMissionStats();

        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 120);
        this.player.loadSprites();
        if (this.game.hasSystem('reactiveShieldEmitter') && this.player.maxShield > 0) {
            this.player.shield = this.player.maxShield;
            this.game.playerData.shield = this.player.shield;
        }
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');
        this.game.player = this.player;

        this.hud = new HUD(this.game);

        await this.initializeLevel();
        this.syncPlayerData();
    }

    async initializeLevel() {
        if (this.currentLevel && typeof this.currentLevel.cleanup === 'function') {
            this.currentLevel.cleanup();
        }

        switch (this.level) {
            case 1:
                this.currentLevel = await new Level1(this.game).init();
                break;
            case 2:
                this.currentLevel = new Level2(this.game);
                this.currentLevel.init();
                break;
            default:
                this.currentLevel = await new Level1(this.game).init();
                this.level = 1;
                break;
        }

        if (this.currentLevel?.currentTerrainSection) {
            this.recordVisitedSection(this.currentLevel.currentTerrainSection);
        }
    }

    syncPlayerData() {
        if (!this.player) {
            return;
        }

        const merged = this.game.setPlayerData({
            ...this.game.playerData,
            level: this.level,
            health: this.player.health,
            maxHealth: this.player.maxHealth,
            money: this.player.money,
            score: this.player.score,
            shield: this.player.shield,
            maxShield: this.player.maxShield,
            megabombs: this.player.megabombs,
            ownedSecondaryWeapons: this.player.ownedSecondaryWeapons,
            unlockedWeapons: this.player.ownedSecondaryWeapons,
            equippedSecondaryWeapon: this.player.equippedSecondaryWeapon,
            primaryWeaponLevel: this.player.weapons?.CANNON?.level || this.game.playerData?.primaryWeaponLevel || 1,
            shipId: this.player.shipProfile?.id || this.game.playerData?.shipId
        });

        this.level = merged.level;
    }

    getPlayableBounds() {
        if (this.currentLevel && typeof this.currentLevel.getPlayableBounds === 'function') {
            return this.currentLevel.getPlayableBounds();
        }
        return { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
    }

    update(deltaTime) {
        if (this.game.currentState !== this) {
            return;
        }

        if (this.game.states.pause && this.game.states.pause.isPaused) {
            this.game.states.pause.update(deltaTime);
            return;
        }

        if (this.game.input.wasKeyJustPressed('1')) {
            this.debugMode = !this.debugMode;
            logger.debug(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
        }

        if (this.game.input.restartLevelPressed) {
            logger.debug('Restarting current level...');
            this.restartLevel();
            this.game.input.restartLevelPressed = false;
        }

        this.gameTime += deltaTime;

        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
            if (this.currentLevel.currentTerrainSection) {
                this.recordVisitedSection(this.currentLevel.currentTerrainSection);
            }
        }

        this.game.entityManager.update(deltaTime);
        this.game.collision.checkCollisions();
        this.effectManager.update(deltaTime);

        if (!this.levelComplete && this.currentLevel && this.currentLevel.isComplete()) {
            this.levelComplete = true;
            this.levelCompleteTime = this.gameTime;
            this.syncPlayerData();
        }

        if (this.levelComplete && this.gameTime - this.levelCompleteTime > this.levelCompleteDelay) {
            this.completeLevel();
            return;
        }

        if (!this.player || !this.player.active) {
            this.syncPlayerData();
            this.game.changeState('gameover');
            return;
        }

        if (this.game.input.wasKeyJustPressed('Escape') || this.game.input.wasKeyJustPressed('p')) {
            if (this.game.states.pause) {
                this.game.states.pause.togglePause();
            }
        }
    }

    render(contexts) {
        if (this.currentLevel) {
            this.currentLevel.render(contexts);
        }

        this.game.entityManager.render(contexts);
        this.effectManager.render(contexts.explosion);

        if (this.hud) {
            this.hud.render(contexts.ui);
        }

        if (this.debugMode) {
            this.renderDebugInfo(contexts.ui);
        }

        if (this.levelComplete) {
            this.renderLevelComplete();
        }
    }

    renderDebugInfo(ctx) {
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;

        const lines = [
            'DEBUG MODE',
            `FPS: ${this.game.currentFPS || 0}`,
            `State: ${this.game.currentState?.constructor?.name || 'Unknown'}`,
            `Level: ${this.level}`,
            `Entities: ${this.game.entityManager.entities.length}`
        ];

        if (this.player) {
            lines.push(`Player: ${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}`);
            lines.push(`Health: ${this.player.health}`);
            lines.push(`Money: ${this.player.money}`);
        }

        lines.forEach((line, index) => {
            const y = 30 + index * 30;
            ctx.strokeText(line, 10, y);
            ctx.fillText(line, 10, y);
        });
    }

    renderLevelComplete() {
        const ctx = this.game.contexts.ui;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Mission ${this.level} Complete`, this.game.width / 2, this.game.height / 2 - 20);

        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Proceeding to landing report...', this.game.width / 2, this.game.height / 2 + 30);
    }

    completeLevel() {
        const completedLevel = this.level;
        const damageControlRepair = this.game.hasSystem('damageControlKit') ? 20 : 0;
        if (damageControlRepair > 0 && this.player) {
            this.player.addHealth(damageControlRepair);
        }
        const missionResult = this.buildMissionResult(true);
        const lastCompletedLevel = Math.max(this.game.playerData?.lastCompletedLevel || 0, completedLevel);
        const nextSupportedLevel = this.getRequestedMissionLevel(lastCompletedLevel + 1);
        const priorResults = Array.isArray(this.game.playerData?.missionResults) ? this.game.playerData.missionResults : [];
        const updatedMissionResults = [...priorResults, missionResult].slice(-12);
        const eventFlags = {
            ...(this.game.playerData?.eventFlags || {}),
            [`mission_${completedLevel}_complete`]: true,
            [`route_${this.game.playerData?.shipId || 'raptor'}`]: true
        };

        this.game.setPlayerData({
            ...this.game.playerData,
            health: this.player?.health ?? this.game.playerData?.health,
            maxHealth: this.player?.maxHealth ?? this.game.playerData?.maxHealth,
            money: this.player?.money ?? this.game.playerData?.money,
            score: this.player?.score ?? this.game.playerData?.score,
            shield: this.player?.shield ?? this.game.playerData?.shield,
            maxShield: this.player?.maxShield ?? this.game.playerData?.maxShield,
            megabombs: this.player?.megabombs ?? this.game.playerData?.megabombs,
            ownedSecondaryWeapons: this.player?.ownedSecondaryWeapons ?? this.game.playerData?.ownedSecondaryWeapons,
            unlockedWeapons: this.player?.ownedSecondaryWeapons ?? this.game.playerData?.ownedSecondaryWeapons,
            equippedSecondaryWeapon: this.player?.equippedSecondaryWeapon ?? this.game.playerData?.equippedSecondaryWeapon,
            primaryWeaponLevel: this.player?.weapons?.CANNON?.level ?? this.game.playerData?.primaryWeaponLevel,
            level: nextSupportedLevel,
            lastCompletedLevel,
            missionResults: updatedMissionResults,
            eventFlags
        });
        this.game.saveManager.saveGame();
        this.game.changeState('landing', { completedLevel, missionResult });
    }

    async restartLevel() {
        logger.info(`Restarting level ${this.level}...`);

        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.gameTime = 0;

        this.game.collision.clearAll();
        this.game.entityManager.clear();
        this.effectManager.clear();
        this.initializeMissionStats();

        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 120);
        this.player.loadSprites();
        if (this.game.hasSystem('reactiveShieldEmitter') && this.player.maxShield > 0) {
            this.player.shield = this.player.maxShield;
            this.game.playerData.shield = this.player.shield;
        }
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');
        this.game.player = this.player;

        await this.initializeLevel();
    }

    async cycleLevel() {
        const supported = this.supportedMissionLevels;
        const currentIndex = supported.indexOf(this.getRequestedMissionLevel(this.level));
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % supported.length;
        this.level = supported[nextIndex];
        await this.restartLevel();
    }

    exit() {
        logger.info('Exiting Game State');
        this.syncPlayerData();
        this.effectManager.clear();

        if (this.currentLevel && typeof this.currentLevel.cleanup === 'function') {
            this.currentLevel.cleanup();
        }

        this.game.player = null;
        this.currentLevel = null;
    }
}

export { GameState };

