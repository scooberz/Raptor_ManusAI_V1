import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { Collectible } from './collectible.js';
import { logger } from '../utils/logger.js';

class Enemy extends Entity {
    constructor(game, x, y, type, spriteKey, health, scoreValue, collisionDamage) {
        const stats = Enemy.stats[type] || {};
        const width = stats.width || 48;
        const height = stats.height || 48;

        super(game, x, y, width, height);
        this.layer = 'enemy';
        this.game = game;

        this.type = type;
        this.health = health !== undefined ? health : (stats.health || 20);
        this.maxHealth = this.health;
        this.scoreValue = scoreValue !== undefined ? scoreValue : (stats.points || 100);
        this.moneyValue = stats.moneyValue || 25;
        this.collisionDamage = collisionDamage !== undefined ? collisionDamage : (stats.collisionDamage || 20);

        this.sprite = this.game.assets.getImage(spriteKey);
        if (this.sprite) {
            this.isReady = true;
        } else {
            logger.error(`Failed to load sprite with key "${spriteKey}" for enemy type "${this.type}".`);
            this.isReady = false;
        }

        this.velocityY = 100;
        this.pattern = 'straight';
        this.patternParams = {};
        this.canFire = false;
        this.fireRate = 0;
        this.lastFired = 0;

        this.hitTime = 0;
        this.hitDuration = 100;
        this.hit = false;
        this.hasEnteredPlayableArea = false;
    }

    takeDamage(damage) {
        this.health -= damage;
        this.hit = true;
        this.hitTime = 0;
    }

    update(deltaTime) {
        if (this.health <= 0 && this.active) {
            this.active = false;

            if (this.overrides && this.overrides.loot) {
                const loot = this.overrides.loot;
                const collectible = new Collectible(this.game, this.x, this.y, 30, 30, loot.type, loot.value);
                this.game.entityManager.add(collectible);
                this.game.collision.addToGroup(collectible, 'collectibles');
            } else {
                this.dropLoot();
            }

            if (this.game && this.game.player) {
                this.game.player.addScore(this.scoreValue);
                this.game.player.addMoney(this.moneyValue);
            }

            this.game.currentState?.recordAirKill?.(this.type, this);
            this.game.entityManager.add(new Explosion(this.game, this.x, this.y, this.width, this.height));

            if (this.isBoss && this.level) {
                this.level.bossDefeated = true;
            }

            return;
        }

        if (this.updateBehavior) {
            this.updateBehavior(this.game.player, deltaTime);
        } else {
            this.updateMovement(deltaTime);
        }

        if (this.canFire) {
            this.updateFiring(deltaTime);
        }

        if (this.hit) {
            this.hitTime += deltaTime;
            if (this.hitTime >= this.hitDuration) {
                this.hit = false;
                this.hitTime = 0;
            }
        }

        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            bounds = this.game.currentState.getPlayableBounds();
        }
        if (
            this.x + this.width > bounds.left &&
            this.x < bounds.right &&
            this.y + this.height > bounds.top &&
            this.y < bounds.bottom
        ) {
            this.hasEnteredPlayableArea = true;
        }
        if (
            this.hasEnteredPlayableArea &&
            (this.x + this.width < bounds.left ||
             this.x > bounds.right ||
             this.y + this.height < bounds.top ||
             this.y > bounds.bottom)
        ) {
            this.destroy();
            return;
        }
        super.update(deltaTime);
    }

    render(context) {
        let bounds = { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            bounds = this.game.currentState.getPlayableBounds();
        }
        if (
            this.x + this.width < bounds.left ||
            this.x > bounds.right ||
            this.y + this.height < bounds.top ||
            this.y > bounds.bottom
        ) {
            return;
        }
        super.render(context);

        if (this.game.hasSystem('targetingHud') && !this.isBoss && this.maxHealth > 0) {
            const barX = this.x;
            const barY = this.y - 6;
            context.save();
            context.fillStyle = 'rgba(0,0,0,0.7)';
            context.fillRect(barX, barY, this.width, 4);
            context.fillStyle = '#ff7a5e';
            context.fillRect(barX, barY, this.width * (this.health / Math.max(this.maxHealth, 1)), 4);
            context.restore();
        }
    }

    updateMovement(deltaTime) {
        if (this.movementUpdate) {
            this.movementUpdate(this, deltaTime);
        }
    }

    updateFiring(deltaTime) {
        if (this.firingUpdate) {
            this.firingUpdate(this, this.game.player, deltaTime);
        }
    }

    dropLoot() {
        const dropChance = 0.1;
        if (Math.random() < dropChance) {
            const lootTypes = ['health', 'megabomb'];
            const randomType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
            const value = randomType === 'health' ? 25 : 1;

            const collectible = new Collectible(this.game, this.x, this.y, 30, 30, randomType, value);
            this.game.entityManager.add(collectible);
            this.game.collision.addToGroup(collectible, 'collectibles');
        }
    }
}

Enemy.stats = {
    fighter: {
        health: 20,
        points: 100,
        collisionDamage: 20,
        width: 48,
        height: 48
    },
    striker: {
        health: 60,
        points: 100,
        moneyValue: 50,
        collisionDamage: 20,
        width: 64,
        height: 64
    },
    cyclone: {
        health: 60,
        points: 250,
        moneyValue: 100,
        collisionDamage: 30,
        width: 64,
        height: 64
    },
    gnat: {
        health: 30,
        points: 50,
        moneyValue: 25,
        collisionDamage: 10,
        width: 64,
        height: 64
    },
    reaper: {
        health: 90,
        points: 150,
        moneyValue: 75,
        collisionDamage: 25,
        width: 64,
        height: 64
    },
    dart: {
        health: 60,
        points: 125,
        moneyValue: 60,
        collisionDamage: 15,
        width: 64,
        height: 64
    },
    goliath: {
        health: 180,
        points: 500,
        moneyValue: 200,
        collisionDamage: 50,
        width: 96,
        height: 96
    },
    cutter: {
        health: 60,
        points: 200,
        moneyValue: 500,
        collisionDamage: 35,
        width: 64,
        height: 64
    },
    mine: {
        health: 20,
        points: 75,
        moneyValue: 10,
        collisionDamage: 40,
        width: 32,
        height: 32
    }
};

export { Enemy };
