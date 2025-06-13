/**
 * Projectile class
 * Represents projectiles fired by player and enemies
 */
class Projectile extends Entity {
    constructor(game, x, y, width, height, velocityX, velocityY, damage, owner) {
        super(game, x, y, width, height);
        this.layer = 'projectile';
        
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