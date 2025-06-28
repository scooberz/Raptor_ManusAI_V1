/**
 * EnemyFactory class 2
 * Factory for creating different types of enemies.
 */
import { Enemy } from './enemy.js';
import { Boss1 } from './boss1.js';
import { DestructibleObject } from './destructibleObject.js';
import { movementPatterns, firingPatterns } from './enemyBehaviors.js';

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
        console.log(`FACTORY INPUT: Received request to create type: "${type}"`);

        switch (type) {
            case 'fighter':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'fighter', 'enemyFighter', overrides.health, overrides.scoreValue);
                break;

            case 'turret':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'turret', 'enemyTurret', overrides.health, overrides.scoreValue);
                break;

            case 'bomber':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'bomber', 'enemyBomber', overrides.health, overrides.scoreValue);
                break;

            case 'boss1':
                // We create the Boss1 instance. Its stats will be applied by the "Overrides" section.
                enemy = new Boss1(this.game, spawn_x, spawn_y, 'bossLevel1');
                break;

            case 'striker':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'striker', 'enemyStriker', overrides.health, overrides.scoreValue);
                break;

            case 'cyclone':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'cyclone', 'enemyCyclone', overrides.health, overrides.scoreValue);
                break;

            case 'gnat':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'gnat', 'enemyGnat', overrides.health, overrides.scoreValue);
                break;

            case 'reaper':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'reaper', 'enemyReaper', overrides.health, overrides.scoreValue);
                break;

            case 'dart':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'dart', 'enemyDart', overrides.health, overrides.scoreValue);
                
                // Set default swooping behavior for all dart enemies
                if (!overrides.movementPattern) {
                    // Randomly choose between left and right swooping
                    const swoopDirection = Math.random() < 0.5 ? 'swoop_from_left' : 'swoop_from_right';
                    enemy.movementUpdate = movementPatterns[swoopDirection];
                    enemy.velocityY = 400; // High speed by default
                    console.log(`Dart assigned ${swoopDirection} pattern`);
                }
                break;

            case 'goliath':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'goliath', 'enemyGoliath', overrides.health, overrides.scoreValue);
                break;

            case 'cutter':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'cutter', 'enemyCutter', overrides.health, overrides.scoreValue);
                break;

            case 'mine':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'mine', 'enemyMine', overrides.health, overrides.scoreValue);
                break;

            case 'FUEL_TANK':
                enemy = new DestructibleObject(this.game, spawn_x, spawn_y, 'FUEL_TANK', 'fuelTank');
                break;

            case 'BUNKER':
                enemy = new DestructibleObject(this.game, spawn_x, spawn_y, 'BUNKER', 'bunker');
                break;

            case 'RADAR_DISH':
                enemy = new DestructibleObject(this.game, spawn_x, spawn_y, 'RADAR_DISH', 'radarDish');
                break;

            default:
                console.error(`Unknown enemy type requested: "${type}"`);
                return null;
        }

        // Diagnostic log after switch
        if (enemy) {
            console.log(`FACTORY OUTPUT: Successfully created object with constructor: ${enemy.constructor.name}`);
        }

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