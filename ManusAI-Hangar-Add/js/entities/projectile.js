/**
 * Projectile class
 * Represents projectiles fired by player and enemies
 */
class Projectile extends Entity {
    constructor(game, x, y, width, height, velocityX, velocityY, damage, owner) {
        super(game, x, y, width, height);
        
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage;
        this.owner = owner; // 'player' or 'enemy'
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        
        // Load appropriate sprite based on owner
        this.loadSprite();
    }
    
    /**
     * Load the appropriate sprite based on owner
     */
    loadSprite() {
        if (this.owner === 'player') {
            this.sprite = this.game.assets.getImage('playerBullet');
        } else {
            this.sprite = this.game.assets.getImage('enemyBullet');
        }
    }
    
    /**
     * Update projectile state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if projectile is off screen
        if (this.isOffScreen()) {
            this.destroy();
        }
    }
    
    /**
     * Render the projectile
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        if (this.sprite) {
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
        } else {
            // Default rendering if no sprite is available
            context.fillStyle = this.owner === 'player' ? 'blue' : 'red';
            context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        }
    }
    
    /**
     * Check if projectile is off screen
     * @returns {boolean} True if off screen, false otherwise
     */
    isOffScreen() {
        return (
            this.x < -this.width ||
            this.x > this.game.width + this.width ||
            this.y < -this.height ||
            this.y > this.game.height + this.height
        );
    }
}

/**
 * HomingProjectile class
 * A projectile that homes in on a target
 */
class HomingProjectile extends Projectile {
    constructor(game, x, y, width, height, damage, owner, target, speed, turnRate) {
        super(game, x, y, width, height, 0, 0, damage, owner);
        
        this.target = target;
        this.speed = speed;
        this.turnRate = turnRate; // How quickly the projectile can change direction (radians per second)
        this.angle = 0; // Current angle of movement
        
        // Calculate initial angle towards target
        this.updateAngle(0);
    }
    
    /**
     * Update homing projectile state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update angle towards target if target exists and is active
        if (this.target && this.target.active) {
            this.updateAngle(deltaTime);
        }
        
        // Update velocity based on angle
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        
        super.update(deltaTime);
    }
    
    /**
     * Update angle towards target
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateAngle(deltaTime) {
        if (!this.target || !this.target.active) return;
        
        // Calculate target angle
        const targetX = this.target.x + this.target.width / 2;
        const targetY = this.target.y + this.target.height / 2;
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const targetAngle = Math.atan2(dy, dx);
        
        // Calculate angle difference
        let angleDiff = targetAngle - this.angle;
        
        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Calculate maximum angle change this frame
        const maxTurn = this.turnRate * (deltaTime / 1000);
        
        // Apply turn rate limit
        if (angleDiff > maxTurn) {
            angleDiff = maxTurn;
        } else if (angleDiff < -maxTurn) {
            angleDiff = -maxTurn;
        }
        
        // Update angle
        this.angle += angleDiff;
    }
    
    /**
     * Render the homing projectile
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        context.save();
        
        // Translate to projectile center
        context.translate(
            Math.floor(this.x + this.width / 2),
            Math.floor(this.y + this.height / 2)
        );
        
        // Rotate to match movement direction
        context.rotate(this.angle);
        
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Default rendering if no sprite is available
            context.fillStyle = this.owner === 'player' ? 'cyan' : 'orange';
            context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        context.restore();
    }
}

