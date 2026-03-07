/**
 * DestructibleObject class
 * Represents scrolling destructible environmental objects.
 */
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { ImpactEffect } from './impactEffect.js';
import { getEnvironmentData } from '../../assets/data/environmentData.js';
import { logger } from '../utils/logger.js';

class DestructibleObject extends Entity {
    constructor(game, x, y, environmentType, options = {}) {
        const normalizedOptions = typeof options === 'string' ? { spriteKey: options } : (options || {});
        const envData = getEnvironmentData(environmentType);
        if (!envData) {
            throw new Error(`Unknown environment type: ${environmentType}`);
        }

        const width = normalizedOptions.width ?? envData.width;
        const height = normalizedOptions.height ?? envData.height;
        super(game, x, y, width, height);

        this.layer = 'environment';
        this.environmentType = environmentType;
        this.environmentData = envData;
        this.maxHealth = normalizedOptions.health ?? envData.health;
        this.health = this.maxHealth;
        this.scoreValue = normalizedOptions.scoreValue ?? envData.scoreValue;
        this.moneyValue = normalizedOptions.moneyValue ?? envData.moneyValue ?? 0;
        this.explosionSize = normalizedOptions.explosionSize ?? envData.explosionSize;
        this.chainExplosions = normalizedOptions.chainExplosions ?? envData.chainExplosions ?? 0;
        this.sectionId = normalizedOptions.sectionId || null;
        this.isLandmark = Boolean(normalizedOptions.landmark);
        this.tint = normalizedOptions.tint || null;

        const spriteKey = normalizedOptions.spriteKey || envData.spriteAsset;
        this.sprite = this.game.assets.getImage(spriteKey);
        if (this.sprite) {
            this.isReady = true;
        } else {
            logger.error(`Failed to load sprite with key "${spriteKey}" for environment object: ${environmentType}.`);
            this.isReady = false;
        }

        this.velocityX = 0;
        this.velocityY = 0;
        this.collisionGroup = 'environment';
        this.canTakeDamage = true;
        this.damaged = false;
        this.damageThreshold = this.maxHealth * 0.5;
    }

    update(deltaTime) {
        if (this.game.mainScrollSpeed) {
            this.y += this.game.mainScrollSpeed * (deltaTime / 1000);
        }

        super.update(deltaTime);

        if (this.y > this.game.height + this.height) {
            this.destroy();
        }

        if (this.health <= this.damageThreshold && !this.damaged) {
            this.damaged = true;
        }
    }

    takeDamage(damage, sourceProjectile = null) {
        if (!this.canTakeDamage || !this.active) {
            return false;
        }

        this.health -= damage;

        if (sourceProjectile && this.game.currentState && this.game.currentState.effectManager) {
            this.game.currentState.effectManager.add(new ImpactEffect(this.game, sourceProjectile.x, sourceProjectile.y));
        }

        if (this.health <= 0) {
            this.destroyObject();
            return true;
        }

        return false;
    }

    destroyObject() {
        const player = this.game.currentState?.player || this.game.player;
        const rewardMultiplier = this.game.getDifficultyProfile(this.game.playerData?.difficulty)?.rewardMultiplier || 1;
        if (player) {
            player.addScore(Math.max(0, Math.round(this.scoreValue * rewardMultiplier)));
            player.addMoney(Math.max(0, Math.round(this.moneyValue * rewardMultiplier)));
        }

        this.game.currentState?.recordGroundKill?.(this.environmentType, this);
        this.createExplosion();
        this.destroy();
    }

    createExplosion() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        let explosionWidth = 64;
        let explosionHeight = 64;
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
                break;
        }

        const explosion = new Explosion(
            this.game,
            centerX - explosionWidth / 2,
            centerY - explosionHeight / 2,
            explosionWidth,
            explosionHeight,
            { variant: this.explosionSize || 'medium' }
        );
        this.game.entityManager.add(explosion);
        const explosionSound = this.explosionSize === 'large' ? 'explosionLarge' : this.explosionSize === 'small' ? 'explosionSmall' : 'explosionMedium';
        this.game.audio.playSound(explosionSound, 0.05, centerX);

        if (this.explosionSize === 'large' || this.chainExplosions > 0) {
            this.createSecondaryExplosions(centerX, centerY, Math.max(3, this.chainExplosions));
        }
    }

    createSecondaryExplosions(centerX, centerY, count) {
        const radius = 40;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            setTimeout(() => {
                if (this.game.entityManager) {
                    const secondaryExplosion = new Explosion(this.game, centerX + offsetX - 24, centerY + offsetY - 24, 48, 48, { variant: 'small' });
                    this.game.entityManager.add(secondaryExplosion);
                }
            }, i * 120);
        }
    }

    render(context) {
        if (this.sprite) {
            context.save();
            if (this.damaged) {
                context.globalAlpha = 0.82;
                context.filter = 'sepia(100%) hue-rotate(-20deg) saturate(180%)';
            }

            context.drawImage(this.sprite, Math.floor(this.x), Math.floor(this.y), this.width, this.height);

            if (this.tint) {
                context.globalCompositeOperation = 'multiply';
                context.fillStyle = this.tint;
                context.globalAlpha = 0.18;
                context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
            }

            if (this.isLandmark) {
                context.globalCompositeOperation = 'screen';
                context.globalAlpha = 0.22;
                context.strokeStyle = '#ffcc66';
                context.lineWidth = 2;
                context.strokeRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
            }
            context.restore();
        } else {
            this.renderPlaceholder(context);
        }

        if (this.game.debug || this.game.hasSystem('targetingHud')) {
            this.renderHealthBar(context);
        }
    }

    renderPlaceholder(context) {
        let color = '#666666';
        switch (this.environmentType) {
            case 'FUEL_TANK':
            case 'FUEL_DEPOT':
            case 'REFINERY_TANK':
                color = '#FF6600';
                break;
            case 'RADAR_DISH':
            case 'COASTAL_RADAR':
            case 'REFINERY_RADAR':
            case 'COMMAND_RADAR':
                color = '#0066FF';
                break;
            case 'BUNKER':
            case 'SHORE_BUNKER':
            case 'BRIDGE_TURRET':
            case 'HARDENED_BUNKER':
                color = '#444444';
                break;
            default:
                break;
        }

        context.save();
        if (this.damaged) {
            context.globalAlpha = 0.7;
        }
        context.fillStyle = color;
        context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        context.fillStyle = '#FFFFFF';
        context.font = '10px Arial';
        context.textAlign = 'center';
        context.fillText(this.environmentType.substring(0, 4), Math.floor(this.x + this.width / 2), Math.floor(this.y + this.height / 2 + 3));
        context.restore();
    }

    renderHealthBar(context) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;
        context.fillStyle = '#FF0000';
        context.fillRect(barX, barY, barWidth, barHeight);
        const healthPercent = this.health / this.maxHealth;
        context.fillStyle = '#00FF00';
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
    }

    isOffScreen() {
        return false;
    }

    getInfo() {
        return {
            type: this.environmentType,
            name: this.environmentData.name,
            health: this.health,
            maxHealth: this.maxHealth,
            scoreValue: this.scoreValue,
            moneyValue: this.moneyValue,
            explosionSize: this.explosionSize,
            damaged: this.damaged,
            sectionId: this.sectionId,
            isLandmark: this.isLandmark
        };
    }
}

export { DestructibleObject };


