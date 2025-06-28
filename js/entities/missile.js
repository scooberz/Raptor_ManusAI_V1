import { Projectile } from './projectile.js';
import { SmokeParticle } from './smokeParticle.js';

export class Missile extends Projectile {
    constructor(game) {
        super(game); // Calls the simple constructor from the base Projectile
        this.width = 16;
        this.height = 32;
        this.smokeTimer = 0;
        this.smokeInterval = 50; // Create smoke every 50ms
    }

    // The activate method is now responsible for all setup
    activate(x, y, damage, owner, initialVelocity, sprite) {
        // Call the base activate method to set common properties
        super.activate(x, y, initialVelocity.x, initialVelocity.y, damage, owner, sprite);

        // Missile-specific properties
        this.acceleration = 1.2;
        this.maxSpeed = 600;
        this.smokeTimer = 0;
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

        // Create smoke puff effects
        this.smokeTimer += deltaTime;
        if (this.smokeTimer >= this.smokeInterval) {
            this.createSmokePuff();
            this.smokeTimer = 0;
        }

        // Call the base update method for movement and off-screen check
        super.update(deltaTime);
    }

    createSmokePuff() {
        // Create smoke at the missile's position
        const smokeX = this.x + this.width / 2 + (Math.random() - 0.5) * 8;
        const smokeY = this.y + this.height + (Math.random() - 0.5) * 4;
        
        const smoke = new SmokeParticle(this.game, smokeX, smokeY);
        this.game.entityManager.add(smoke);
    }

    destroy() {
        // Overrides the base destroy to release back to the correct pool
        this.game.missilePool.release(this);
    }
} 