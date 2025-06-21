/**
 * EnemyFactory class 2
 * Factory for creating different types of enemies.
 */
import { Enemy } from './enemy.js';
import { Boss1 } from './boss1.js';
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
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'fighter', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyFighter');
                break;

            case 'turret':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'turret', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyTurret');
                break;

            case 'bomber':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'bomber', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyBomber');
                break;

            case 'boss1':
                // We create the Boss1 instance. Its stats will be applied by the "Overrides" section.
                enemy = new Boss1(this.game, spawn_x, spawn_y);
                enemy.sprite = this.game.assets.getImage('bossLevel1');
                break;

            case 'striker':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'striker', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyStriker');
                break;

            case 'cyclone':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'cyclone', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyCyclone');
                break;

            case 'gnat':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'gnat', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyGnat');
                break;

            case 'reaper':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'reaper', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyReaper');
                break;

            case 'dart':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'dart', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyDart');
                break;

            case 'goliath':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'goliath', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyGoliath');
                break;

            case 'cutter':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'cutter', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyCutter');
                break;

            case 'mine':
                enemy = new Enemy(this.game, spawn_x, spawn_y, 'mine', overrides.health, overrides.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyMine');

                console.log('FACTORY: Attaching custom behavior to a MINE object.'); // <-- ADD THIS LINE
                // Set default velocity to 0 so it doesn't fight our custom behavior.
                enemy.velocityY = 20;
                // Add the unique slow-homing behavior for the mine
                enemy.updateBehavior = function (player, deltaTime) {
                    // The 'this' keyword here refers to the enemy instance
                    if (player) {
                        const dx = player.x - this.x;
                        const dy = player.y - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance > 0) {
                            // Calculate direction and apply a small force
                            this.dx += (dx / distance) * 0.03;
                            this.dy += (dy / distance) * 0.03;
                        }
                    }
                    // Apply drag
                    this.dx *= 0.98;
                    this.dy *= 0.98;
                };

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
            // Apply simple stat overrides
            if (overrides.health) enemy.health = overrides.health;
            if (overrides.fireRate) enemy.fireRate = overrides.fireRate;
            if (overrides.velocityX) enemy.velocityX = overrides.velocityX;
            if (overrides.velocityY) enemy.velocityY = overrides.velocityY;
            if (overrides.scoreValue) enemy.scoreValue = overrides.scoreValue;

            // Assign behavior functions from the library
            enemy.movementUpdate = movementPatterns[overrides.movementPattern] || movementPatterns['default'];
            enemy.firingUpdate = firingPatterns[overrides.firingPattern] || firingPatterns['none'];

            // Legacy pattern support (for backward compatibility)
            if (enemyInfo.pattern && !overrides.movementPattern) {
                enemy.setMovementPattern(enemyInfo.pattern, enemyInfo.patternParams || {});
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