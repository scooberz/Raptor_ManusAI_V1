/**
 * Player class
 * Represents the player's ship
 */
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { Projectile } from './projectile.js';

class Player extends Entity {
    constructor(game) {
        super(game, game.width / 2 - 32, game.height - 80, 64, 64);
        this.layer = 'player'; // Define the rendering layer
        
        // Player stats
        this.speed = 575; // Increased from 500 by 15%
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 0;
        this.maxShield = 100;
        this.money = 0;
        this.score = 0;
        this.collisionDamage = 20;
        
        // Weapon system
        this.weapons = {
            primary: {
                type: 'machineGun',
                level: 1,
                cooldown: 50, // Much faster firing rate
                lastFired: 0
            },
            special: {
                type: null,
                count: 0,
                cooldown: 500,
                lastFired: 0
            }
        };
        
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
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.game.height) this.y = this.game.height - this.height;
    }
    
    /**
     * Handle player weapons based on input
     */
    handleWeapons() {
        const now = Date.now();
        
        // Primary weapon - machine gun (now using left mouse button)
        if (this.game.input.isMouseButtonPressed('left')) {
            if (now - this.weapons.primary.lastFired > this.weapons.primary.cooldown) {
                this.weapons.primary.lastFired = now;
                this.firePrimary();
            }
        }
        
        // Special weapon selection
        if (this.game.input.isKeyPressed('Alt')) {
            this.cycleSpecialWeapon();
        }
        
        // Special weapon firing
        if (this.game.input.isKeyPressed('Shift')) {
            if (this.weapons.special.type && now - this.weapons.special.lastFired > this.weapons.special.cooldown) {
                this.weapons.special.lastFired = now;
                this.fireSpecial();
            }
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
        if (!this.visible) return;

        // Determine which sprite to use based on movement
        let currentSprite = this.sprites.base;
        if (this.game.input.isMouseButtonPressed('left')) {
            currentSprite = this.sprites.thrust;
        }
        
        // Apply turning sprites with smooth transitions
        if (this.currentDirection > 0) {
            currentSprite = this.sprites.right;
        } else if (this.currentDirection < 0) {
            currentSprite = this.sprites.left;
        }
        
        // Draw the appropriate sprite
        if (currentSprite) {
            // Use the correct 5-argument version of drawImage
            context.drawImage(
                currentSprite,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        
        // Draw shield effect if active
        if (this.shield > 0) {
            context.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width * 0.7,
                0,
                Math.PI * 2
            );
            context.stroke();
        }
    }
    
    /**
     * Fire the primary weapon
     */
    firePrimary() {
        switch (this.weapons.primary.type) {
            case 'machineGun':
                this.createMachineGunProjectile();
                break;
            // Add more weapon types as needed
        }
        
        // Play sound effect
        this.game.audio.playSound('playerShoot');
    }
    
    /**
     * Create a machine gun projectile
     */
    createMachineGunProjectile() {
        const numBullets = 2; // Two streams
        const spreadWidth = 15; // Narrower spread
        const bulletWidth = 4;
        const bulletHeight = 8;
        const bulletSpeed = -600; // Slower velocity
        
        for (let i = 0; i < numBullets; i++) {
            const spreadOffset = (i - (numBullets - 1) / 2) * (spreadWidth / (numBullets - 1));
            
            const projectile = new Projectile(
                this.game,
                this.x + this.width / 2 - bulletWidth / 2 + spreadOffset,
                this.y,
                bulletWidth,
                bulletHeight,
                0,
                bulletSpeed,
                5 * this.weapons.primary.level,
                'player'
            );
            
            this.game.entityManager.add(projectile);
            this.game.collision.addToGroup(projectile, 'playerProjectiles');
        }
    }
    
    /**
     * Cycle through special weapons
     */
    cycleSpecialWeapon() {
        // Implement special weapon cycling logic
        // This would be called when the Alt key is pressed
    }
    
    /**
     * Fire the special weapon
     */
    fireSpecial() {
        // Implement special weapon firing logic
        // This would be called when the Shift key is pressed
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
        
        // Apply damage to shield first, then health
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }
        
        if (amount > 0) {
            this.health -= amount;
            
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
        }
        
        // Play damage sound
        this.game.audio.playSound('playerDamage');
    }
    
    /**
     * Add health
     * @param {number} amount - Amount of health to add
     */
    addHealth(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    /**
     * Add shield
     * @param {number} amount - Amount of shield to add
     */
    addShield(amount) {
        this.shield = Math.min(this.shield + amount, this.maxShield);
    }
    
    /**
     * Add money to the player
     * @param {number} amount - Amount of money to add
     */
    addMoney(amount) {
        this.money += amount;
        this.game.playerData.money = this.money;
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
        if (this.weapons.primary.level < 5) {
            this.weapons.primary.level++;
            
            // Adjust cooldown based on level
            this.weapons.primary.cooldown = Math.max(50, 200 - (this.weapons.primary.level - 1) * 30);
        }
    }
}

export { Player };

