/**
 * Boss1 class
 * The first boss of the game.
 */
import { Enemy } from './enemy.js';
import { Projectile } from './projectile.js';
import { HomingProjectile } from './homingProjectile.js';

class Boss1 extends Enemy {
    constructor(game, x, y, spriteKey) {
        // Define the boss's stats to pass to the parent Enemy constructor.
        const health = 800;
        const scoreValue = 5000;
        const moneyValue = 1000;

        // Call the parent constructor CORRECTLY.
        // The Enemy constructor expects: (game, x, y, type, spriteKey, health, scoreValue)
        super(game, x, y, 'boss1', spriteKey, health, scoreValue);
        
        // --- Now, set properties specific to the Boss1 class ---

        // Override dimensions AFTER the parent constructor has run.
        this.width = 178;
        this.height = 117;

        // Set the critical flags and values.
        this.isBoss = true;
        this.layer = 'enemy';
        this.moneyValue = moneyValue;
        this.maxHealth = this.health; // Ensure maxHealth matches the real health.

        // Movement parameters
        this.movementSpeed = 50;
        this.movementDirection = 1;

        // Attack Pattern Cooldowns
        this.machineGunCooldown = 2000;
        this.lastMachineGunShot = 0;
        this.homingMissileCooldown = 7000;
        this.lastHomingMissileLaunch = 0;
        this.isBoss = true;
    }

    // The update method's only job is to run boss-specific logic,
    // and then call the parent Enemy's update method, which contains the death sequence.
    update(deltaTime) {
        // Run all boss-specific behaviors.
        this.handleMovement(deltaTime);
        this.handleAttacks(deltaTime);

        // Call the master update method from Enemy.js.
        // This is the essential line that runs the health checks and death sequence.
        super.update(deltaTime);
    }

    handleMovement(deltaTime) {
        // Simple side-to-side movement
        this.x += this.movementSpeed * this.movementDirection * (deltaTime / 1000);

        // Clamp position to stay on screen.
        if (this.x <= 0) {
            this.x = 0;
            this.movementDirection = 1;
        } else if (this.x + this.width >= this.game.width) {
            this.x = this.game.width - this.width;
            this.movementDirection = -1;
        }
        // Clamp y position near the top.
        if (this.y > 50) this.y = 50;
    }

    handleAttacks(deltaTime) {
        const now = this.game.currentState ? this.game.currentState.gameTime : 0; // Use level's gameTime

        if (now - this.lastMachineGunShot > this.machineGunCooldown) {
            this.lastMachineGunShot = now;
            this.fireMachineGun();
        }

        if (now - this.lastHomingMissileLaunch > this.homingMissileCooldown) {
            this.lastHomingMissileLaunch = now;
            this.launchHomingMissiles();
        }
    }

    fireMachineGun() {
        if (!this.game.player) return;

        const numProjectiles = 5;
        const spreadAngle = Math.PI / 6; // 30 degrees
        const projectileSpeed = 300;
        const projectileDamage = 10;
        
        const playerX = this.game.player.getCenter().x;
        const playerY = this.game.player.getCenter().y;
        const bossX = this.getCenter().x;
        const bossY = this.getCenter().y;
        
        const centerAngle = Math.atan2(playerY - bossY, playerX - bossX);
        const startAngle = centerAngle - spreadAngle / 2;

        for (let i = 0; i < numProjectiles; i++) {
            const angle = startAngle + (spreadAngle * i) / (numProjectiles - 1);
            
            const sprite = this.game.assets.getImage('enemyBullet');
            const projectile = this.game.projectilePool.get();
            projectile.activate(
                bossX, bossY,
                Math.cos(angle) * projectileSpeed, // velocityX
                Math.sin(angle) * projectileSpeed, // velocityY
                projectileDamage,
                'enemy',
                sprite
            );
            
            this.game.entityManager.add(projectile);
            this.game.collision.addToGroup(projectile, 'enemyProjectiles');
        }
    }

    launchHomingMissiles() {
        if (!this.game.player) return;
        const missileDamage = 25;
        const missileSpeed = 150;

        const missile1 = new HomingProjectile(this.game, this.x, this.y + this.height / 2, missileDamage, this.game.player, missileSpeed);
        const missile2 = new HomingProjectile(this.game, this.x + this.width, this.y + this.height / 2, missileDamage, this.game.player, missileSpeed);

        this.game.entityManager.add(missile1);
        this.game.entityManager.add(missile2);
        this.game.collision.addToGroup(missile1, 'enemyProjectiles');
        this.game.collision.addToGroup(missile2, 'enemyProjectiles');
    }

    render(context) {
        // The parent Entity.render() handles drawing the sprite.
        super.render(context);
    }
}

export { Boss1 };