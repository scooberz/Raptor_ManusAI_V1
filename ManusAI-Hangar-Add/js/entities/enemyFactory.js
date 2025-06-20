/**
 * EnemyFactory class
 * Factory for creating different types of enemies
 */
class EnemyFactory {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Create an enemy of the specified type
     * @param {string} type - Type of enemy to create
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created enemy
     */
    createEnemy(type, x, y) {
        let enemy;
        
        switch (type) {
            case 'fighter':
                enemy = this.createFighter(x, y);
                break;
            case 'turret':
                enemy = this.createTurret(x, y);
                break;
            case 'bomber':
                enemy = this.createBomber(x, y);
                break;
            case 'boss1':
                enemy = this.createBoss1(x, y);
                break;
            default:
                console.warn(`Unknown enemy type: ${type}`);
                return null;
        }
        
        // Add enemy to game
        this.game.entityManager.add(enemy);
        this.game.collision.addToGroup(enemy, 'enemies');
        
        return enemy;
    }
    
    /**
     * Create a fighter enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created fighter
     */
    createFighter(x, y) {
        const fighter = new Enemy(this.game, x, y, 40, 40, 'fighter');
        
        // Set fighter properties
        fighter.health = 20;
        fighter.score = 100;
        fighter.velocityY = 100;
        fighter.fireRate = 1500;
        fighter.lastFireTime = 0;
        
        // Set fighter sprite
        fighter.sprite = this.game.assets.getImage('enemyFighter');
        
        // Set fighter behavior
        fighter.update = function(deltaTime) {
            // Call parent update
            Enemy.prototype.update.call(this, deltaTime);
            
            // Fire at player
            const now = Date.now();
            if (now - this.lastFireTime > this.fireRate) {
                this.lastFireTime = now;
                
                // Only fire if on screen
                if (this.y > 0 && this.y < this.game.height) {
                    this.fire();
                }
            }
        };
        
        // Set fighter fire method
        fighter.fire = function() {
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
            
            // Play sound
            this.game.audio.playSound('enemyShoot');
        };
        
        return fighter;
    }
    
    /**
     * Create a turret enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created turret
     */
    createTurret(x, y) {
        const turret = new Enemy(this.game, x, y, 50, 50, 'turret');
        
        // Set turret properties
        turret.health = 40;
        turret.score = 200;
        turret.velocityY = 50;
        turret.fireRate = 2000;
        turret.lastFireTime = 0;
        
        // Set turret sprite
        turret.sprite = this.game.assets.getImage('enemyTurret');
        
        // Set turret behavior
        turret.update = function(deltaTime) {
            // Call parent update
            Enemy.prototype.update.call(this, deltaTime);
            
            // Fire at player
            const now = Date.now();
            if (now - this.lastFireTime > this.fireRate) {
                this.lastFireTime = now;
                
                // Only fire if on screen
                if (this.y > 0 && this.y < this.game.height) {
                    this.fire();
                }
            }
        };
        
        // Set turret fire method
        turret.fire = function() {
            // Calculate angle to player
            const player = this.game.player;
            if (!player || !player.active) return;
            
            const dx = player.x + player.width / 2 - (this.x + this.width / 2);
            const dy = player.y + player.height / 2 - (this.y + this.height / 2);
            const angle = Math.atan2(dy, dx);
            
            // Create projectile with angle
            const speed = 200;
            const projectile = new Projectile(
                this.game,
                this.x + this.width / 2 - 5,
                this.y + this.height / 2,
                10,
                10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                15,
                'enemy'
            );
            
            this.game.entityManager.add(projectile);
            this.game.collision.addToGroup(projectile, 'enemyProjectiles');
            
            // Play sound
            this.game.audio.playSound('enemyShoot');
        };
        
        return turret;
    }
    
    /**
     * Create a bomber enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created bomber
     */
    createBomber(x, y) {
        const bomber = new Enemy(this.game, x, y, 60, 40, 'bomber');
        
        // Set bomber properties
        bomber.health = 30;
        bomber.score = 150;
        bomber.velocityY = 70;
        bomber.dropRate = 2000;
        bomber.lastDropTime = 0;
        
        // Set bomber sprite
        bomber.sprite = this.game.assets.getImage('enemyFighter'); // Reuse fighter sprite for now
        
        // Set bomber behavior
        bomber.update = function(deltaTime) {
            // Call parent update
            Enemy.prototype.update.call(this, deltaTime);
            
            // Drop bombs
            const now = Date.now();
            if (now - this.lastDropTime > this.dropRate) {
                this.lastDropTime = now;
                
                // Only drop if on screen
                if (this.y > 0 && this.y < this.game.height) {
                    this.dropBomb();
                }
            }
        };
        
        // Set bomber drop bomb method
        bomber.dropBomb = function() {
            const bomb = new Projectile(
                this.game,
                this.x + this.width / 2 - 10,
                this.y + this.height,
                20,
                20,
                0,
                200,
                20,
                'enemy'
            );
            
            this.game.entityManager.add(bomb);
            this.game.collision.addToGroup(bomb, 'enemyProjectiles');
        };
        
        return bomber;
    }
    
    /**
     * Create a level 1 boss
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created boss
     */
    createBoss1(x, y) {
        const boss = new Enemy(this.game, x, y, 128, 128, 'boss1');
        
        // Set boss properties
        boss.health = 500;
        boss.score = 2000;
        boss.velocityY = 30;
        boss.fireRate = 1000;
        boss.lastFireTime = 0;
        boss.phase = 1;
        boss.phaseHealth = 500;
        boss.maxY = 100; // Stop at this Y position
        
        // Set boss sprite
        boss.sprite = this.game.assets.getImage('bossLevel1');
        
        // Set boss behavior
        boss.update = function(deltaTime) {
            // Stop at maxY
            if (this.y >= this.maxY) {
                this.y = this.maxY;
                this.velocityY = 0;
            }
            
            // Call parent update
            Enemy.prototype.update.call(this, deltaTime);
            
            // Update phase based on health
            this.updatePhase();
            
            // Fire at player
            const now = Date.now();
            if (now - this.lastFireTime > this.fireRate) {
                this.lastFireTime = now;
                this.fire();
            }
        };
        
        // Set boss update phase method
        boss.updatePhase = function() {
            const healthPercent = this.health / this.phaseHealth;
            
            if (healthPercent <= 0.3 && this.phase < 3) {
                this.phase = 3;
                this.fireRate = 400;
            } else if (healthPercent <= 0.6 && this.phase < 2) {
                this.phase = 2;
                this.fireRate = 700;
            }
        };
        
        // Set boss fire method
        boss.fire = function() {
            switch (this.phase) {
                case 1:
                    // Single shot
                    this.fireSingle();
                    break;
                case 2:
                    // Triple shot
                    this.fireTriple();
                    break;
                case 3:
                    // Spread shot
                    this.fireSpread();
                    break;
            }
            
            // Play sound
            this.game.audio.playSound('enemyShoot');
        };
        
        // Set boss fire single method
        boss.fireSingle = function() {
            const projectile = new Projectile(
                this.game,
                this.x + this.width / 2 - 10,
                this.y + this.height,
                20,
                20,
                0,
                300,
                20,
                'enemy'
            );
            
            this.game.entityManager.add(projectile);
            this.game.collision.addToGroup(projectile, 'enemyProjectiles');
        };
        
        // Set boss fire triple method
        boss.fireTriple = function() {
            for (let i = -1; i <= 1; i++) {
                const projectile = new Projectile(
                    this.game,
                    this.x + this.width / 2 - 5 + i * 20,
                    this.y + this.height,
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
        };
        
        // Set boss fire spread method
        boss.fireSpread = function() {
            const numProjectiles = 5;
            const spreadAngle = Math.PI / 3; // 60 degrees
            const startAngle = Math.PI / 2 - spreadAngle / 2; // Center at bottom
            
            for (let i = 0; i < numProjectiles; i++) {
                const angle = startAngle + (spreadAngle * i) / (numProjectiles - 1);
                const speed = 250;
                
                const projectile = new Projectile(
                    this.game,
                    this.x + this.width / 2 - 5,
                    this.y + this.height,
                    10,
                    10,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    10,
                    'enemy'
                );
                
                this.game.entityManager.add(projectile);
                this.game.collision.addToGroup(projectile, 'enemyProjectiles');
            }
        };
        
        // Override take damage to create explosions
        const originalTakeDamage = boss.takeDamage.bind(boss);
        boss.takeDamage = function(damage) {
            originalTakeDamage(damage);
            
            // Create small explosion at random position on boss
            if (Math.random() < 0.3) {
                const explosionX = this.x + Math.random() * this.width;
                const explosionY = this.y + Math.random() * this.height;
                
                const explosion = new Explosion(
                    this.game,
                    explosionX,
                    explosionY,
                    40,
                    40
                );
                
                this.game.entityManager.add(explosion);
            }
        };
        
        // Override destroy to create multiple explosions
        const originalDestroy = boss.destroy.bind(boss);
        boss.destroy = function() {
            // Create multiple explosions
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    if (!this.game) return; // Safety check
                    
                    const explosionX = this.x + Math.random() * this.width;
                    const explosionY = this.y + Math.random() * this.height;
                    
                    const explosion = new Explosion(
                        this.game,
                        explosionX,
                        explosionY,
                        60,
                        60
                    );
                    
                    this.game.entityManager.add(explosion);
                    
                    // Play explosion sound
                    this.game.audio.playSound('explosion');
                }, i * 200);
            }
            
            // Call original destroy
            originalDestroy();
        };
        
        return boss;
    }
}

