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
    }

    getHighestSupportedLevel() {
        return Math.max(...this.supportedMissionLevels);
    }

    getRequestedMissionLevel(level) {
        const requested = Math.max(1, Number(level) || 1);
        return Math.min(requested, this.getHighestSupportedLevel());
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

        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 120);
        this.player.loadSprites();
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
            megabombs: this.player.megabombs,
            unlockedWeapons: this.player.unlockedWeapons
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
        ctx.fillText('Returning to hangar...', this.game.width / 2, this.game.height / 2 + 30);
    }

    completeLevel() {
        const completedLevel = this.level;
        const lastCompletedLevel = Math.max(this.game.playerData?.lastCompletedLevel || 0, completedLevel);
        const nextSupportedLevel = this.getRequestedMissionLevel(lastCompletedLevel + 1);

        this.game.setPlayerData({
            ...this.game.playerData,
            health: this.player?.health ?? this.game.playerData?.health,
            maxHealth: this.player?.maxHealth ?? this.game.playerData?.maxHealth,
            money: this.player?.money ?? this.game.playerData?.money,
            score: this.player?.score ?? this.game.playerData?.score,
            shield: this.player?.shield ?? this.game.playerData?.shield,
            megabombs: this.player?.megabombs ?? this.game.playerData?.megabombs,
            unlockedWeapons: this.player?.unlockedWeapons ?? this.game.playerData?.unlockedWeapons,
            level: nextSupportedLevel,
            lastCompletedLevel
        });
        this.game.saveManager.saveGame();
        this.game.changeState('hangar', { completedLevel });
    }

    async restartLevel() {
        logger.info(`Restarting level ${this.level}...`);

        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.gameTime = 0;

        this.game.collision.clearAll();
        this.game.entityManager.clear();
        this.effectManager.clear();

        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 120);
        this.player.loadSprites();
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

