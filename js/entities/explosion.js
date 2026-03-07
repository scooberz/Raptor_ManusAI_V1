/**
 * Explosion class
 * Represents layered explosion effects with optional intensity variants.
 */
import { Entity } from '../engine/entity.js';

class Explosion extends Entity {
    constructor(game, x, y, width, height, options = {}) {
        super(game, x, y, width, height);
        this.layer = 'explosion';
        this.options = typeof options === 'string' ? { size: options } : (options || {});
        this.variant = this.options.variant || this.options.size || this.inferVariant(width, height);
        this.coreColor = this.options.coreColor || this.getCoreColor();
        this.outerColor = this.options.outerColor || this.getOuterColor();
        this.maxFrames = this.variant === 'large' ? 8 : this.variant === 'medium' ? 7 : 6;
        this.frameTimer = 0;
        this.frameInterval = this.variant === 'large' ? 64 : 72;
        this.currentFrame = 0;
        this.flashAlpha = 0.95;
        this.sprites = [];
        this.loadSprites();
    }

    inferVariant(width, height) {
        const area = width * height;
        if (area >= 12000) return 'large';
        if (area >= 5000) return 'medium';
        return 'small';
    }

    getCoreColor() {
        switch (this.variant) {
            case 'large': return 'rgba(255, 236, 160, 0.95)';
            case 'medium': return 'rgba(255, 218, 120, 0.9)';
            default: return 'rgba(255, 205, 120, 0.85)';
        }
    }

    getOuterColor() {
        switch (this.variant) {
            case 'large': return 'rgba(255, 96, 36, 0.8)';
            case 'medium': return 'rgba(255, 118, 58, 0.74)';
            default: return 'rgba(255, 140, 88, 0.66)';
        }
    }

    loadSprites() {
        this.sprites.push(this.game.assets.getImage('explosion1'));
        this.sprites.push(this.game.assets.getImage('explosion2'));
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.currentFrame += 1;
            if (this.currentFrame >= this.maxFrames) {
                this.destroy();
            }
        }
    }

    render(context) {
        const progress = this.currentFrame / Math.max(this.maxFrames - 1, 1);
        this.renderShockwave(context, progress);
        this.renderSpriteBurst(context, progress);
        this.renderFlash(context, progress);
    }

    renderShockwave(context, progress) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = (Math.max(this.width, this.height) * 0.25) + (Math.max(this.width, this.height) * 0.6 * progress);
        context.save();
        context.globalCompositeOperation = 'lighter';
        context.strokeStyle = this.outerColor.replace(/0\.[0-9]+\)/, `${Math.max(0.1, 0.5 - progress * 0.4)})`);
        context.lineWidth = this.variant === 'large' ? 8 : this.variant === 'medium' ? 6 : 4;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
    }

    renderSpriteBurst(context, progress) {
        const sprite = this.sprites[Math.min(this.currentFrame, this.sprites.length - 1)];
        if (!sprite) {
            return;
        }

        const scale = 0.92 + progress * 0.35;
        const renderWidth = this.width * scale;
        const renderHeight = this.height * scale;
        const renderX = this.x - (renderWidth - this.width) / 2;
        const renderY = this.y - (renderHeight - this.height) / 2;

        context.save();
        context.globalCompositeOperation = 'lighter';
        context.globalAlpha = Math.max(0.22, 0.9 - progress * 0.7);
        context.drawImage(sprite, renderX, renderY, renderWidth, renderHeight);
        context.restore();
    }

    renderFlash(context, progress) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const innerRadius = Math.max(10, Math.min(this.width, this.height) * 0.18);
        const outerRadius = Math.max(this.width, this.height) * (0.45 + progress * 0.35);
        const gradient = context.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
        gradient.addColorStop(0, this.coreColor);
        gradient.addColorStop(0.45, this.outerColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        context.save();
        context.globalCompositeOperation = 'lighter';
        context.globalAlpha = Math.max(0.12, this.flashAlpha - progress * 0.78);
        context.fillStyle = gradient;
        context.fillRect(centerX - outerRadius, centerY - outerRadius, outerRadius * 2, outerRadius * 2);
        context.restore();
    }
}

export { Explosion };
