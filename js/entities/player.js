/**
 * Player class
 * Represents the player's ship
 */
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { Projectile } from './projectile.js';
import { Missile } from './missile.js';
import { logger } from '../utils/logger.js';

class Player extends Entity {
    constructor(game, x, y) {
        super(game, x, y, 64, 64);
        this.layer = 'player'; // Define the rendering layer

        // Player stats - will be synced with playerData if available
        this.speed = 575; // Increased from 500 by 15%
        this.health = 75; // Default starting health
        this.maxHealth = 100;
        this.shield = 0; // Shield for shop system
        this.money = 0;
        this.score = 0;
        this.collisionDamage = 20;

        // Weapon system
        this.weaponOrder = ['MISSILE']; // Only missiles in the cycle
        this.currentWeaponIndex = 0;
        this.currentWeapon = this.weaponOrder[this.currentWeaponIndex];
        this.weapons = {
            'CANNON': { name: 'Autocannon', fireRate: 110, lastFired: 0, level: 1 }, // Slower fire rate
            'MISSILE': { name: 'Missiles', fireRate: 715, lastFired: 0 } // 30% slower than before
        };

        // Unlocked weapons for shop system
        this.unlockedWeapons = ['MISSILE']; // Start with basic missiles unlocked

        // Special weapons
        this.megabombs = 3;
        this.lastMegabombTime = 0;
        this.megabombCooldown = 1000; // 1 second cooldown

        // Animation properties
        this.sprite = null;
        this.thrustSprite = null;
        this.turnLeftSprite = null;
        this.turnRightSprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 2;
        this.frameTimer = 0;
        this.frameInterval = 100;

        // Movement properties
        this.turnThreshold = 0.3; // Threshold for showing turn sprites
        this.currentDirection = 0; // -1 for left, 0 for straight, 1 for right

        // Invulnerability after taking damage
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1000; // 1 second
        this.blinkInterval = 100;
        this.visible = true;

        // Missile auto-fire toggle
        this.missileAutoFire = true;

        // Sync with playerData if available
        this.syncWithPlayerData();
    }

    /**
     * Sync player stats with playerData
     */
    syncWithPlayerData() {
        if (this.game.playerData) {
            this.health = this.game.playerData.health || 75;
            this.money = this.game.playerData.money || 0;
            this.score = this.game.playerData.score || 0;
            this.shield = this.game.playerData.shield || 0;
            this.unlockedWeapons = this.game.playerData.unlockedWeapons || ['MISSILE'];
            logger.debug(`Player synced with playerData: health=${this.health}, money=${this.money}`);
        }
    }

    /**
     * Load player sprites
     */
    loadSprites() {
        this.sprites = {
            base: this.game.assets.getImage('playerShipBase'),
            left: this.game.assets.getImage('playerShipLeft'),
            right: this.game.assets.getImage('playerShipRight'),
            thrust: this.game.assets.getImage('playerShipThrust')
        };

        // Check if all required sprites were successfully loaded.
        if (this.sprites.base && this.sprites.left && this.sprites.right) {
            this.isReady = true; // <-- Set the flag to true only if assets are loaded
        } else {
            logger.error("Failed to load one or more player sprites. Player will not be rendered.");
        }
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Handle movement
        this.handleMovement();

        // Handle weapons
        this.handleWeapons();

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime += deltaTime;

            // Blink effect
            if (this.invulnerabilityTime % this.blinkInterval < this.blinkInterval / 2) {
                this.visible = true;
            } else {
                this.visible = false;
            }

            // End invulnerability
            if (this.invulnerabilityTime >= this.invulnerabilityDuration) {
                this.invulnerable = false;
                this.visible = true;
            }
        }

        // Update animation
        this.updateAnimation(deltaTime);

        super.update(deltaTime);
    }

    /**
     * Handle player movement based on input
     */
    handleMovement() {
        // Get mouse position
        const mousePos = this.game.input.getMousePosition();

        // Calculate direction to mouse
        const targetX = mousePos.x - this.width / 2;
        const targetY = mousePos.y - this.height / 2;

        // Calculate distance to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Update turn direction
        if (Math.abs(dx) > this.turnThreshold * this.width) {
            this.currentDirection = dx > 0 ? 1 : -1;
        } else {
            this.currentDirection = 0;
        }

        // Only move if we're not at the target position
        if (distance > 2) { // Reduced threshold for more precise movement
            // Calculate movement speed based on distance
            const moveSpeed = Math.min(this.speed * 1.75, distance * 3.5); // Increased responsiveness

            // Calculate normalized direction
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Set velocity based on direction and speed
            this.velocityX = dirX * moveSpeed;
            this.velocityY = dirY * moveSpeed;
        } else {
            // Stop moving when close to target
            this.velocityX = 0;
            this.velocityY = 0;
        }

        // Keep player within game boundaries
        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            bounds = this.game.currentState.getPlayableBounds();
        }
        if (this.x < bounds.left) this.x = bounds.left;
        if (this.x + this.width > bounds.right) this.x = bounds.right - this.width;
        if (this.y < bounds.top) this.y = bounds.top;
        if (this.y + this.height > bounds.bottom) this.y = bounds.bottom - this.height;
    }

    /**
     * Handle player weapons based on input
     */
    handleWeapons() {
        const now = Date.now();

        // Primary weapon firing (machine gun) - left mouse button
        if (this.game.input.isMouseButtonPressed('left')) { // Left mouse button
            const cannon = this.weapons['CANNON'];
            if (now - cannon.lastFired >= cannon.fireRate) {
                this.fireCannon();
                cannon.lastFired = now;
            }

            // Auto-fire missiles while holding left mouse button (only if enabled)
            if (this.missileAutoFire) {
                const missile = this.weapons['MISSILE'];
                if (now - missile.lastFired >= missile.fireRate) {
                    this.fireMissile();
                    missile.lastFired = now;
                }
            }
        }

        // Right mouse button toggles missile auto-fire mode
        if (this.game.input.wasMouseButtonJustPressed('right')) { // Right mouse button
            this.missileAutoFire = !this.missileAutoFire;
            logger.debug(`Missile auto-fire mode: ${this.missileAutoFire ? 'ON' : 'OFF'}`);
        }

        // Megabomb
        if (this.game.input.isKeyPressed('b')) {
            if (this.megabombs > 0 && now - this.lastMegabombTime > this.megabombCooldown) {
                this.lastMegabombTime = now;
                this.fireMegabomb();
            }
        }
    }

    /**
     * Update player animation
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateAnimation(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
    }

    /**
   * Render the player
   * @param {CanvasRenderingContext2D} context - The canvas context to render to
   */
    render(context) {
        if (!this.visible || !this.isReady) return;

        // Draw the appropriate sprite based on movement direction
        if (this.currentDirection === -1 && this.sprites.left) {
            context.globalCompositeOperation = 'source-over';
            context.drawImage(
                this.sprites.left,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else if (this.currentDirection === 1 && this.sprites.right) {
            context.globalCompositeOperation = 'source-over';
            context.drawImage(
                this.sprites.right,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else if (this.sprites.base) {
            context.globalCompositeOperation = 'source-over';
            context.drawImage(
                this.sprites.base,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }

    /**
     * Fire the primary weapon (machine gun)
     */
    fireCannon() {
        // Keep all your existing constants for balance
        const bulletSpacing = 10;
        const bulletVelocityY = -1200;
        const bulletDamage = 3;

        // Fire Left Bullet
        const leftBullet = this.game.projectilePool.get();
        if (leftBullet) {
            // Activate the bullet from the pool with its properties.
            // Pass `null` for the sprite to make it draw the tiny rectangle (white pixel bullet).
            leftBullet.activate(this.x + this.width / 2 - bulletSpacing, this.y, 0, bulletVelocityY, bulletDamage, 'player', null);
            this.game.entityManager.add(leftBullet);
            this.game.collision.addToGroup(leftBullet, 'playerProjectiles');
        }

        // Fire Right Bullet
        const rightBullet = this.game.projectilePool.get();
        if (rightBullet) {
            // Pass `null` for the sprite as well.
            rightBullet.activate(this.x + this.width / 2 + bulletSpacing, this.y, 0, bulletVelocityY, bulletDamage, 'player', null);
            this.game.entityManager.add(rightBullet);
            this.game.collision.addToGroup(rightBullet, 'playerProjectiles');
        }
    }

    /**
     * Fire the secondary weapon (missiles)
     */
    fireMissile() {
        const missileSpacing = 12;
        const missileDamage = 60;
        const initialVelocity = { x: 0, y: -50 };
        const missileSprite = this.game.assets.getImage('MISSILE'); // Use the correct key

        // Fire Left Missile from the pool
        const leftMissile = this.game.missilePool.get();
        if (leftMissile) {
            leftMissile.activate(this.x + this.width / 2 - missileSpacing, this.y, missileDamage, 'player', initialVelocity, missileSprite);
            this.game.entityManager.add(leftMissile);
            this.game.collision.addToGroup(leftMissile, 'playerProjectiles');
        }

        // Fire Right Missile from the pool
        const rightMissile = this.game.missilePool.get();
        if (rightMissile) {
            rightMissile.activate(this.x + this.width / 2 + missileSpacing, this.y, missileDamage, 'player', initialVelocity, missileSprite);
            this.game.entityManager.add(rightMissile);
            this.game.collision.addToGroup(rightMissile, 'playerProjectiles');
        }
    }

    /**
     * Fire a megabomb
     */
    fireMegabomb() {
        if (this.megabombs > 0) {
            this.megabombs--;

            // Create explosion effect
            const explosion = new Explosion(
                this.game,
                this.game.width / 2 - 128,
                this.game.height / 2 - 128,
                256,
                256
            );
            this.game.entityManager.add(explosion);

            // Clear all enemies and enemy projectiles
            const enemies = this.game.collision.collisionGroups.enemies;
            const enemyProjectiles = this.game.collision.collisionGroups.enemyProjectiles;

            // Damage all enemies
            enemies.forEach(enemy => {
                enemy.takeDamage(100); // Megabomb does massive damage
            });

            // Destroy all enemy projectiles
            enemyProjectiles.forEach(projectile => {
                projectile.destroy();
            });

            // Clear enemy projectiles group
            this.game.collision.collisionGroups.enemyProjectiles = [];

            // Play sound effect
            this.game.audio.playSound('megabomb');
        }
    }

    /**
     * Take damage
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        // Skip damage if invulnerable
        if (this.invulnerable) return;

        // Apply damage directly to health
        this.health -= amount;

        // Sync with playerData
        if (this.game.playerData) {
            this.game.playerData.health = this.health;
        }

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();

            // Create explosion
            const explosion = new Explosion(
                this.game,
                this.x + this.width / 2 - 32,
                this.y + this.height / 2 - 32,
                64,
                64
            );
            this.game.entityManager.add(explosion);

            // Game over
            this.game.changeState('gameover');
        } else {
            // Start invulnerability period
            this.invulnerable = true;
            this.invulnerabilityTime = 0;
        }

        // Play damage sound
        this.game.audio.playSound('playerDamage');
    }

    /**
     * Add health
     * @param {number} amount - Amount of health to add
     */
        /**
     * Add health
     * @param {number} amount - Amount of health to add
     */
    addHealth(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        // Sync with playerData
        if (this.game.playerData) {
            this.game.playerData.health = this.health;
        }
    }

    /**
     * Collect a health pickup.
     * @param {number} amount - The amount of health in the pickup.
     */
    collectHealthPickup(amount) {
        this.addHealth(amount);
    }

    /**
     * Add money to the player
     * @param {number} amount - Amount of money to add
     */
    addMoney(amount) {
        this.money += amount;
        // Sync with playerData
        if (this.game.playerData) {
            this.game.playerData.money = this.money;
        }
    }

    /**
     * Add score to the player
     * @param {number} amount - Amount of score to add
     */
    addScore(amount) {
        this.score += amount;
        this.game.playerData.score = this.score;
    }

    /**
     * Add megabomb
     */
    addMegabomb() {
        this.megabombs++;
    }

    /**
     * Upgrade primary weapon
     */
    upgradePrimaryWeapon() {
        const weapon = this.weapons['CANNON'];
        if (weapon && weapon.level < 5) {
            weapon.level++;

            // Adjust fireRate based on level
            weapon.fireRate = Math.max(100, 150 - (weapon.level - 1) * 25);
        }
    }
}

export { Player };

