/**
 * DestructibleObject class
 * Represents static destructible environmental objects
 */
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { ImpactEffect } from './impactEffect.js';
import { getEnvironmentData } from '../../assets/data/environmentData.js';

class DestructibleObject extends Entity {
    constructor(game, x, y, environmentType, spriteKey) {
        // Get environment data
        const envData = getEnvironmentData(environmentType);
        if (!envData) {
            throw new Error(`Unknown environment type: ${environmentType}`);
        }
        
        super(game, x, y, envData.width, envData.height);
        
        // Set the layer for rendering
        this.layer = 'environment';
        
        // Environment properties
        this.environmentType = environmentType;
        this.environmentData = envData;
        this.maxHealth = envData.health;
        this.health = this.maxHealth;
        this.scoreValue = envData.scoreValue;
        this.explosionSize = envData.explosionSize;
        
        // Load sprite and set ready state
        this.sprite = this.game.assets.getImage(spriteKey);
        if (this.sprite) {
            this.isReady = true;
        } else {
            console.error(`Failed to load sprite with key "${spriteKey}" for environment object: ${environmentType}.`);
            this.isReady = false;
        }
        
        // Static object - no movement
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Collision properties
        this.collisionGroup = 'environment';
        this.canTakeDamage = true;
        
        // Visual properties
        this.damaged = false;
        this.damageThreshold = this.maxHealth * 0.5; // Show damage at 50% health
    }
    
    /**
     * Update the destructible object
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Move the object down the screen at the same speed as the background
        if (this.game.mainScrollSpeed) {
            this.y += this.game.mainScrollSpeed * (deltaTime / 1000);
        }

        // Call the parent Entity's update method to handle being active, etc.
        super.update(deltaTime);

        // Remove if it goes off the bottom of the screen
        if (this.y > this.game.height + this.height) {
            this.destroy();
        }
        
        // Check if object should show damage
        if (this.health <= this.damageThreshold && !this.damaged) {
            this.damaged = true;
        }
    }
    
    /**
     * Take damage from projectiles or other sources
     * @param {number} damage - Amount of damage to take
     * @param {Entity} sourceProjectile - The projectile that caused the damage (optional)
     */
    takeDamage(damage, sourceProjectile = null) {
        if (!this.canTakeDamage || !this.active) {
            return false;
        }
        
        this.health -= damage;
        
        // Create impact effect at projectile position
        if (sourceProjectile && this.game.currentState && this.game.currentState.effectManager) {
            this.game.currentState.effectManager.add(new ImpactEffect(this.game, sourceProjectile.x, sourceProjectile.y));
        }
        
        // Check if destroyed
        if (this.health <= 0) {
            this.destroyObject();
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a small impact effect when hit
     */
    createImpactEffect() {
        // Create small sparks or debris effect
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Add small explosion effect at impact point
        const smallExplosion = new Explosion(
            this.game,
            centerX - 16,
            centerY - 16,
            32,
            32
        );
        
        this.game.entityManager.add(smallExplosion);
    }
    
    /**
     * Destroy the object and create explosion
     */
    destroyObject() {
        // Add score to player
        if (this.game.currentState && this.game.currentState.player) {
            this.game.currentState.player.addScore(this.scoreValue);
        }
        
        // Create explosion based on size
        this.createExplosion();
        
        // Mark for destruction
        this.destroy();
    }
    
    /**
     * Create explosion effect based on object's explosion size
     */
    createExplosion() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        let explosionWidth, explosionHeight;
        
        // Determine explosion size
        switch (this.explosionSize) {
            case 'small':
                explosionWidth = 48;
                explosionHeight = 48;
                break;
            case 'medium':
                explosionWidth = 80;
                explosionHeight = 80;
                break;
            case 'large':
                explosionWidth = 120;
                explosionHeight = 120;
                break;
            default:
                explosionWidth = 64;
                explosionHeight = 64;
        }
        
        // Create main explosion
        const explosion = new Explosion(
            this.game,
            centerX - explosionWidth / 2,
            centerY - explosionHeight / 2,
            explosionWidth,
            explosionHeight
        );
        
        this.game.entityManager.add(explosion);
        
        // For large explosions, create additional smaller explosions
        if (this.explosionSize === 'large') {
            this.createSecondaryExplosions(centerX, centerY);
        }
    }
    
    /**
     * Create secondary explosions for large objects
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     */
    createSecondaryExplosions(centerX, centerY) {
        const numSecondary = 3;
        const radius = 40;
        
        for (let i = 0; i < numSecondary; i++) {
            const angle = (i / numSecondary) * Math.PI * 2;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            
            setTimeout(() => {
                if (this.game.entityManager) {
                    const secondaryExplosion = new Explosion(
                        this.game,
                        centerX + offsetX - 24,
                        centerY + offsetY - 24,
                        48,
                        48
                    );
                    this.game.entityManager.add(secondaryExplosion);
                }
            }, i * 150); // Stagger the secondary explosions
        }
    }
    
    /**
     * Render the destructible object
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        if (this.sprite) {
            // Apply damage tinting if damaged
            if (this.damaged) {
                context.save();
                context.globalAlpha = 0.8;
                context.filter = 'sepia(100%) hue-rotate(0deg) saturate(200%)';
            }
            
            context.drawImage(
                this.sprite,
                0,
                0,
                this.sprite.width,
                this.sprite.height,
                Math.floor(this.x),
                Math.floor(this.y),
                this.width,
                this.height
            );
            
            if (this.damaged) {
                context.restore();
            }
        } else {
            // Render placeholder based on environment type
            this.renderPlaceholder(context);
        }
        
        // Render health bar for debugging (optional)
        if (this.game.debug) {
            this.renderHealthBar(context);
        }
    }
    
    /**
     * Render a placeholder when sprite is not available
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderPlaceholder(context) {
        // Choose color based on environment type
        let color = '#666666'; // Default gray
        
        switch (this.environmentType) {
            case 'FUEL_TANK':
                color = '#FF6600'; // Orange
                break;
            case 'RADAR_DISH':
                color = '#0066FF'; // Blue
                break;
            case 'BUNKER':
                color = '#444444'; // Dark gray
                break;
            case 'SILO':
                color = '#FF0000'; // Red
                break;
            case 'TURRET_BASE':
                color = '#FFFF00'; // Yellow
                break;
            case 'POWER_STATION':
                color = '#00FF00'; // Green
                break;
            default:
                color = '#666666'; // Gray
        }
        
        // Apply damage tinting
        if (this.damaged) {
            context.save();
            context.globalAlpha = 0.7;
        }
        
        // Draw main shape
        context.fillStyle = color;
        context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        
        // Draw border
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        
        // Draw type indicator
        context.fillStyle = '#FFFFFF';
        context.font = '10px Arial';
        context.textAlign = 'center';
        context.fillText(
            this.environmentType.substring(0, 4),
            Math.floor(this.x + this.width / 2),
            Math.floor(this.y + this.height / 2 + 3)
        );
        
        if (this.damaged) {
            context.restore();
        }
    }
    
    /**
     * Render health bar for debugging
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderHealthBar(context) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;
        
        // Background
        context.fillStyle = '#FF0000';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        context.fillStyle = '#00FF00';
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * Check if this object is off screen (override to prevent removal)
     * @returns {boolean} Always false for static objects
     */
    isOffScreen() {
        // Static environment objects should never be removed for being off screen
        return false;
    }
    
    /**
     * Get information about this destructible object
     * @returns {Object} Object information
     */
    getInfo() {
        return {
            type: this.environmentType,
            name: this.environmentData.name,
            health: this.health,
            maxHealth: this.maxHealth,
            scoreValue: this.scoreValue,
            explosionSize: this.explosionSize,
            damaged: this.damaged
        };
    }
}

export { DestructibleObject };

