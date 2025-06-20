/**
 * Enemy class
 * Base class for all enemy entities
 */
class Enemy extends Entity {
    constructor(game, x, y, width, height, type, health, points, collisionDamage) {
        super(game, x, y, width, height);
        
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.points = points;
        this.collisionDamage = collisionDamage;
        
        // Movement pattern
        this.pattern = 'straight';
        this.patternParams = {};
        
        // Weapon properties
        this.canFire = false;
        this.fireRate = 0;
        this.lastFired = 0;
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 1;
        this.frameTimer = 0;
        this.frameInterval = 200;
        
        // Damage visual effect
        this.hitTime = 0;
        this.hitDuration = 100;
        this.hit = false;
    }
    
    /**
     * Update enemy state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update movement based on pattern
        this.updateMovement(deltaTime);
        
        // Handle firing
        if (this.canFire) {
            this.updateFiring(deltaTime);
        }
        
        // Update hit effect
        if (this.hit) {
            this.hitTime += deltaTime;
            if (this.hitTime >= this.hitDuration) {
                this.hit = false;
                this.hitTime = 0;
            }
        }
        
        // Update animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
        
        super.update(deltaTime);
    }
    
    /**
     * Render the enemy
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        if (this.sprite) {
            // Apply hit effect (white flash)
            if (this.hit) {
                context.globalCompositeOperation = 'lighter';
            }
            
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                Math.floor(this.x),
                Math.floor(this.y),
                this.width,
                this.height
            );
            
            // Reset composite operation
            if (this.hit) {
                context.globalCompositeOperation = 'source-over';
            }
            
            // Draw health bar for larger enemies and bosses
            if (this.maxHealth > 50) {
                this.renderHealthBar(context);
            }
        } else {
            super.render(context);
        }
    }
    
    /**
     * Render health bar for larger enemies
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderHealthBar(context) {
        const barWidth = this.width;
        const barHeight = 5;
        const barX = this.x;
        const barY = this.y - 10;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        context.fillStyle = this.getHealthColor(healthPercent);
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * Get color for health bar based on health percentage
     * @param {number} percent - Health percentage (0-1)
     * @returns {string} Color string
     */
    getHealthColor(percent) {
        if (percent > 0.6) return 'green';
        if (percent > 0.3) return 'yellow';
        return 'red';
    }
    
    /**
     * Update movement based on pattern
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateMovement(deltaTime) {
        switch (this.pattern) {
            case 'straight':
                // Continue with current velocity
                break;
                
            case 'sine':
                // Sine wave movement
                this.x = this.patternParams.centerX + 
                    Math.sin(this.patternParams.time) * this.patternParams.amplitude;
                this.patternParams.time += deltaTime / 1000 * this.patternParams.frequency;
                break;
                
            case 'circle':
                // Circular movement
                this.x = this.patternParams.centerX + 
                    Math.cos(this.patternParams.time) * this.patternParams.radius;
                this.y = this.patternParams.centerY + 
                    Math.sin(this.patternParams.time) * this.patternParams.radius;
                this.patternParams.time += deltaTime / 1000 * this.patternParams.speed;
                break;
                
            case 'zigzag':
                // Zigzag movement
                if (!this.patternParams.direction) {
                    this.patternParams.direction = 1;
                }
                
                this.x += this.patternParams.speed * this.patternParams.direction * (deltaTime / 1000);
                
                if (this.x <= this.patternParams.minX || this.x >= this.patternParams.maxX) {
                    this.patternParams.direction *= -1;
                }
                break;
        }
    }
    
    /**
     * Update firing logic
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateFiring(deltaTime) {
        const now = Date.now();
        
        if (now - this.lastFired > this.fireRate) {
            this.lastFired = now;
            this.fire();
        }
    }
    
    /**
     * Fire weapon
     */
    fire() {
        // Create enemy projectile
        const projectile = new Projectile(
            this.game,
            this.x + this.width / 2 - 5,
            this.y + this.height,
            10,
            20,
            0,
            300,
            10,
            'enemy'
        );
        
        this.game.entityManager.add(projectile);
        this.game.collision.addToGroup(projectile, 'enemyProjectiles');
        
        // Play sound effect
        this.game.audio.playSound('enemyShoot');
    }
    
    /**
     * Take damage
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        this.health -= amount;
        
        // Visual hit effect
        this.hit = true;
        this.hitTime = 0;
        
        if (this.health <= 0) {
            this.destroy();
            this.dropLoot();
            
            // Add score and money to player
            if (this.game.player) {
                this.game.player.addScore(this.points);
                this.game.player.addMoney(this.points);
            }
            
            // Create explosion
            const explosion = new Explosion(
                this.game,
                this.x + this.width / 2 - 32,
                this.y + this.height / 2 - 32,
                64,
                64
            );
            
            this.game.entityManager.add(explosion);
            
            // Play explosion sound
            this.game.audio.playSound('explosion');
        }
    }
    
    /**
     * Drop loot when destroyed
     */
    dropLoot() {
        // Random chance to drop collectibles
        const roll = Math.random();
        
        if (roll < 0.1) {
            // 10% chance to drop health
            const healthPickup = new Collectible(
                this.game,
                this.x + this.width / 2 - 15,
                this.y + this.height / 2 - 15,
                30,
                30,
                'health',
                20
            );
            
            this.game.entityManager.add(healthPickup);
            this.game.collision.addToGroup(healthPickup, 'collectibles');
        } else if (roll < 0.15) {
            // 5% chance to drop shield
            const shieldPickup = new Collectible(
                this.game,
                this.x + this.width / 2 - 15,
                this.y + this.height / 2 - 15,
                30,
                30,
                'shield',
                20
            );
            
            this.game.entityManager.add(shieldPickup);
            this.game.collision.addToGroup(shieldPickup, 'collectibles');
        } else if (roll < 0.17) {
            // 2% chance to drop megabomb
            const megabombPickup = new Collectible(
                this.game,
                this.x + this.width / 2 - 15,
                this.y + this.height / 2 - 15,
                30,
                30,
                'megabomb',
                1
            );
            
            this.game.entityManager.add(megabombPickup);
            this.game.collision.addToGroup(megabombPickup, 'collectibles');
        }
    }
    
    /**
     * Set movement pattern
     * @param {string} pattern - Pattern type ('straight', 'sine', 'circle', 'zigzag')
     * @param {Object} params - Pattern parameters
     */
    setMovementPattern(pattern, params) {
        this.pattern = pattern;
        this.patternParams = params;
    }
}

/**
 * EnemyFactory class
 * Factory for creating different types of enemies
 */
class EnemyFactory {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Create an enemy
     * @param {string} type - Enemy type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created enemy
     */
    createEnemy(type, x, y) {
        let enemy;
        
        switch (type) {
            case 'fighter':
                enemy = new Enemy(this.game, x, y, 48, 48, 'fighter', 30, 100, 20);
                enemy.velocityY = 150;
                enemy.canFire = true;
                enemy.fireRate = 2000;
                enemy.sprite = this.game.assets.getImage('enemyFighter');
                break;
                
            case 'bomber':
                enemy = new Enemy(this.game, x, y, 64, 64, 'bomber', 50, 200, 30);
                enemy.velocityY = 100;
                enemy.canFire = false;
                enemy.sprite = this.game.assets.getImage('enemyBomber');
                break;
                
            case 'turret':
                enemy = new Enemy(this.game, x, y, 48, 48, 'turret', 40, 150, 0);
                enemy.velocityY = 50;
                enemy.canFire = true;
                enemy.fireRate = 1500;
                enemy.sprite = this.game.assets.getImage('enemyTurret');
                break;
                
            case 'boss1':
                enemy = new Enemy(this.game, x, y, 128, 128, 'boss1', 500, 1000, 50);
                enemy.velocityY = 30;
                enemy.canFire = true;
                enemy.fireRate = 1000;
                enemy.sprite = this.game.assets.getImage('bossLevel1');
                
                // Set up a more complex firing pattern for the boss
                const originalFire = enemy.fire.bind(enemy);
                enemy.fire = function() {
                    // Fire multiple projectiles
                    for (let i = -2; i <= 2; i++) {
                        const projectile = new Projectile(
                            this.game,
                            this.x + this.width / 2 - 5 + (i * 20),
                            this.y + this.height / 2,
                            10,
                            20,
                            i * 50,
                            300,
                            15,
                            'enemy'
                        );
                        
                        this.game.entityManager.add(projectile);
                        this.game.collision.addToGroup(projectile, 'enemyProjectiles');
                    }
                    
                    // Play sound effect
                    this.game.audio.playSound('enemyShoot');
                };
                break;
                
            // Add more enemy types as needed
        }
        
        if (enemy) {
            this.game.entityManager.add(enemy);
            this.game.collision.addToGroup(enemy, 'enemies');
        }
        
        return enemy;
    }
}

