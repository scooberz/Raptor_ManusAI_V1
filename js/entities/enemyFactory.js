/**
 * EnemyFactory class 2
 * Factory for creating different types of enemies.
 */
class EnemyFactory {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Creates an enemy of a specified type, adds it to the game's core systems,
     * and then returns the created instance.
     * @param {string} type - The type of enemy to create (e.g., 'fighter', 'boss1').
     * @param {number} x - The initial x-coordinate for the enemy.
     * @param {number} y - The initial y-coordinate for the enemy.
     * @param {string} [pattern] - Optional movement pattern.
     * @param {Object} [patternParams] - Optional movement pattern parameters.
     * @param {Object} [stats] - Optional enemy stats (health, scoreValue, etc.)
     * @param {Level} [level] - The level instance that spawned this enemy
     * @returns {Enemy|null} The created enemy instance, or null if the type is unknown.
     */
    createEnemy(type, x, y, pattern, patternParams, stats = {}, level) {
        let enemy = null;
        
        // Diagnostic log before switch
        console.log(`FACTORY INPUT: Received request to create type: "${type}"`);
        
        switch (type) {
            case 'fighter':
                enemy = new Enemy(this.game, x, y, 'fighter', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyFighter');
                break;

            case 'turret':
                enemy = new Enemy(this.game, x, y, 'turret', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyTurret');
                break;
                
            case 'bomber':
                enemy = new Enemy(this.game, x, y, 'bomber', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyBomber'); 
                break;

            case 'boss1':
                enemy = new Boss1(this.game, x, y, stats.health, stats.scoreValue);
                break;

            case 'striker':
                enemy = new Enemy(this.game, x, y, 'striker', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyStriker');
                break;

            case 'cyclone':
                enemy = new Enemy(this.game, x, y, 'cyclone', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyCyclone');
                break;

            case 'gnat':
                enemy = new Enemy(this.game, x, y, 'gnat', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyGnat');
                break;

            case 'reaper':
                enemy = new Enemy(this.game, x, y, 'reaper', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyReaper');
                break;

            case 'dart':
                enemy = new Enemy(this.game, x, y, 'dart', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyDart');
                break;

            case 'goliath':
                enemy = new Enemy(this.game, x, y, 'goliath', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyGoliath');
                break;

            case 'cutter':
                enemy = new Enemy(this.game, x, y, 'cutter', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyCutter');
                break;

            // ...
            case 'mine':
                enemy = new Enemy(this.game, x, y, 'mine', stats.health, stats.scoreValue);
                enemy.sprite = this.game.assets.getImage('enemyMine');

                console.log('FACTORY: Attaching custom behavior to a MINE object.'); // <-- ADD THIS LINE
                // Set default velocity to 0 so it doesn't fight our custom behavior.
                enemy.velocityY = 20;
                // Add the unique slow-homing behavior for the mine
                enemy.updateBehavior = function(player, deltaTime) {
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
// ...

            default:
                console.error(`Unknown enemy type requested: "${type}"`);
                return null;
        }
        
        // Diagnostic log after switch
        if (enemy) {
            console.log(`FACTORY OUTPUT: Successfully created object with constructor: ${enemy.constructor.name}`);
        }
       
        // Set movement pattern if provided
        if (enemy && pattern) {
            enemy.setMovementPattern(pattern, patternParams || {});
        }

        // Store the level reference
        if (enemy) {
            enemy.level = level;
        }

        // This is the critical step: Register the new enemy with the game's systems.
        if (enemy) {
            this.game.entityManager.add(enemy);
            this.game.collision.addToGroup(enemy, 'enemies');
        }
        
        return enemy;
    }
}
