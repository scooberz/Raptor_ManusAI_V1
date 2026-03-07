/**
 * SaveManager class
 * Handles saving and loading game progress using localStorage.
 */
import { logger } from '../utils/logger.js';

class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'raptor_manus_save';
    }

    buildSaveData() {
        const gameState = this.game.states.game;
        const baseData = this.game.normalizePlayerData(this.game.playerData || {});
        const livePlayer = gameState?.player || this.game.player;

        if (livePlayer) {
            baseData.health = livePlayer.health;
            baseData.maxHealth = livePlayer.maxHealth;
            baseData.money = livePlayer.money;
            baseData.score = livePlayer.score;
            baseData.shield = livePlayer.shield;
            baseData.maxShield = livePlayer.maxShield;
            baseData.megabombs = livePlayer.megabombs;
            baseData.ownedSecondaryWeapons = [...new Set(livePlayer.ownedSecondaryWeapons || baseData.ownedSecondaryWeapons || [])];
            baseData.unlockedWeapons = [...baseData.ownedSecondaryWeapons];
            baseData.equippedSecondaryWeapon = livePlayer.equippedSecondaryWeapon || baseData.equippedSecondaryWeapon;
        }

        if (gameState && !gameState.levelComplete) {
            baseData.level = Math.max(1, gameState.level || baseData.level);
        }

        baseData.timestamp = Date.now();
        return baseData;
    }

    saveGame() {
        try {
            const saveData = this.buildSaveData();
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.game.setPlayerData(saveData);
            logger.info('Game saved successfully');
            return true;
        } catch (error) {
            logger.error('Error saving game:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                return null;
            }
            return this.game.normalizePlayerData(JSON.parse(saveData));
        } catch (error) {
            logger.error('Error loading game:', error);
            return null;
        }
    }

    hasSaveGame() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    deleteSaveGame() {
        try {
            localStorage.removeItem(this.saveKey);
            logger.info('Save game deleted');
            return true;
        } catch (error) {
            logger.error('Error deleting save game:', error);
            return false;
        }
    }

    applySaveData(saveData) {
        if (!saveData) {
            return null;
        }

        const normalized = this.game.setPlayerData(saveData);
        const gameState = this.game.states.game;
        if (gameState) {
            gameState.level = normalized.level;
        }
        return normalized;
    }
}

export { SaveManager };
