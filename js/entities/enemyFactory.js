/**
 * EnemyFactory class
 * Factory for creating different types of enemies.
 */
import { Enemy } from './enemy.js';
import { Boss1 } from './boss1.js';
import { DestructibleObject } from './destructibleObject.js';
import { movementPatterns, firingPatterns } from './enemyBehaviors.js';
import { logger } from '../utils/logger.js';

class EnemyFactory {
    constructor(game) {
        this.game = game;
    }

    applyDifficultyModifiers(enemy, translatedOverrides = {}) {
        if (!enemy || enemy instanceof DestructibleObject) {
            return;
        }

        const difficulty = this.game.getDifficultyProfile(this.game.playerData?.difficulty);
        const baseHealth = translatedOverrides.health ?? enemy.health;
        const scaledHealth = Math.max(1, Math.round(baseHealth * difficulty.enemyHealthMultiplier));
        enemy.health = scaledHealth;
        enemy.maxHealth = scaledHealth;

        if (enemy.fireRate) {
            enemy.fireRate = Math.max(120, Math.round(enemy.fireRate * difficulty.enemyFireIntervalMultiplier));
        }

        enemy.scoreValue = Math.max(10, Math.round((enemy.scoreValue || 0) * difficulty.rewardMultiplier));
        enemy.moneyValue = Math.max(5, Math.round((enemy.moneyValue || 0) * difficulty.rewardMultiplier));
    }

    createEnemy(enemyInfo, level) {
        let enemy = null;
        const { type, spawn_x, spawn_y, overrides = {} } = enemyInfo;
        logger.debug(`FACTORY INPUT: Received request to create type: "${type}"`);

        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (level && typeof level.getPlayableBounds === 'function') {
            bounds = level.getPlayableBounds();
        }

        const translatedOverrides = this.translateOverrides(overrides, level, bounds);
        const spawnPoint = this.resolveSpawnPoint(type, spawn_x, spawn_y, translatedOverrides, level, bounds);
        const { x: spawnX, y: spawnY } = spawnPoint;

        switch (type) {
            case 'fighter':
                enemy = new Enemy(this.game, spawnX, spawnY, 'fighter', 'enemyFighter', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'turret':
                enemy = new Enemy(this.game, spawnX, spawnY, 'turret', 'enemyTurret', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'bomber':
                enemy = new Enemy(this.game, spawnX, spawnY, 'bomber', 'enemyBomber', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'boss1':
                enemy = new Boss1(this.game, spawnX, spawnY, 'bossLevel1');
                break;
            case 'striker':
                enemy = new Enemy(this.game, spawnX, spawnY, 'striker', 'enemyStriker', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'cyclone':
                enemy = new Enemy(this.game, spawnX, spawnY, 'cyclone', 'enemyCyclone', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'gnat':
                enemy = new Enemy(this.game, spawnX, spawnY, 'gnat', 'enemyGnat', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'reaper':
                enemy = new Enemy(this.game, spawnX, spawnY, 'reaper', 'enemyReaper', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'dart':
                enemy = new Enemy(this.game, spawnX, spawnY, 'dart', 'enemyDart', translatedOverrides.health, translatedOverrides.scoreValue);
                if (!translatedOverrides.movementPattern) {
                    const swoopDirection = Math.random() < 0.5 ? 'swoop_from_left' : 'swoop_from_right';
                    enemy.movementUpdate = movementPatterns[swoopDirection];
                    enemy.velocityY = 400;
                    logger.debug(`Dart assigned ${swoopDirection} pattern`);
                }
                break;
            case 'goliath':
                enemy = new Enemy(this.game, spawnX, spawnY, 'goliath', 'enemyGoliath', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'cutter':
                enemy = new Enemy(this.game, spawnX, spawnY, 'cutter', 'enemyCutter', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'mine':
                enemy = new Enemy(this.game, spawnX, spawnY, 'mine', 'enemyMine', translatedOverrides.health, translatedOverrides.scoreValue);
                break;
            case 'FUEL_TANK':
                enemy = new DestructibleObject(this.game, spawnX, spawnY, 'FUEL_TANK', 'fuelTank');
                break;
            case 'BUNKER':
                enemy = new DestructibleObject(this.game, spawnX, spawnY, 'BUNKER', 'bunker');
                break;
            case 'RADAR_DISH':
                enemy = new DestructibleObject(this.game, spawnX, spawnY, 'RADAR_DISH', 'radarDish');
                break;
            default:
                logger.error(`Unknown enemy type requested: "${type}"`);
                return null;
        }

        if (enemy) {
            logger.debug(`FACTORY OUTPUT: Successfully created object with constructor: ${enemy.constructor.name}`);
        }

        if (enemy) {
            enemy.overrides = translatedOverrides;
            if (translatedOverrides.health) {
                enemy.health = translatedOverrides.health;
                enemy.maxHealth = translatedOverrides.health;
            }
            if (translatedOverrides.fireRate) enemy.fireRate = translatedOverrides.fireRate;
            if (translatedOverrides.velocityX) enemy.velocityX = translatedOverrides.velocityX;
            if (translatedOverrides.velocityY) enemy.velocityY = translatedOverrides.velocityY;
            if (translatedOverrides.scoreValue) enemy.scoreValue = translatedOverrides.scoreValue;

            enemy.movementUpdate = movementPatterns[translatedOverrides.movementPattern] || movementPatterns.default;
            enemy.firingUpdate = firingPatterns[translatedOverrides.firingPattern] || firingPatterns.none;
            if (translatedOverrides.firingPattern && translatedOverrides.firingPattern !== 'none') {
                enemy.canFire = true;
            }

            this.applyDifficultyModifiers(enemy, translatedOverrides);
        }

        if (enemy) {
            this.game.entityManager.add(enemy);
            this.game.collision.addToGroup(enemy, 'enemies');
            enemy.level = level;
        }

        return enemy;
    }

    resolveSpawnPoint(type, spawnX, spawnY, overrides, level, bounds) {
        const width = Enemy.stats[type]?.width || 48;
        const height = Enemy.stats[type]?.height || 48;
        const playableWidth = bounds.right - bounds.left;
        const translatedX = this.translateLevelX(spawnX, level, bounds);
        const translatedY = this.translateLevelY(spawnY, level, bounds);
        const pattern = overrides.movementPattern || type;

        if (pattern && (pattern.includes('left') || pattern === 'swoop_from_left')) {
            return { x: bounds.left - width, y: translatedY };
        }

        if (pattern && (pattern.includes('right') || pattern === 'swoop_from_right')) {
            return { x: bounds.right, y: translatedY };
        }

        if (pattern === 'swoop_and_dash') {
            if (spawnX < 0) {
                return { x: bounds.left - width, y: translatedY };
            }
            if (spawnX > (level?.getDesignWidth?.() || 800) * 0.6) {
                return { x: bounds.right, y: translatedY };
            }
        }

        if (pattern && pattern.includes('bottom')) {
            return { x: translatedX, y: bounds.bottom + height };
        }

        if (spawnX < 0) {
            return { x: bounds.left + (spawnX / Math.max(playableWidth, 1)) * playableWidth, y: translatedY };
        }

        return { x: translatedX, y: translatedY };
    }

    translateOverrides(overrides, level, bounds) {
        const translated = { ...overrides };
        const hasTranslator = level && typeof level.translateLevelX === 'function' && typeof level.translateLevelY === 'function';
        if (!hasTranslator) {
            return translated;
        }

        if (translated.formation_point) {
            translated.formation_point = {
                x: level.translateLevelX(translated.formation_point.x),
                y: level.translateLevelY(translated.formation_point.y)
            };
        }

        if (translated.target_x !== undefined) {
            translated.target_x = level.translateLevelX(translated.target_x);
        }

        const yKeys = ['trigger_y', 'split_y', 'diverge_y', 'patrol_y', 'veer_y'];
        yKeys.forEach((key) => {
            if (translated[key] !== undefined) {
                translated[key] = level.translateLevelY(translated[key]);
            }
        });

        return translated;
    }

    translateLevelX(value, level, bounds) {
        if (level && typeof level.translateLevelX === 'function') {
            return level.translateLevelX(value);
        }
        return bounds.left + value;
    }

    translateLevelY(value, level, bounds) {
        if (level && typeof level.translateLevelY === 'function') {
            return level.translateLevelY(value);
        }
        return bounds.top + value;
    }
}

export { EnemyFactory };
