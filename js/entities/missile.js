import { Projectile } from './projectile.js';
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';

export class Missile extends Projectile {
    constructor(game, x, y, damage, owner, initialVelocity = {x: 0, y: -50}) {
        const width = 12;
        const height = 24;

        super(game, x, y, width, height, initialVelocity.x, initialVelocity.y, damage, owner);
        
        // Player-specific properties for acceleration
        if (this.owner === 'player') {
            this.acceleration = 700; // Pixels per second per second
            this.maxSpeed = 500;
        }
        
        // Missile-specific properties
        this.hasHitTarget = false; // Track if missile has hit something
    }

    update(deltaTime) {
        // Don't update if missile has hit a target
        if (this.hasHitTarget) {
            return;
        }
        
        // --- Acceleration Logic for PLAYER missiles ONLY ---
        if (this.owner === 'player') {
            const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
            if (currentSpeed < this.maxSpeed) {
                // We assume the missile always fires straight up initially (angle = -PI/2)
                const newSpeed = Math.min(this.maxSpeed, currentSpeed + this.acceleration * (deltaTime / 1000));
                this.velocityY = -newSpeed; // Accelerate upwards
            }
        }
        
        // Let the parent Entity class handle the actual position update
        super.update(deltaTime);
    }
    
    /**
     * Handle collision with a target
     * @param {Entity} target - The entity that was hit
     */
    onHitTarget(target) {
        if (this.hasHitTarget) return; // Prevent multiple hits
        
        this.hasHitTarget = true;
        
        // Create small explosion effect at impact point
        if (this.game.entityManager) {
            const explosion = new Explosion(
                this.game,
                this.x + this.width / 2 - 16,
                this.y + this.height / 2 - 16,
                32,
                32
            );
            this.game.entityManager.add(explosion);
        }
        
        // Destroy the missile
        this.destroy();
    }
} 