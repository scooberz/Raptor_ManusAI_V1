/**
 * Player class
 * Represents the player's ship
 */
class Player extends Entity {
    constructor(game, x, y) {
        super(game, x, y, 64, 64);
        
        // Player stats
        this.speed = 300;
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
                cooldown: 200,
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
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 2;
        this.frameTimer = 0;
        this.frameInterval = 100;
        
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
        this.sprite = this.game.assets.getImage('playerShipBase');
        this.thrustSprite = this.game.assets.getImage('playerShipThrust');
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
        // Reset velocity
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Handle keyboard input
        if (this.game.input.isKeyPressed('ArrowLeft') || this.game.input.isKeyPressed('a')) {
            this.velocityX = -this.speed;
        }
        
        if (this.game.input.isKeyPressed('ArrowRight') || this.game.input.isKeyPressed('d')) {
            this.velocityX = this.speed;
        }
        
        if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
            this.velocityY = -this.speed;
        }
        
        if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
            this.velocityY = this.speed;
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
        
        // Primary weapon
        if (this.game.input.isKeyPressed('Control') || this.game.input.isKeyPressed(' ')) {
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
        
        // Choose sprite based on movement
        const currentSprite = (this.velocityY < 0) ? this.thrustSprite : this.sprite;
        
        if (currentSprite) {
            context.drawImage(
                currentSprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                Math.floor(this.x),
                Math.floor(this.y),
                this.width,
                this.height
            );
        } else {
            super.render(context);
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
        const projectile = new Projectile(
            this.game,
            this.x + this.width / 2 - 5,
            this.y,
            10,
            20,
            0,
            -600,
            10 * this.weapons.primary.level,
            'player'
        );
        
        this.game.entityManager.add(projectile);
        this.game.collision.addToGroup(projectile, 'playerProjectiles');
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
     * Add money
     * @param {number} amount - Amount of money to add
     */
    addMoney(amount) {
        this.money += amount;
    }
    
    /**
     * Add score
     * @param {number} amount - Amount of score to add
     */
    addScore(amount) {
        this.score += amount;
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

