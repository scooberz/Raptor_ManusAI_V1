/**
 * Projectile class
 * Represents projectiles fired by the player and enemies
 */
import { Entity } from '../engine/entity.js';

class Projectile extends Entity {
    constructor(game, x, y, width, height, velocityX, velocityY, damage, owner, spriteName) {
        super(game, x, y, width, height);
        this.layer = 'projectile';

        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage;
        this.owner = owner; // 'player' or 'enemy'
        this.spriteName = spriteName;
        this.sprite = this.game.assets.getImage(this.spriteName);
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
        // Special case: If this is the player's standard bullet, draw a simple rectangle.
        if (this.owner === 'player' && this.spriteName === 'playerBullet') {
            context.fillStyle = '#90ee90'; // A bright, classic green
            context.fillRect(this.x, this.y, 2, 4); // Draw a 2x4 pixel "bullet"
        }
        // For all other projectiles (enemy bullets, missiles, etc.), draw their assigned sprite.
        else if (this.sprite) {
            context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
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

export { Projectile };