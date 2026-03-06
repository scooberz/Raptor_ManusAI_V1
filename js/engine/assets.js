/**
 * AssetManager class
 * Handles loading and managing game assets (images, audio, data)
 */
import { logger } from '../utils/logger.js';

class AssetManager {
    constructor() {
        this.images = {};
        this.audio = {};
        this.data = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.gameplayAssetsLoaded = false;
        this.onGameplayAssetsLoaded = null;
        this.assetList = { images: {}, audio: {}, data: {} };
    }

    loadImage(key, src) {
        if (this.images[key]) {
            logger.debug(`Image ${key} already loaded, skipping`);
            return Promise.resolve(this.images[key]);
        }

        this.totalAssets++;
        logger.debug(`Loading image: ${key} from ${src}`);

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';

            image.onload = () => {
                this.images[key] = image;
                this.loadedAssets++;
                this.notifyProgress();
                resolve(image);
            };

            image.onerror = (error) => {
                logger.error(`Failed to load image: ${src}`, error);
                reject(new Error(`Failed to load image: ${src}`));
            };

            image.src = src;
        });
    }

    loadJSON(key, src) {
        if (this.data[key]) {
            return Promise.resolve(this.data[key]);
        }

        this.totalAssets++;

        return fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load JSON: ${src}`);
                }
                return response.json();
            })
            .then(data => {
                this.data[key] = data;
                this.loadedAssets++;
                this.notifyProgress();
                return data;
            })
            .catch(error => {
                logger.error(`Failed to load JSON: ${src}`, error);
                throw error;
            });
    }

    async loadAssets(assets) {
        this.assetList = {
            images: { ...(this.assetList.images || {}), ...(assets.images || {}) },
            audio: { ...(this.assetList.audio || {}), ...(assets.audio || {}) },
            data: { ...(this.assetList.data || {}), ...(assets.data || {}) }
        };

        const promises = [];

        if (assets.images) {
            Object.entries(assets.images).forEach(([key, src]) => {
                promises.push(this.loadImage(key, src));
            });
        }

        if (assets.data) {
            Object.entries(assets.data).forEach(([key, src]) => {
                promises.push(this.loadJSON(key, src));
            });
        }

        return Promise.all(promises);
    }

    getImage(key) {
        return this.images[key];
    }

    getData(key) {
        return this.data[key];
    }

    isLoadingComplete() {
        return this.loadedAssets === this.totalAssets && this.totalAssets > 0;
    }

    getLoadingProgress() {
        return this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0;
    }

    notifyProgress() {
        if (this.onProgress) {
            this.onProgress(this.getLoadingProgress());
        }

        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }

    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    setCompleteCallback(callback) {
        this.onComplete = callback;
    }

    setGameplayAssetsLoadedCallback(callback) {
        this.onGameplayAssetsLoaded = callback;
    }

    async loadGameplayAssets() {
        logger.info('Starting background load of gameplay assets...');
        this.gameplayAssetsLoaded = false;

        const gameplayAssets = {
            images: {
                playerShipBase: 'assets/images/player/player_ship_base.png',
                playerShipLeft: 'assets/images/player/player_ship_left.png',
                playerShipRight: 'assets/images/player/player_ship_right.png',
                playerShipThrust: 'assets/images/player/player_ship_thrust.png',
                enemyFighter: 'assets/images/enemies/enemy_fighter.png',
                enemyStriker: 'assets/images/enemies/striker.png',
                enemyCyclone: 'assets/images/enemies/cyclone.png',
                enemyGnat: 'assets/images/enemies/gnat.png',
                enemyReaper: 'assets/images/enemies/reaper.png',
                enemyDart: 'assets/images/enemies/dart.png',
                enemyGoliath: 'assets/images/enemies/goliath.png',
                enemyCutter: 'assets/images/enemies/cutter.png',
                enemyMine: 'assets/images/enemies/mine.png',
                enemyTurret: 'assets/images/enemies/enemy_turret.png',
                bossLevel1: 'assets/images/enemies/boss_level1.png',
                playerBullet: 'assets/images/projectiles/player_bullet.png',
                enemyBullet: 'assets/images/projectiles/enemy_projectile.png',
                enemyMissile: 'assets/images/projectiles/enemyMissile.png',
                MISSILE: 'assets/images/projectiles/player_missile.png',
                backgroundLevel1: 'assets/images/environment/background_level1.png',
                backgroundLevel2: 'assets/images/environment/background_level2.png',
                tileset_level1: 'assets/images/environment/tileset.png',
                fuelTank: 'assets/images/environment/FUEL_TANK.png',
                bunker: 'assets/images/environment/BUNKER.png',
                radarDish: 'assets/images/environment/RADAR_DISH.png',
                explosion1: 'assets/images/explosions/explosion_1.png',
                explosion2: 'assets/images/explosions/explosion_2.png',
                impactEffect: 'assets/images/explosions/explosion_2.png',
                healthPickup: 'assets/images/collectibles/health_pickup.png',
                shieldPickup: 'assets/images/collectibles/shield_pickup.png',
                megabombPickup: 'assets/images/collectibles/megabomb_pickup.png',
                healthBar: 'assets/images/ui/health_bar.png',
                shieldBar: 'assets/images/ui/shield_bar.png'
            }
        };

        try {
            await this.loadAssets(gameplayAssets);
            this.gameplayAssetsLoaded = true;
            logger.info('Gameplay assets have been successfully loaded in the background.');

            if (this.onGameplayAssetsLoaded) {
                this.onGameplayAssetsLoaded();
            }
        } catch (error) {
            logger.error('Failed to load gameplay assets:', error);
        }
    }
}

export { AssetManager };
