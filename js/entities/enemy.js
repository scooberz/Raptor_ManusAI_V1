class Enemy extends Entity {
    constructor(game, x, y, type, health, scoreValue, collisionDamage) {
        const stats = Enemy.stats[type] || {};
        const width = stats.width || 48;
        const height = stats.height || 48;

        super(game, x, y, width, height);
        this.layer = 'enemy';
        this.game = game;

        // Assign properties, prioritizing data passed from the level spawner over defaults
        this.type = type;
        this.health = health !== undefined ? health : (stats.health || 20);
        this.maxHealth = this.health;
        this.scoreValue = scoreValue !== undefined ? scoreValue : (stats.points || 100);
        this.moneyValue = stats.moneyValue || 25;
        this.collisionDamage = collisionDamage !== undefined ? collisionDamage : (stats.collisionDamage || 20);

        // Default movement and weapon properties
        this.velocityY = 100; // A base value, can be overridden by patterns
        this.pattern = 'straight';
        this.patternParams = {};
        this.canFire = false;
        this.fireRate = 0;
        this.lastFired = 0;

        // Visual effect properties
        this.hitTime = 0;
        this.hitDuration = 100; // ms
        this.hit = false;
    }

    /**
     * Sets the movement pattern for the enemy.
     * @param {string} pattern - The name of the pattern (e.g., 'straight', 'zigzag').
     * @param {Object} params - An object containing specific parameters for that pattern.
     */
    setMovementPattern(pattern, params) {
        this.pattern = pattern;
        this.patternParams = params || {};
    }

    /**
     * Reduces enemy health when it takes damage. Called by the collision system.
     * @param {number} damage - The amount of damage to inflict.
     */
    takeDamage(damage) {
        this.health -= damage;
        this.hit = true;
        this.hitTime = 0;
    }

    /**
     * The main update loop for the enemy, called every frame by the EntityManager.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    update(deltaTime) {
        // 1. Handle death sequence if health is at or below zero.
        if (this.health <= 0 && this.active) {
            this.active = false; // Deactivate immediately to prevent duplicate death sequences.

            // Grant score and money to the player.
            if (this.game && this.game.player) {
                this.game.player.addScore(this.scoreValue);
                this.game.player.addMoney(this.moneyValue);
            }

            // Create an explosion at the enemy's location.
            this.game.entityManager.add(new Explosion(this.game, this.x, this.y, this.width, this.height));

            // If this enemy is a boss, notify the level that it has been defeated.
            if (this.isBoss && this.level) {
                this.level.bossDefeated = true;
            }

            // Stop any further processing for this (now dead) enemy.
            return;
        }

        // 2. Execute movement logic.
        if (this.updateBehavior) {
            // If a custom behavior is attached (e.g., for mines), run it instead of standard movement.
            this.updateBehavior(this.game.player, deltaTime);
        } else {
            // Otherwise, perform the default movement pattern.
            this.updateMovement(deltaTime);
        }
        
        // 3. Execute firing logic if the enemy is able to shoot.
        if (this.canFire) {
            this.updateFiring(deltaTime);
        }

        // 4. Update the visual "hit" flash effect.
        if (this.hit) {
            this.hitTime += deltaTime;
            if (this.hitTime >= this.hitDuration) {
                this.hit = false;
                this.hitTime = 0;
            }
        }

        // 5. Remove the enemy if it goes too far off-screen.
        if (this.y > this.game.height + 200) {
            this.destroy();
        }

        // 6. Call the base Entity's update method to apply physics (dx, dy).
        super.update(deltaTime);
    }

    /**
     * Handles the enemy's standard movement based on its assigned pattern.
     * This method is intended to be expanded with different patterns (e.g., straight, zigzag).
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updateMovement(deltaTime) {
        // Base movement logic will be applied by the parent Entity's update.
        // Complex patterns like 'zigzag' or 'sineWave' would be implemented here.
    }

    /**
     * Handles the enemy's weapon firing logic.
     * This method is intended to be expanded.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updateFiring(deltaTime) {
        // Firing logic (checking fireRate, creating projectiles) would be implemented here.
    }
}


// --- Static Enemy Database ---
// Defines the default stats for each enemy type. This allows for easy balancing.
Enemy.stats = {
    fighter: {
        health: 20,
        points: 100,
        collisionDamage: 20,
        width: 48,
        height: 48
    },
    striker: {
        health: 30,
        points: 100,
        moneyValue: 50,
        collisionDamage: 20,
        width: 111,
        height: 98
    },
    cyclone: {
        health: 60,
        points: 250,
        moneyValue: 100,
        collisionDamage: 30,
        width: 52,
        height: 61
    },
    gnat: {
        health: 10,
        points: 50,
        moneyValue: 25,
        collisionDamage: 10,
        width: 63,
        height: 59
    },
    reaper: {
        health: 40,
        points: 150,
        moneyValue: 75,
        collisionDamage: 25,
        width: 68,
        height: 62
    },
    dart: {
        health: 25,
        points: 125,
        moneyValue: 60,
        collisionDamage: 15,
        width: 46,
        height: 48
    },
    goliath: {
        health: 150,
        points: 500,
        moneyValue: 200,
        collisionDamage: 50,
        width: 54,
        height: 70
    },
    cutter: {
        health: 50,
        points: 200,
        moneyValue: 500,
        collisionDamage: 35,
        width: 53,
        height: 57
    },
    mine: {
        health: 20,
        points: 75,
        moneyValue: 10,
        collisionDamage: 40,
        width: 31,
        height: 31
    }
};