/**
 * AssetManager class
 * Handles loading and managing game assets (images, audio, data)
 */
export class AssetManager {
    constructor() {
        this.images = {};
        this.audio = {}; // This will now be managed by AudioManager
        this.data = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.gameplayAssetsLoaded = false; // Track gameplay assets loading status
        this.onGameplayAssetsLoaded = null; // Callback when gameplay assets finish loading
        this.assetList = {}; // New property to store the full asset list
    }
    
    /**
     * Load an image asset
     * @param {string} key - The key to store the image under
     * @param {string} src - The source URL of the image
     * @returns {Promise} A promise that resolves when the image is loaded
     */
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            // This event fires when the image has been fully downloaded and is ready.
            image.onload = () => {
                console.log(`SUCCESS: Image with key '${key}' loaded successfully.`);
                this.images[key] = image;
                resolve(image);
            };

            // This event fires if there is a network error or the file is missing.
            image.onerror = () => {
                console.error(`ERROR: Failed to load image with key '${key}' from path: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };

            // Start the loading process
            image.src = src;
        });
    }

    /**
     * Load a JSON data asset
     * @param {string} key - The key to store the data under
     * @param {string} src - The source URL of the JSON data
     * @returns {Promise} A promise that resolves when the data is loaded
     */
    loadJSON(key, src) {
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
                console.error(`Failed to load JSON: ${src}`, error);
                throw error;
            });
    }
    
    /**
     * Load multiple assets at once
     * @param {Object} assets - Object containing assets to load
     * @returns {Promise} A promise that resolves when all assets are loaded
     */
    async loadAssets(assets) {
        this.assetList = assets; // Store the full asset list
        const promises = [];
        
        if (assets.images) {
            Object.entries(assets.images).forEach(([key, src]) => {
                promises.push(this.loadImage(key, src));
            });
        }
        
        // Define and load all new enemy sprites
        const enemySprites = {
            'enemyStriker': 'assets/images/enemies/striker.png',
            'enemyCyclone': 'assets/images/enemies/cyclone.png',
            'enemyGnat': 'assets/images/enemies/gnat.png',
            'enemyReaper': 'assets/images/enemies/reaper.png',
            'enemyDart': 'assets/images/enemies/dart.png',
            'enemyGoliath': 'assets/images/enemies/goliath.png',
            'enemyCutter': 'assets/images/enemies/cutter.png',
            'enemyMine': 'assets/images/enemies/mine.png'
        };

        Object.entries(enemySprites).forEach(([key, src]) => {
            promises.push(this.loadImage(key, src));
        });
        
        if (assets.data) {
            Object.entries(assets.data).forEach(([key, src]) => {
                promises.push(this.loadJSON(key, src));
            });
        }
        return Promise.all(promises);
    }
    
    /**
     * Get an image asset
     * @param {string} key - The key of the image to get
     * @returns {Image} The image asset
     */
    getImage(key) {
        if (!this.images[key]) {
            console.warn(`AssetManager: Image with key "${key}" was requested but not found or not yet loaded.`);
            return null;
        }
        return this.images[key];
    }
    
    /**
     * Get a data asset
     * @param {string} key - The key of the data to get
     * @returns {Object} The data asset
     */
    getData(key) {
        return this.data[key];
    }
    
    /**
     * Check if all assets are loaded
     * @returns {boolean} True if all assets are loaded
     */
    isLoadingComplete() {
        return this.loadedAssets === this.totalAssets && this.totalAssets > 0;
    }
    
    /**
     * Get the loading progress as a percentage
     * @returns {number} The loading progress (0-100)
     */
    getLoadingProgress() {
        return this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0;
    }
    
    /**
     * Notify progress callback if set
     */
    notifyProgress() {
        if (this.onProgress) {
            this.onProgress(this.getLoadingProgress());
        }
        
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }
    
    /**
     * Set a callback for loading progress
     * @param {Function} callback - The callback function
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
    
    /**
     * Set a callback for when all assets are loaded
     * @param {Function} callback - The callback function
     */
    setCompleteCallback(callback) {
        this.onComplete = callback;
    }
    
    /**
     * Set a callback for when gameplay assets finish loading
     * @param {Function} callback - The callback function
     */
    setGameplayAssetsLoadedCallback(callback) {
        this.onGameplayAssetsLoaded = callback;
    }
    
    /**
     * Load gameplay assets in the background
     * This method loads all the heavy assets needed for actual gameplay
     */
    async loadGameplayAssets() {
        console.log("Starting background load of gameplay assets...");
        this.gameplayAssetsLoaded = false;
        
        // Define all gameplay assets
        const gameplayAssets = {
            images: {
                // Player assets
                'playerShipBase': 'assets/images/player/player_ship_base.png',
                'playerShipLeft': 'assets/images/player/player_ship_left.png',
                'playerShipRight': 'assets/images/player/player_ship_right.png',
                'playerShipThrust': 'assets/images/player/player_ship_thrust.png',
                
                // Enemy assets
                'enemyFighter': 'assets/images/enemies/enemy_turret.png',
                'enemyStriker': 'assets/images/enemies/striker.png',
                'enemyCyclone': 'assets/images/enemies/cyclone.png',
                'enemyGnat': 'assets/images/enemies/gnat.png',
                'enemyReaper': 'assets/images/enemies/reaper.png',
                'enemyDart': 'assets/images/enemies/dart.png',
                'enemyGoliath': 'assets/images/enemies/goliath.png',
                'enemyCutter': 'assets/images/enemies/cutter.png',
                'enemyMine': 'assets/images/enemies/mine.png',
                'enemyTurret': 'assets/images/enemies/enemy_turret.png',
                'bossLevel1': 'assets/images/enemies/boss_level1.png',
                
                // Projectile assets
                'playerBullet': 'assets/images/projectiles/enemy_bullet.png',
                'enemyBullet': 'assets/images/projectiles/enemy_projectile.png',
                'enemyMissile': 'assets/images/projectiles/enemyMissile.png',
                'MISSILE': 'assets/images/projectiles/player_missile.png',
                
                // Environment assets
                'backgroundLevel1': 'assets/images/environment/background_level2.png',
                'backgroundLevel2': 'assets/images/environment/background_level2.png',
                
                // Destructible environment assets
                'fuelTank': 'assets/images/environment/FUEL_TANK.png',
                'bunker': 'assets/images/environment/BUNKER.png',
                'radarDish': 'assets/images/environment/RADAR_DISH.png',
                
                // Effects
                'explosion1': 'assets/images/explosions/explosion_2.png',
                'explosion2': 'assets/images/explosions/explosion_2.png',
                
                // Collectibles
                'healthPickup': 'assets/images/collectibles/shield_pickup.png',
                'shieldPickup': 'assets/images/collectibles/shield_pickup.png',
                'megabombPickup': 'assets/images/collectibles/megabomb_pickup.png',
                
                // UI assets
                'healthBar': 'assets/images/ui/health_bar.png',
                'shieldBar': 'assets/images/ui/shield_bar.png',
                'shopBackground': 'assets/images/ui/shop_background.png'
            }
        };
        
        try {
            await this.loadAssets(gameplayAssets);
            this.gameplayAssetsLoaded = true;
            console.log("Gameplay assets have been successfully loaded in the background.");
            
            // Notify callback if set
            if (this.onGameplayAssetsLoaded) {
                this.onGameplayAssetsLoaded();
            }
        } catch (error) {
            console.error("Failed to load gameplay assets:", error);
            // Don't throw error - let the game continue with partial assets
        }
    }

    /**
     * Load all assets with progress callback
     * @param {Array} assetList - Array of asset definitions {key, type, path}
     * @param {Function} onProgress - Progress callback (progress: 0.0-1.0)
     */
    async loadAll(assetList, onProgress) {
        let loadedAssets = 0;
        const totalAssets = assetList.length;
        const promises = assetList.map(asset =>
            this.load(asset.key, asset.type, asset.path)
                .then(loadedAsset => {
                    this.images[asset.key] = loadedAsset;
                    loadedAssets++;
                    if (onProgress) {
                        onProgress(loadedAssets / totalAssets);
                    }
                    console.log(`SUCCESS: Image with key '${asset.key}' loaded successfully.`);
                    return loadedAsset;
                })
                .catch(error => {
                    console.error(`Failed to load asset ${asset.key}:`, error);
                    // Allow other assets to continue loading
                    return null;
                })
        );
        await Promise.all(promises);
    }

    load(key, type, path) {
        // The 'load' method is now defined on the class instance
        switch (type) {
            case 'image':
                return new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
                    image.src = path;
                });
            // Add cases for 'audio' and 'json' if needed
            default:
                return Promise.reject(new Error(`Unknown asset type: ${type}`));
        }
    }
}
