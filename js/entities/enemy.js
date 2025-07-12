import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { Collectible } from './collectible.js';
import { logger } from '../utils/logger.js';

class Enemy extends Entity {
    constructor(game, x, y, type, spriteKey, health, scoreValue, collisionDamage) {
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

        // Load sprite and set ready state
        this.sprite = this.game.assets.getImage(spriteKey);
        if (this.sprite) {
            this.isReady = true;
        } else {
            logger.error(`Failed to load sprite with key "${spriteKey}" for enemy type "${this.type}".`);
            this.isReady = false;
        }

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
        this.hasEnteredPlayableArea = false;
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

            // --- NEW LOOT DROP LOGIC ---
            // Check if there's a specific loot drop defined in the overrides.
            if (this.overrides && this.overrides.loot) {
                const loot = this.overrides.loot;
                // Create a collectible with the specified type and value
                const collectible = new Collectible(this.game, this.x, this.y, 30, 30, loot.type, loot.value);
                this.game.entityManager.add(collectible);
                this.game.collision.addToGroup(collectible, 'collectibles');
            } else {
                // Fallback to the old random loot drop system if no specific loot is defined.
                this.dropLoot();
            }
            // --- END NEW LOGIC ---

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

        // 5. Remove the enemy if it goes too far off-screen (bottom or sides of the screen)
        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            bounds = this.game.currentState.getPlayableBounds();
        }
        // Mark as entered if any part is inside the playable area
        if (
            this.x + this.width > bounds.left &&
            this.x < bounds.right &&
            this.y + this.height > bounds.top &&
            this.y < bounds.bottom
        ) {
            this.hasEnteredPlayableArea = true;
        }
        // Despawn only if it has entered and is now fully outside
        if (
            this.hasEnteredPlayableArea &&
            (this.x + this.width < bounds.left ||
             this.x > bounds.right ||
             this.y + this.height < bounds.top ||
             this.y > bounds.bottom)
        ) {
            this.destroy();
            return;
        }
        // 6. Call the base Entity's update method to apply physics (dx, dy).
        super.update(deltaTime);
    }

    render(context) {
        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            bounds = this.game.currentState.getPlayableBounds();
        }
        // Only render if at least partially inside the playable area
        if (
            this.x + this.width < bounds.left ||
            this.x > bounds.right ||
            this.y + this.height < bounds.top ||
            this.y > bounds.bottom
        ) {
            return;
        }
        super.render(context);
    }

    /**
     * Handles the enemy's standard movement based on its assigned pattern.
     * This method is intended to be expanded with different patterns (e.g., straight, zigzag).
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updateMovement(deltaTime) {
        // Call the assigned movement behavior function if it exists
        if (this.movementUpdate) {
            this.movementUpdate(this, deltaTime);
        }
    }

    /**
     * Handles the enemy's weapon firing logic.
     * This method is intended to be expanded.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updateFiring(deltaTime) {
        // Call the assigned firing behavior function if it exists
        if (this.firingUpdate) {
            this.firingUpdate(this, this.game.player, deltaTime);
        }
    }

    /**
     * Handles random loot drops when no specific loot is defined.
     * This is the fallback system for enemies without specific loot overrides.
     */
    dropLoot() {
        // Simple random loot drop system
        const dropChance = 0.1; // 10% chance to drop loot
        if (Math.random() < dropChance) {
            const lootTypes = ['health', 'megabomb'];
            const randomType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
            const value = randomType === 'health' ? 25 : 1;
            
            const collectible = new Collectible(this.game, this.x, this.y, 30, 30, randomType, value);
            this.game.entityManager.add(collectible);
            this.game.collision.addToGroup(collectible, 'collectibles');
        }
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
        health: 60,
        points: 100,
        moneyValue: 50,
        collisionDamage: 20,
        width: 64,
        height: 64
    },
    cyclone: {
        health: 60,
        points: 250,
        moneyValue: 100,
        collisionDamage: 30,
        width: 64,
        height: 64
    },
    gnat: {
        health: 30,
        points: 50,
        moneyValue: 25,
        collisionDamage: 10,
        width: 64,
        height: 64
    },
    reaper: {
        health: 90,
        points: 150,
        moneyValue: 75,
        collisionDamage: 25,
        width: 64,
        height: 64
    },
    dart: {
        health: 60,
        points: 125,
        moneyValue: 60,
        collisionDamage: 15,
        width: 64,
        height: 64
    },
    goliath: {
        health: 180,
        points: 500,
        moneyValue: 200,
        collisionDamage: 50,
        width: 96,
        height: 96
    },
    cutter: {
        health: 60,
        points: 200,
        moneyValue: 500,
        collisionDamage: 35,
        width: 64,
        height: 64
    },
    mine: {
        health: 20,
        points: 75,
        moneyValue: 10,
        collisionDamage: 40,
        width: 32,
        height: 32
    }
};

export { Enemy };