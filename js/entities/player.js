/**
 * Player class
 * Represents the player's ship.
 */
import { Entity } from '../engine/entity.js';
import { Explosion } from './explosion.js';
import { logger } from '../utils/logger.js';

class Player extends Entity {
    constructor(game, x, y) {
        super(game, x, y, 64, 64);
        this.layer = 'player';

        this.shipProfile = this.game.getPlayerShipProfile(this.game.playerData?.shipId);
        this.speed = this.shipProfile.speed;
        this.health = this.shipProfile.maxHealth;
        this.maxHealth = this.shipProfile.maxHealth;
        this.shield = 0;
        this.maxShield = 0;
        this.money = 0;
        this.score = 0;
        this.collisionDamage = this.shipProfile.collisionDamage;

        this.weaponOrder = [];
        this.currentWeaponIndex = -1;
        this.currentWeapon = null;
        this.weapons = {
            CANNON: { name: 'Autocannon', fireRate: this.shipProfile.cannonFireRate, lastFired: 0, level: 1, damage: this.shipProfile.cannonDamage },
            MISSILE: { name: 'Missiles', fireRate: 715, lastFired: 0 }
        };
        this.unlockedWeapons = [];
        this.ownedSecondaryWeapons = [];
        this.equippedSecondaryWeapon = null;
        this.bulletSpacing = this.shipProfile.bulletSpacing;

        this.megabombs = 3;
        this.lastMegabombTime = 0;
        this.megabombCooldown = 1000;

        this.turnThreshold = 0.3;
        this.currentDirection = 0;

        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1000;
        this.blinkInterval = 100;
        this.visible = true;

        this.missileAutoFire = false;
        this.syncWithPlayerData();
    }

    getSpriteImage(key, fallbackKey) {
        return this.game.assets.getImage(key) || this.game.assets.getImage(fallbackKey) || null;
    }

    loadSprites() {
        const profile = this.shipProfile || this.game.getPlayerShipProfile(this.game.playerData?.shipId);
        const spriteKeys = profile.spriteKeys || {};
        this.sprites = {
            base: this.getSpriteImage(spriteKeys.base || 'playerShipBase', 'playerShipBase'),
            left: this.getSpriteImage(spriteKeys.left || 'playerShipLeft', 'playerShipLeft'),
            right: this.getSpriteImage(spriteKeys.right || 'playerShipRight', 'playerShipRight'),
            thrust: this.getSpriteImage(spriteKeys.thrust || 'playerShipThrust', 'playerShipThrust')
        };

        if (this.sprites.base && this.sprites.left && this.sprites.right) {
            this.isReady = true;
        } else {
            logger.error('Failed to load one or more player sprites. Player will not be rendered.');
        }
    }

    configurePrimaryWeapon() {
        const level = Math.max(1, Number(this.game.playerData?.primaryWeaponLevel) || 1);
        const ship = this.shipProfile;
        const weapon = this.weapons.CANNON;
        weapon.level = level;
        weapon.damage = ship.cannonDamage + (level - 1);
        weapon.fireRate = Math.max(ship.cannonUpgradeFloor, ship.cannonFireRate - ((level - 1) * 8));
        this.bulletSpacing = ship.bulletSpacing;
    }

    configureSecondaryWeapons() {
        const missileLoaderRank = this.game.getSystemRank('missileLoader');
        this.weapons.MISSILE.fireRate = Math.max(360, 715 - missileLoaderRank * 110);
    }

    syncWithPlayerData() {
        if (!this.game.playerData) {
            return;
        }

        this.shipProfile = this.game.getPlayerShipProfile(this.game.playerData.shipId);
        this.speed = this.shipProfile.speed;
        this.collisionDamage = this.shipProfile.collisionDamage;
        this.maxHealth = this.game.playerData.maxHealth ?? this.shipProfile.maxHealth;
        this.health = Math.min(this.maxHealth, this.game.playerData.health ?? this.shipProfile.maxHealth);
        this.maxShield = this.game.playerData.maxShield ?? 0;
        this.shield = Math.min(this.maxShield, this.game.playerData.shield ?? 0);
        this.money = this.game.playerData.money ?? 0;
        this.score = this.game.playerData.score ?? 0;
        this.megabombs = this.game.playerData.megabombs ?? 3;
        this.ownedSecondaryWeapons = Array.isArray(this.game.playerData.ownedSecondaryWeapons)
            ? [...new Set(this.game.playerData.ownedSecondaryWeapons)]
            : [];
        this.unlockedWeapons = [...this.ownedSecondaryWeapons];
        this.weaponOrder = [...this.ownedSecondaryWeapons];
        this.currentWeaponIndex = this.weaponOrder.length > 0 ? 0 : -1;
        this.currentWeapon = this.currentWeaponIndex >= 0 ? this.weaponOrder[this.currentWeaponIndex] : null;
        this.equippedSecondaryWeapon = this.game.playerData.equippedSecondaryWeapon || null;
        this.missileAutoFire = this.hasWeapon('MISSILE') ? this.missileAutoFire : false;
        this.configurePrimaryWeapon();
        this.configureSecondaryWeapons();
        logger.debug(`Player synced with playerData: ship=${this.shipProfile.id}, health=${this.health}, money=${this.money}`);
    }

    update(deltaTime) {
        this.handleMovement();
        this.handleWeapons();

        if (this.invulnerable) {
            this.invulnerabilityTime += deltaTime;
            this.visible = this.invulnerabilityTime % this.blinkInterval < this.blinkInterval / 2;

            if (this.invulnerabilityTime >= this.invulnerabilityDuration) {
                this.invulnerable = false;
                this.visible = true;
            }
        }

        super.update(deltaTime);
        this.clampToPlayableBounds();
    }

    clampToPlayableBounds() {
        const bounds = this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function'
            ? this.game.currentState.getPlayableBounds()
            : { left: 0, top: 0, right: this.game.width, bottom: this.game.height };

        if (this.x < bounds.left) this.x = bounds.left;
        if (this.x + this.width > bounds.right) this.x = bounds.right - this.width;
        if (this.y < bounds.top) this.y = bounds.top;
        if (this.y + this.height > bounds.bottom) this.y = bounds.bottom - this.height;
    }

    handleMovement() {
        const input = this.game.input;
        const left = input.isKeyPressed('ArrowLeft') || input.isKeyPressed('a');
        const right = input.isKeyPressed('ArrowRight') || input.isKeyPressed('d');
        const up = input.isKeyPressed('ArrowUp') || input.isKeyPressed('w');
        const down = input.isKeyPressed('ArrowDown') || input.isKeyPressed('s');

        let moveX = 0;
        let moveY = 0;

        if (left) moveX -= 1;
        if (right) moveX += 1;
        if (up) moveY -= 1;
        if (down) moveY += 1;

        const usingKeyboard = moveX !== 0 || moveY !== 0;
        if (usingKeyboard) {
            const length = Math.hypot(moveX, moveY) || 1;
            this.velocityX = (moveX / length) * this.speed;
            this.velocityY = (moveY / length) * this.speed;
            this.currentDirection = moveX === 0 ? 0 : (moveX > 0 ? 1 : -1);
        } else if (input.hasMouseMoved) {
            const mousePos = input.getMousePosition();
            const targetX = mousePos.x - this.width / 2;
            const targetY = mousePos.y - this.height / 2;
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.hypot(dx, dy);

            if (Math.abs(dx) > this.turnThreshold * this.width) {
                this.currentDirection = dx > 0 ? 1 : -1;
            } else {
                this.currentDirection = 0;
            }

            if (distance > 2) {
                const moveSpeed = Math.min(this.speed * 1.75, distance * 3.5);
                this.velocityX = (dx / distance) * moveSpeed;
                this.velocityY = (dy / distance) * moveSpeed;
            } else {
                this.velocityX = 0;
                this.velocityY = 0;
            }
        } else {
            this.velocityX = 0;
            this.velocityY = 0;
            this.currentDirection = 0;
        }

        this.clampToPlayableBounds();
    }

    handleWeapons() {
        const input = this.game.input;
        const now = Date.now();
        const primaryPressed = input.isMouseButtonPressed('left') || input.isKeyPressed(' ') || input.isKeyPressed('Control');
        const specialPressed = input.isKeyPressed('Shift');
        const hasMissiles = this.equippedSecondaryWeapon === 'MISSILE' && this.hasWeapon('MISSILE');

        if (primaryPressed) {
            const cannon = this.weapons.CANNON;
            if (now - cannon.lastFired >= cannon.fireRate) {
                this.fireCannon();
                cannon.lastFired = now;
            }

            if (hasMissiles && this.missileAutoFire) {
                const missile = this.weapons.MISSILE;
                if (now - missile.lastFired >= missile.fireRate) {
                    this.fireMissile();
                    missile.lastFired = now;
                }
            }
        }

        if (specialPressed && hasMissiles) {
            const missile = this.weapons.MISSILE;
            if (now - missile.lastFired >= missile.fireRate) {
                this.fireMissile();
                missile.lastFired = now;
            }
        }

        if ((input.wasKeyJustPressed('Alt') || input.wasMouseButtonJustPressed('middle')) && hasMissiles) {
            this.missileAutoFire = !this.missileAutoFire;
            logger.debug(`Missile auto-fire mode: ${this.missileAutoFire ? 'ON' : 'OFF'}`);
        }

        if (input.wasKeyJustPressed('b')) {
            if (this.megabombs > 0 && now - this.lastMegabombTime > this.megabombCooldown) {
                this.lastMegabombTime = now;
                this.fireMegabomb();
            }
        }
    }

    render(context) {
        if (!this.visible || !this.isReady) {
            return;
        }

        const sprite = this.currentDirection === -1 && this.sprites.left
            ? this.sprites.left
            : this.currentDirection === 1 && this.sprites.right
                ? this.sprites.right
                : this.sprites.base;

        context.save();
        context.globalCompositeOperation = 'source-over';
        context.drawImage(sprite, this.x, this.y, this.width, this.height);

        if (this.shipProfile?.tint) {
            context.globalCompositeOperation = 'screen';
            context.fillStyle = this.shipProfile.tint;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        context.restore();
    }

    fireCannon() {
        const bulletVelocityY = -1200;
        const bulletDamage = this.weapons.CANNON.damage;
        const bulletSprite = this.game.assets.getImage('playerBullet') || null;
        const bulletOriginY = this.y - 6;

        const leftBullet = this.game.projectilePool.get();
        if (leftBullet) {
            leftBullet.activate(this.x + this.width / 2 - this.bulletSpacing, bulletOriginY, 0, bulletVelocityY, bulletDamage, 'player', bulletSprite);
            this.game.entityManager.add(leftBullet);
            this.game.collision.addToGroup(leftBullet, 'playerProjectiles');
        }

        const rightBullet = this.game.projectilePool.get();
        if (rightBullet) {
            rightBullet.activate(this.x + this.width / 2 + this.bulletSpacing, bulletOriginY, 0, bulletVelocityY, bulletDamage, 'player', bulletSprite);
            this.game.entityManager.add(rightBullet);
            this.game.collision.addToGroup(rightBullet, 'playerProjectiles');
        }
    }

    fireMissile() {
        if (!this.hasWeapon('MISSILE') || this.equippedSecondaryWeapon !== 'MISSILE') {
            return;
        }

        const missileSpacing = 12;
        const missileDamage = 60;
        const initialVelocity = { x: 0, y: -50 };
        const missileSprite = this.game.assets.getImage('MISSILE');

        const leftMissile = this.game.missilePool.get();
        if (leftMissile) {
            leftMissile.activate(this.x + this.width / 2 - missileSpacing, this.y, missileDamage, 'player', initialVelocity, missileSprite);
            this.game.entityManager.add(leftMissile);
            this.game.collision.addToGroup(leftMissile, 'playerProjectiles');
        }

        const rightMissile = this.game.missilePool.get();
        if (rightMissile) {
            rightMissile.activate(this.x + this.width / 2 + missileSpacing, this.y, missileDamage, 'player', initialVelocity, missileSprite);
            this.game.entityManager.add(rightMissile);
            this.game.collision.addToGroup(rightMissile, 'playerProjectiles');
        }
    }

    fireMegabomb() {
        if (this.megabombs <= 0) {
            return;
        }

        this.megabombs--;

        const explosion = new Explosion(this.game, this.game.width / 2 - 128, this.game.height / 2 - 128, 256, 256);
        this.game.entityManager.add(explosion);

        const enemies = this.game.collision.collisionGroups.enemies;
        const enemyProjectiles = this.game.collision.collisionGroups.enemyProjectiles;

        enemies.forEach((enemy) => {
            enemy.takeDamage(100);
        });

        enemyProjectiles.forEach((projectile) => {
            projectile.destroy();
        });
        this.game.collision.collisionGroups.enemyProjectiles = [];

        this.game.audio.playSound('megabomb');
        if (this.game.playerData) {
            this.game.playerData.megabombs = this.megabombs;
        }
    }

    takeDamage(amount) {
        if (this.invulnerable) {
            return;
        }

        let remainingDamage = amount;
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, remainingDamage);
            this.shield -= absorbed;
            remainingDamage -= absorbed;
        }

        if (remainingDamage > 0) {
            this.health -= remainingDamage;
        }

        if (this.game.playerData) {
            this.game.playerData.health = this.health;
            this.game.playerData.shield = this.shield;
        }

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
            const explosion = new Explosion(this.game, this.x + this.width / 2 - 32, this.y + this.height / 2 - 32, 64, 64);
            this.game.entityManager.add(explosion);
            this.game.changeState('gameover');
        } else {
            this.invulnerable = true;
            this.invulnerabilityTime = 0;
        }

        this.game.audio.playSound('playerDamage');
    }

    addHealth(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        if (this.game.playerData) {
            this.game.playerData.health = this.health;
        }
    }

    collectHealthPickup(amount) {
        this.addHealth(amount);
    }

    addMoney(amount) {
        const salvageRank = this.game.getSystemRank('salvageUplink');
        const multiplier = 1 + salvageRank * 0.15;
        const adjustedAmount = Math.round(amount * multiplier);
        this.money += adjustedAmount;
        if (this.game.playerData) {
            this.game.playerData.money = this.money;
        }
    }

    addScore(amount) {
        this.score += amount;
        if (this.game.playerData) {
            this.game.playerData.score = this.score;
        }
    }

    addMegabomb() {
        this.megabombs++;
        if (this.game.playerData) {
            this.game.playerData.megabombs = this.megabombs;
        }
    }

    hasWeapon(weaponId) {
        return this.ownedSecondaryWeapons.includes(weaponId);
    }

    equipSecondaryWeapon(weaponId) {
        if (!this.hasWeapon(weaponId)) {
            return;
        }

        this.equippedSecondaryWeapon = weaponId;
        if (this.game.playerData) {
            this.game.playerData.equippedSecondaryWeapon = weaponId;
        }
    }

    unlockWeapon(weaponId) {
        if (!weaponId || this.hasWeapon(weaponId)) {
            this.equipSecondaryWeapon(weaponId);
            return;
        }

        this.ownedSecondaryWeapons.push(weaponId);
        this.unlockedWeapons = [...this.ownedSecondaryWeapons];
        this.weaponOrder = [...this.ownedSecondaryWeapons];
        this.equipSecondaryWeapon(weaponId);
        if (weaponId === 'MISSILE') {
            this.missileAutoFire = false;
        }
        if (this.game.playerData) {
            this.game.playerData.ownedSecondaryWeapons = [...this.ownedSecondaryWeapons];
            this.game.playerData.unlockedWeapons = [...this.ownedSecondaryWeapons];
        }
    }

    upgradePrimaryWeapon() {
        const currentLevel = Math.max(1, Number(this.game.playerData?.primaryWeaponLevel) || this.weapons.CANNON.level || 1);
        const nextLevel = Math.min(5, currentLevel + 1);
        if (this.game.playerData) {
            this.game.playerData.primaryWeaponLevel = nextLevel;
        }
        this.configurePrimaryWeapon();
    }
}

export { Player };
