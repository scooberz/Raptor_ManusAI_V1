/**
 * EnemyFactory class 2
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

    /**
     * Creates an enemy of a specified type, adds it to the game's core systems,
     * and then returns the created instance.
     * @param {Object} enemyInfo - Object containing enemy type, position, and overrides
     * @returns {Enemy|null} The created enemy instance, or null if the type is unknown.
     */
    createEnemy(enemyInfo, level) {
        let enemy = null;
        const { type, spawn_x, spawn_y, overrides = {} } = enemyInfo;

        // Diagnostic log before switch
        logger.debug(`FACTORY INPUT: Received request to create type: "${type}"`);

        // --- Ensure enemy spawns outside the playable area ---
        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (level && typeof level.getPlayableBounds === 'function') {
            bounds = level.getPlayableBounds();
        }
        let spawnX = spawn_x;
        let spawnY = spawn_y;
        // Determine intended entry direction from movementPattern or type
        const pattern = overrides.movementPattern || type;
        if (pattern && (pattern.includes('left') || pattern === 'swoop_from_left')) {
            // Entering from left
            spawnX = bounds.left - (Enemy.stats[type]?.width || 48);
            spawnY = spawn_y;
        } else if (pattern && (pattern.includes('right') || pattern === 'swoop_from_right')) {
            // Entering from right
            spawnX = bounds.right;
            spawnY = spawn_y;
        } else if (pattern && pattern.includes('bottom')) {
            // Entering from bottom
            spawnX = spawn_x;
            spawnY = bounds.bottom;
        } else {
            // Default: entering from top
            spawnX = spawn_x;
            spawnY = bounds.top - (Enemy.stats[type]?.height || 48);
        }

        switch (type) {
            case 'fighter':
                enemy = new Enemy(this.game, spawnX, spawnY, 'fighter', 'enemyFighter', overrides.health, overrides.scoreValue);
                break;

            case 'turret':
                enemy = new Enemy(this.game, spawnX, spawnY, 'turret', 'enemyTurret', overrides.health, overrides.scoreValue);
                break;

            case 'bomber':
                enemy = new Enemy(this.game, spawnX, spawnY, 'bomber', 'enemyBomber', overrides.health, overrides.scoreValue);
                break;

            case 'boss1':
                // We create the Boss1 instance. Its stats will be applied by the "Overrides" section.
                enemy = new Boss1(this.game, spawnX, spawnY, 'bossLevel1');
                break;

            case 'striker':
                enemy = new Enemy(this.game, spawnX, spawnY, 'striker', 'enemyStriker', overrides.health, overrides.scoreValue);
                break;

            case 'cyclone':
                enemy = new Enemy(this.game, spawnX, spawnY, 'cyclone', 'enemyCyclone', overrides.health, overrides.scoreValue);
                break;

            case 'gnat':
                enemy = new Enemy(this.game, spawnX, spawnY, 'gnat', 'enemyGnat', overrides.health, overrides.scoreValue);
                break;

            case 'reaper':
                enemy = new Enemy(this.game, spawnX, spawnY, 'reaper', 'enemyReaper', overrides.health, overrides.scoreValue);
                break;

            case 'dart':
                enemy = new Enemy(this.game, spawnX, spawnY, 'dart', 'enemyDart', overrides.health, overrides.scoreValue);
                
                // Set default swooping behavior for all dart enemies
                if (!overrides.movementPattern) {
                    // Randomly choose between left and right swooping
                    const swoopDirection = Math.random() < 0.5 ? 'swoop_from_left' : 'swoop_from_right';
                    enemy.movementUpdate = movementPatterns[swoopDirection];
                    enemy.velocityY = 400; // High speed by default
                    logger.debug(`Dart assigned ${swoopDirection} pattern`);
                }
                break;

            case 'goliath':
                enemy = new Enemy(this.game, spawnX, spawnY, 'goliath', 'enemyGoliath', overrides.health, overrides.scoreValue);
                break;

            case 'cutter':
                enemy = new Enemy(this.game, spawnX, spawnY, 'cutter', 'enemyCutter', overrides.health, overrides.scoreValue);
                break;

            case 'mine':
                enemy = new Enemy(this.game, spawnX, spawnY, 'mine', 'enemyMine', overrides.health, overrides.scoreValue);
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

        // Diagnostic log after switch
        if (enemy) { logger.debug(`FACTORY OUTPUT: Successfully created object with constructor: ${enemy.constructor.name}`); }

        // --- Apply Overrides ---
        if (enemy) {
            enemy.overrides = overrides;
            // Apply simple stat overrides
            if (overrides.health) {
                enemy.health = overrides.health;
                if (enemy.isBoss) enemy.maxHealth = overrides.health; // Keep boss healthbar in sync
            }
            if (overrides.fireRate) enemy.fireRate = overrides.fireRate;
            if (overrides.velocityX) enemy.velocityX = overrides.velocityX;
            if (overrides.velocityY) enemy.velocityY = overrides.velocityY;
            if (overrides.scoreValue) enemy.scoreValue = overrides.scoreValue;

            // Assign behavior functions from the library
            enemy.movementUpdate = movementPatterns[overrides.movementPattern] || movementPatterns['default'];
            enemy.firingUpdate = firingPatterns[overrides.firingPattern] || firingPatterns['none'];
            // If the enemy has been assigned a real firing pattern, enable its ability to fire.
            if (overrides.firingPattern && overrides.firingPattern !== 'none') {
                enemy.canFire = true;
            }
        }

        // This is the critical step: Register the new enemy with the game's systems.
        if (enemy) {
            this.game.entityManager.add(enemy);
            this.game.collision.addToGroup(enemy, 'enemies');
        }
        // This block ensures the enemy knows which level it belongs to.
        if (enemy) {
            enemy.level = level;
        }
        return enemy;
    }
}
export { EnemyFactory };