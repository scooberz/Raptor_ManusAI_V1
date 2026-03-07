/**
 * Boss1 class
 * Authored first boss with telegraphed phases.
 */
import { Enemy } from './enemy.js';
import { HomingProjectile } from './homingProjectile.js';

class Boss1 extends Enemy {
    constructor(game, x, y, spriteKey) {
        super(game, x, y, 'boss1', spriteKey, 1400, 5000);

        this.width = 178;
        this.height = 117;
        this.isBoss = true;
        this.layer = 'enemy';
        this.moneyValue = 1200;
        this.maxHealth = this.health;
        this.canFire = false;
        this.movementUpdate = null;
        this.firingUpdate = null;
        this.updateBehavior = (_player, deltaTime) => {
            this.updatePhaseState();
            this.handleBossMovement(deltaTime);
            this.handleBossAttacks(deltaTime);
        };

        this.phase = 'entry';
        this.movementSpeed = 78;
        this.currentWaypointIndex = 0;
        this.pauseTimer = 0;
        this.attackState = null;
        this.attackCycleIndex = 0;
        this.volleyPortToggle = 0;
        this.phaseBanner = '';
        this.phaseBannerTimer = 0;
    }

    getBounds() {
        if (this.level && typeof this.level.getPlayableBounds === 'function') {
            return this.level.getPlayableBounds();
        }
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            return this.game.currentState.getPlayableBounds();
        }
        return { left: 0, top: 0, right: this.game.width, bottom: this.game.height };
    }

    getWaypoints() {
        const bounds = this.getBounds();
        return [
            { x: bounds.left + 110, y: bounds.top + 70 },
            { x: bounds.right - this.width - 110, y: bounds.top + 70 },
            { x: bounds.left + (bounds.right - bounds.left - this.width) / 2, y: bounds.top + 128 }
        ];
    }

    update(deltaTime) {
        if (!this.active) {
            return;
        }

        super.update(deltaTime);
    }

    updatePhaseState() {

        const healthRatio = this.health / Math.max(this.maxHealth, 1);

        if (this.phase === 'entry') {
            return;
        }

        if (healthRatio <= 0.35 && this.phase !== 'desperation') {
            this.phase = 'desperation';
            this.movementSpeed = 92;
            this.attackCycleIndex = 0;
            this.attackState = null;
            this.phaseBanner = 'DESPERATION ATTACK';
            this.phaseBannerTimer = 1400;
            return;
        }

        if (healthRatio <= 0.7 && this.phase === 'patrol') {
            this.phase = 'aggressive';
            this.movementSpeed = 84;
            this.attackCycleIndex = 0;
            this.attackState = null;
            this.phaseBanner = 'WEAPON PORTS OPEN';
            this.phaseBannerTimer = 1200;
        }
    }

    handleBossMovement(deltaTime) {

        const bounds = this.getBounds();
        const waypoints = this.getWaypoints();

        if (this.phase === 'entry') {
            this.velocityX = 0;
            this.velocityY = 90;
            const targetY = bounds.top + 56;
            if (this.y >= targetY) {
                this.y = targetY;
                this.velocityY = 0;
                this.phase = 'patrol';
                this.pauseTimer = 650;
                this.currentWaypointIndex = 2;
            }
            return;
        }

        if (this.pauseTimer > 0) {
            this.pauseTimer -= deltaTime;
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        const target = waypoints[this.currentWaypointIndex % waypoints.length];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= 6) {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % waypoints.length;
            this.pauseTimer = this.phase === 'desperation' ? 220 : 420;
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        this.velocityX = (dx / distance) * this.movementSpeed;
        this.velocityY = (dy / distance) * this.movementSpeed;
    }

    handleBossAttacks(deltaTime) {

        if (this.phase === 'entry') {
            return;
        }

        if (this.phaseBannerTimer > 0) {
            this.phaseBannerTimer -= deltaTime;
        }

        if (!this.attackState) {
            this.startNextAttack();
            return;
        }

        const state = this.attackState;
        if (state.telegraphTimer > 0) {
            state.telegraphTimer -= deltaTime;
            return;
        }

        state.shotTimer -= deltaTime;
        if (state.shotTimer > 0) {
            return;
        }

        this.fireAttackShot(state.name);
        state.shotsRemaining -= 1;

        if (state.shotsRemaining <= 0) {
            this.attackState = null;
            this.pauseTimer = Math.max(this.pauseTimer, state.recoveryMs || 360);
            return;
        }

        state.shotTimer = state.shotIntervalMs;
    }

    startNextAttack() {
        const patternMap = {
            patrol: ['cannon_fan', 'aimed_burst', 'missile_salvo'],
            aggressive: ['cannon_fan', 'cross_sweep', 'missile_salvo', 'aimed_burst'],
            desperation: ['ring_burst', 'missile_salvo', 'cross_sweep', 'cannon_fan']
        };

        const cycle = patternMap[this.phase] || patternMap.patrol;
        const attackName = cycle[this.attackCycleIndex % cycle.length];
        this.attackCycleIndex += 1;

        const attackConfigs = {
            cannon_fan: { telegraphMs: 650, shotsRemaining: this.phase === 'desperation' ? 3 : 2, shotIntervalMs: 420, recoveryMs: 320 },
            aimed_burst: { telegraphMs: 720, shotsRemaining: this.phase === 'aggressive' ? 5 : 4, shotIntervalMs: 130, recoveryMs: 360 },
            missile_salvo: { telegraphMs: 950, shotsRemaining: this.phase === 'desperation' ? 3 : 2, shotIntervalMs: 260, recoveryMs: 500 },
            cross_sweep: { telegraphMs: 820, shotsRemaining: 3, shotIntervalMs: 210, recoveryMs: 280 },
            ring_burst: { telegraphMs: 1100, shotsRemaining: 1, shotIntervalMs: 100, recoveryMs: 620 }
        };

        const config = attackConfigs[attackName];
        this.attackState = {
            name: attackName,
            telegraphTimer: config.telegraphMs,
            telegraphDuration: config.telegraphMs,
            shotTimer: 0,
            shotsRemaining: config.shotsRemaining,
            shotIntervalMs: config.shotIntervalMs,
            recoveryMs: config.recoveryMs
        };
    }

    fireAttackShot(attackName) {
        switch (attackName) {
            case 'cannon_fan':
                this.fireCannonFan();
                break;
            case 'aimed_burst':
                this.fireAimedBurstShot();
                break;
            case 'missile_salvo':
                this.fireHomingMissile();
                break;
            case 'cross_sweep':
                this.fireCrossSweep();
                break;
            case 'ring_burst':
                this.fireRingBurst();
                break;
            default:
                break;
        }
    }

    fireProjectile(x, y, velocityX, velocityY, damage = 12) {
        const sprite = this.game.assets.getImage('enemyBullet');
        const projectile = this.game.projectilePool.get();
        projectile.activate(x, y, velocityX, velocityY, damage, 'enemy', sprite);
        this.game.entityManager.add(projectile);
        this.game.collision.addToGroup(projectile, 'enemyProjectiles');
    }

    getGunPort(side = 'center') {
        if (side === 'left') {
            return { x: this.x + 36, y: this.y + this.height - 18 };
        }
        if (side === 'right') {
            return { x: this.x + this.width - 36, y: this.y + this.height - 18 };
        }
        return { x: this.x + this.width / 2, y: this.y + this.height - 20 };
    }

    fireCannonFan() {
        const player = this.game.player;
        if (!player) {
            return;
        }

        const origin = this.getGunPort('center');
        const targetX = player.x + player.width / 2;
        const targetY = player.y + player.height / 2;
        const centerAngle = Math.atan2(targetY - origin.y, targetX - origin.x);
        const speed = this.phase === 'desperation' ? 380 : 330;
        const offsets = [-0.36, -0.18, 0, 0.18, 0.36];

        offsets.forEach((offset) => {
            const angle = centerAngle + offset;
            this.fireProjectile(origin.x, origin.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 14);
        });
    }

    fireAimedBurstShot() {
        const player = this.game.player;
        if (!player) {
            return;
        }

        const side = this.volleyPortToggle % 2 === 0 ? 'left' : 'right';
        this.volleyPortToggle += 1;
        const origin = this.getGunPort(side);
        const targetX = player.x + player.width / 2;
        const targetY = player.y + player.height / 2;
        const angle = Math.atan2(targetY - origin.y, targetX - origin.x);
        const speed = this.phase === 'aggressive' ? 400 : 360;
        this.fireProjectile(origin.x, origin.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 12);
    }

    fireHomingMissile() {
        const player = this.game.player;
        if (!player) {
            return;
        }

        const side = this.volleyPortToggle % 2 === 0 ? 'left' : 'right';
        this.volleyPortToggle += 1;
        const origin = this.getGunPort(side);
        const missile = new HomingProjectile(this.game, origin.x, origin.y, 18, 32, 22, 'enemy', player, 210, 2.6);
        this.game.entityManager.add(missile);
        this.game.collision.addToGroup(missile, 'enemyProjectiles');
    }

    fireCrossSweep() {
        const leftPort = this.getGunPort('left');
        const rightPort = this.getGunPort('right');
        const speed = this.phase === 'desperation' ? 340 : 310;
        const angles = [0.9, 1.22, 1.54];

        angles.forEach((angle) => {
            this.fireProjectile(leftPort.x, leftPort.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 11);
            this.fireProjectile(rightPort.x, rightPort.y, -Math.cos(angle) * speed, Math.sin(angle) * speed, 11);
        });
    }

    fireRingBurst() {
        const origin = this.getGunPort('center');
        const bulletCount = 14;
        const speed = 260;
        for (let i = 0; i < bulletCount; i += 1) {
            const angle = (Math.PI * 2 * i) / bulletCount;
            this.fireProjectile(origin.x, origin.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 12);
        }
    }

    render(context) {
        super.render(context);
        this.renderTelegraph(context);
    }

    renderTelegraph(context) {
        if (!this.attackState || this.attackState.telegraphTimer <= 0) {
            return;
        }

        const progress = 1 - (this.attackState.telegraphTimer / Math.max(this.attackState.telegraphDuration, 1));
        const alpha = 0.2 + (Math.sin(progress * Math.PI * 6) + 1) * 0.2;
        context.save();
        context.globalAlpha = alpha;
        context.strokeStyle = '#ffcc00';
        context.lineWidth = 2;

        if (this.attackState.name === 'aimed_burst' || this.attackState.name === 'cannon_fan') {
            const player = this.game.player;
            if (player) {
                const origin = this.getGunPort('center');
                context.beginPath();
                context.moveTo(origin.x, origin.y);
                context.lineTo(player.x + player.width / 2, player.y + player.height / 2);
                context.stroke();
            }
        }

        if (this.attackState.name === 'missile_salvo' || this.attackState.name === 'cross_sweep') {
            ['left', 'right'].forEach((side) => {
                const port = this.getGunPort(side);
                context.fillStyle = 'rgba(255, 82, 82, 0.7)';
                context.fillRect(port.x - 6, port.y - 6, 12, 12);
            });
        }

        if (this.attackState.name === 'ring_burst') {
            const origin = this.getGunPort('center');
            context.beginPath();
            context.arc(origin.x, origin.y, 42, 0, Math.PI * 2);
            context.stroke();
        }

        if (this.phaseBannerTimer > 0 && this.phaseBanner) {
            context.fillStyle = '#ffcc00';
            context.font = 'bold 18px Arial';
            context.textAlign = 'center';
            context.fillText(this.phaseBanner, this.x + this.width / 2, this.y - 18);
        }

        context.restore();
    }
}

export { Boss1 };
