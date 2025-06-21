/**
 * HomingProjectile class
 * A projectile that homes in on a target
 */
import { Projectile } from './projectile.js';
import { Explosion } from './explosion.js';

class HomingProjectile extends Projectile {
    /**
     * Create a new homing projectile
     * @param {Game} game - Game instance
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} damage - Damage amount
     * @param {string} source - Source of projectile ('player' or 'enemy')
     * @param {Entity} target - Target entity to home in on
     * @param {number} speed - Movement speed
     * @param {number} turnRate - Maximum turning rate in radians per second
     */
    constructor(game, x, y, width, height, damage, source, target, speed, turnRate) {
        // Initialize with zero velocity, we'll calculate it in update
        super(game, x, y, width, height, 0, 0, damage, source);
        this.layer = 'projectile'; // Define the rendering layer
        
        this.target = target;
        this.speed = speed;
        this.turnRate = turnRate;
        this.angle = Math.PI / 2; // Start moving downward
        
        // Homing missiles are now destructible
        this.health = 10; // Can be adjusted for difficulty
        this.maxHealth = 10;
        
        // Override sprite with homing missile sprite
        this.sprite = this.source === 'player' ? 
            this.game.assets.getImage('playerMissile') : 
            this.game.assets.getImage('enemyMissile');
            
        // If no specific missile sprite is available, use a different color
        if (!this.sprite) {
            this.color = this.source === 'player' ? '#00ffff' : '#ff00ff';
        }
        
        // Add to 'enemies' collision group if enemy missile
        if (this.source === 'enemy') {
            this.game.collision.addToGroup(this, 'enemies');
        }
    }
    
    /**
     * Update the homing projectile
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Check if target is still valid
        if (!this.target || !this.target.active) {
            // No target, continue on current trajectory
            super.update(deltaTime);
            return;
        }
        
        // Calculate angle to target
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
        
        // Apply turn rate limit
        const maxTurn = this.turnRate * deltaTime / 1000;
        const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
        
        // Update angle
        this.angle += turn;
        
        // Update velocity based on angle
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        
        // Call parent update
        super.update(deltaTime);
    }
    
    /**
     * Render the homing projectile
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (this.sprite) {
            // Save context
            ctx.save();
            
            // Translate to center of projectile
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            
            // Rotate to match movement direction
            ctx.rotate(this.angle + Math.PI / 2); // Add 90 degrees to point sprite in direction of travel
            
            // Draw sprite centered
            ctx.drawImage(
                this.sprite,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            
            // Restore context
            ctx.restore();
        } else {
            // No sprite, draw a colored triangle
            ctx.save();
            
            // Translate to center of projectile
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            
            // Rotate to match movement direction
            ctx.rotate(this.angle + Math.PI / 2);
            
            // Draw triangle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(-this.width / 2, this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Restore context
            ctx.restore();
        }
    }
    
    /**
     * Take damage (for destructible homing missiles)
     * @param {number} amount
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
            // Spawn a small explosion effect
            const explosion = new Explosion(
                this.game,
                this.x + this.width / 2 - 16,
                this.y + this.height / 2 - 16,
                32,
                32
            );
            this.game.entityManager.add(explosion);
            this.game.audio.playSound('explosion');
        }
    }
}

export { HomingProjectile };

