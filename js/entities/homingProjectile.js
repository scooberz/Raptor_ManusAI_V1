/**
 * HomingProjectile class
 * A destructible missile that homes in on a target.
 */
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';

class HomingProjectile extends Entity {
    constructor(game, x, y, width, height, damage, owner, target, speed, turnRate) {
        super(game, x, y, width, height);
        this.layer = 'projectile';
        this.active = true;
        this.damage = damage;
        this.owner = owner;
        this.target = target;
        this.speed = speed;
        this.turnRate = turnRate;
        this.angle = Math.PI / 2;
        this.health = 10;
        this.maxHealth = 10;
        this.sprite = owner === 'player'
            ? this.game.assets.getImage('MISSILE')
            : this.game.assets.getImage('enemyMissile');
        this.isReady = true;
        this.color = owner === 'player' ? '#00ffff' : '#ff5876';
    }

    update(deltaTime) {
        if (!this.active) {
            return;
        }

        if (this.target && this.target.active) {
            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;
            const dx = targetX - (this.x + this.width / 2);
            const dy = targetY - (this.y + this.height / 2);
            const targetAngle = Math.atan2(dy, dx);

            let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            const maxTurn = this.turnRate * deltaTime / 1000;
            const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
            this.angle += turn;
        }

        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        super.update(deltaTime);

        if (this.y < -this.height || this.y > this.game.height + this.height || this.x < -this.width || this.x > this.game.width + this.width) {
            this.destroy();
        }
    }

    render(ctx) {
        if (!this.active) {
            return;
        }

        if (this.sprite) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
            const explosion = new Explosion(this.game, this.x + this.width / 2 - 16, this.y + this.height / 2 - 16, 32, 32);
            this.game.entityManager.add(explosion);
            this.game.audio.playSound('explosion');
        }
    }

    destroy() {
        this.active = false;
    }
}

export { HomingProjectile };
