import { Entity } from '../engine/entity.js';

export class ImpactEffect extends Entity {
    constructor(game, x, y) {
        super(game, x, y);
        this.sprite = this.game.assets.getImage('impactEffect');
        this.duration = 100; // Effect lasts for 100ms
        this.timer = 0;
        this.width = 16;
        this.height = 16;
        // Center the effect on the impact point
        this.x -= this.width / 2;
        this.y -= this.height / 2;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.duration) {
            this.active = false; // Mark for removal
        }
    }

    render(context) {
        if (this.sprite && this.active) {
            context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        }
    }
} 