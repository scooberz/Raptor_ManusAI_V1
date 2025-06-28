/**
 * Projectile class
 * Represents projectiles fired by the player and enemies
 */
import { Entity } from '../engine/entity.js';

export class Projectile extends Entity {
    constructor(game) {
        // The constructor is now very simple, only setting default values.
        super(game, 0, 0, 8, 16); // Using placeholder dimensions
        this.active = false; // All projectiles start as inactive in the pool
        this.layer = 'projectile';
    }

    /**
     * "Wakes up" a projectile from the pool and sets its properties for a new shot.
     */
    activate(x, y, velocityX, velocityY, damage, owner, sprite) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage;
        this.owner = owner;
        this.sprite = sprite; // This can be an image object or null
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) return; // Do nothing if inactive

        // Standard movement
        this.y += this.velocityY * (deltaTime / 1000);
        this.x += this.velocityX * (deltaTime / 1000);

        // If projectile is off-screen, destroy it (release it back to the pool)
        if (this.y < -this.height || this.y > this.game.height) {
            this.destroy();
        }
    }

    /**
     * Instead of permanently destroying the object, release it back to the pool.
     */
    destroy() {
        this.game.projectilePool.release(this);
    }

    render(context) {
        if (!this.active) return;

        // Ensure proper transparency
        context.globalCompositeOperation = 'source-over';

        // This logic allows for either a sprite or a programmatically drawn rectangle
        if (this.sprite) {
            // --- FIX IS HERE ---
            // We now provide a destination width and height to scale the sprite.
            const renderWidth = this.width;
            const renderHeight = this.height;
            // -------------------

            context.drawImage(
                this.sprite,
                this.x,
                this.y,
                renderWidth,  // Use the full width
                renderHeight  // Use the full height
            );
        } else {
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, 2, 4); // The tiny rectangle for the machine gun
        }
    }
}