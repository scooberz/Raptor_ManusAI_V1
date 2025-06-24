import { Entity } from '../engine/entity.js';

export class SmokeParticle extends Entity {
    constructor(game, x, y) {
        super(game, x, y, 8, 8); // Start with a small size
        this.layer = 'explosion'; // Render on the same layer as explosions
        this.sprite = this.game.assets.getImage('smokePuff');

        // Lifetime properties
        this.lifetime = 500 + Math.random() * 300; // Live for 500-800ms
        this.currentLife = this.lifetime;

        // Visual properties
        this.initialSize = 8;
        this.finalSize = 24;
        this.initialAlpha = 0.5;
    }

    update(deltaTime) {
        this.currentLife -= deltaTime;
        if (this.currentLife <= 0) {
            this.destroy();
        }
        super.update(deltaTime);
    }

    render(context) {
        if (!this.sprite) return;

        const lifePercent = this.currentLife / this.lifetime;

        // Interpolate size and alpha over the particle's life
        const currentSize = this.initialSize + (this.finalSize - this.initialSize) * (1 - lifePercent);
        context.globalAlpha = this.initialAlpha * lifePercent;

        context.drawImage(this.sprite, this.x - currentSize / 2, this.y - currentSize / 2, currentSize, currentSize);

        // Reset global alpha
        context.globalAlpha = 1.0;
    }
} 