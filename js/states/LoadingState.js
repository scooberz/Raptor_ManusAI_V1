import { logger } from '../utils/logger.js';

export class LoadingState {
    constructor(game) {
        this.game = game;
        this.loadingProgress = 0;
    }

    /**
     * The main entry point for the state. This will now reliably
     * load all assets and then transition to the next state.
     */
    async enter() {
        logger.info("--- Running Final, Corrected LoadingState ---");
        
        // Set up progress callback
        this.game.assets.setProgressCallback((progress) => {
            this.loadingProgress = progress / 100; // Convert percentage to 0-1 range
        });
        
        // Define all assets in the format expected by AssetManager
        // Only include assets that haven't been loaded yet
        const allAssets = {
            images: {
                // UI & Backgrounds (skip logo as it's already loaded in BootState)
                'menuBackground': 'assets/images/ui/menu_background.png',
                'hangarBackground': 'assets/images/ui/hangar_background.png',
                'shopBackground': 'assets/images/ui/shop_background.png',
                'characterSelectBackground': 'assets/images/ui/character_select_background.png',
                'cutscenePanel1': 'assets/images/ui/Raptor intro cutscene 1.png',
                'cutscenePanel2': 'assets/images/ui/Raptor intro cutscene 2.png',
                'healthBar': 'assets/images/ui/health_bar.png',
                'shieldBar': 'assets/images/ui/shield_bar.png',
                // Player Assets
                'playerShipBase': 'assets/images/player/player_ship_base.png',
                'playerShipLeft': 'assets/images/player/player_ship_left.png',
                'playerShipRight': 'assets/images/player/player_ship_right.png',
                'playerShipThrust': 'assets/images/player/player_ship_thrust.png',
                // Projectile Assets
                'enemyBullet': 'assets/images/projectiles/enemy_projectile.png',
                'MISSILE': 'assets/images/projectiles/player_missile.png',
                'enemyMissile': 'assets/images/projectiles/enemyMissile.png',
                // Enemy Assets
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
                // Environment & Backgrounds
                'backgroundLevel1': 'assets/images/environment/background_level1.png',
                'tileset_level1': 'assets/images/environment/tileset.png',
                'fuelTank': 'assets/images/environment/FUEL_TANK.png',
                'bunker': 'assets/images/environment/BUNKER.png',
                'radarDish': 'assets/images/environment/RADAR_DISH.png',
                // Effects & Collectibles
                'explosion1': 'assets/images/explosions/explosion_1.png',
                'shieldPickup': 'assets/images/collectibles/shield_pickup.png',
                'megabombPickup': 'assets/images/collectibles/megabomb_pickup.png',
            }
        };
        
        try {
            await this.game.assets.loadAssets(allAssets);
            logger.info("SUCCESS: All assets loaded. Transitioning state...");
            this.game.changeState('introCutscene');
        } catch (error) {
            logger.error("CRITICAL ERROR in LoadingState:", error);
            // Even if loading fails, try to continue to the next state
            this.game.changeState('introCutscene');
        }
    }

    render(contexts) {
        const ctx = contexts.ui;
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        const barWidth = this.game.width * 0.6;
        const barX = (this.game.width - barWidth) / 2;
        ctx.fillStyle = 'cyan';
        ctx.fillRect(barX, this.game.height / 2, barWidth * this.loadingProgress, 30);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Loading... ${Math.round(this.loadingProgress * 100)}%`, this.game.width / 2, this.game.height / 2 + 22);
    }

    update(deltaTime) {}
    exit() {}
} 