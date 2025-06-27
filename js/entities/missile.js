import { Projectile } from './projectile.js';

export class Missile extends Projectile {
    constructor(game) {
        super(game); // Calls the simple constructor from the base Projectile
        this.width = 12;
        this.height = 24;
    }

    // The activate method is now responsible for all setup
    activate(x, y, damage, owner, initialVelocity, sprite) {
        // Call the base activate method to set common properties
        super.activate(x, y, initialVelocity.x, initialVelocity.y, damage, owner, sprite);

        // Missile-specific properties
        this.acceleration = 1.2;
        this.maxSpeed = 600;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Apply acceleration for player missiles
        if (this.owner === 'player') {
            this.velocityY *= this.acceleration;
            if (Math.abs(this.velocityY) > this.maxSpeed) {
                this.velocityY = -this.maxSpeed;
            }
        }

        // Call the base update method for movement and off-screen check
        super.update(deltaTime);
    }

    destroy() {
        // Overrides the base destroy to release back to the correct pool
        this.game.missilePool.release(this);
    }
} 